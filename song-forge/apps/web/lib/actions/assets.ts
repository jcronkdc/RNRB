"use server";

import { requireOrgSession } from "@cronkwaters/auth";
import {
  createAssetSchema,
  updateAssetSchema,
  getAssetTypeFromMime,
  createAsset,
  updateAsset,
  deleteAsset,
  listAssets,
  getAssetById,
} from "@cronkwaters/db";
import { revalidatePath } from "next/cache";

import { validateCSRFToken } from "../csrf";
import { isStorageConfigured } from "../env";
import { rateLimitMiddleware } from "../rate-limit";
import { sanitizeUserInput } from "../sanitization";
import { getUploadUrl, getDownloadUrl, deleteObject } from "../storage/s3";
import { validateFileUpload, sanitizeFilePath } from "../validation/file-upload";
import { createWatermarkMetadata } from "../watermarking";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get presigned upload URL
 */
export async function getUploadUrlAction(
  filename: string,
  contentType: string,
  contentLength: number,
  checksum?: string,
): Promise<ActionResult<{ url: string; key: string }>> {
  try {
    // SECURITY: CSRF Protection
    const csrfValid = await validateCSRFToken();
    if (!csrfValid) {
      return {
        success: false,
        error: "Invalid CSRF token",
      };
    }

    // SECURITY: Rate Limiting
    await rateLimitMiddleware("upload");

    await requireOrgSession();

    if (!isStorageConfigured()) {
      return {
        success: false,
        error: "Storage not configured",
      };
    }

    // SECURITY: Validate filename
    const filenameValidation = validateFileUpload(filename, contentType, contentLength, "other");
    if (!filenameValidation.valid) {
      return {
        success: false,
        error: filenameValidation.error || "Invalid file",
      };
    }

    // SECURITY: Sanitize filename and generate safe storage key
    const sanitizedFilename = sanitizeFilePath(filename);
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const extension = sanitizedFilename.split(".").pop() || "";
    const key = `uploads/${timestamp}-${random}.${extension}`;

    const assetType = getAssetTypeFromMime(contentType);

    // SECURITY: Validate file size for asset type
    const sizeValidation = validateFileUpload(
      sanitizedFilename,
      contentType,
      contentLength,
      assetType,
    );
    if (!sizeValidation.valid) {
      return {
        success: false,
        error: sizeValidation.error || "File validation failed",
      };
    }

    // BUG FIX: Add watermark for audio files
    const uploadMetadata: Record<string, string> = {
      originalFilename: filename,
      assetType,
    };

    // Add watermark for audio assets
    if (assetType === "audio") {
      const session = await requireOrgSession();
      const userId = (session.session.user as { id?: string })?.id;
      if (!userId) {
        throw new Error("User ID not found in session");
      }
      const watermarkMeta = createWatermarkMetadata(
        userId,
        undefined, // projectId not available at upload time
        undefined, // assetId not created yet
      );
      uploadMetadata.watermark = watermarkMeta.watermark;
      uploadMetadata.watermarkTimestamp = watermarkMeta.timestamp.toString();
    }

    const result = await getUploadUrl({
      key,
      contentType,
      contentLength,
      checksum,
      metadata: uploadMetadata,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate upload URL",
    };
  }
}

/**
 * Create asset record after upload
 */
export async function createAssetAction(
  projectSlug: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    // SECURITY: CSRF Protection
    const csrfValid = await validateCSRFToken();
    if (!csrfValid) {
      return {
        success: false,
        error: "Invalid CSRF token",
      };
    }

    // SECURITY: Rate Limiting
    await rateLimitMiddleware("serverAction");

    const session = await requireOrgSession();
    const validated = createAssetSchema.parse(input);

    // SECURITY: Sanitize user inputs
    if (validated.name) {
      validated.name = sanitizeUserInput(validated.name);
    }

    // If projectSlug provided, verify it exists and belongs to org
    let projectId: string | undefined;
    if (projectSlug) {
      if (!session.activeMembership) {
        return {
          success: false,
          error: "Active organization not found",
        };
      }
      const { getProjectBySlug } = await import("@cronkwaters/db");
      const project = await getProjectBySlug(projectSlug, session.activeMembership.org.id);
      if (!project) {
        return {
          success: false,
          error: "Project not found",
        };
      }
      projectId = project.id;
    }

    // BUG FIX: Add watermark metadata for audio files
    let assetMetadata = validated.metadata;
    if (validated.assetType === "audio" && !assetMetadata?.watermark) {
      const userId = (session.session.user as { id?: string })?.id;
      if (!userId) {
        throw new Error("User ID not found in session");
      }
      const watermarkMeta = createWatermarkMetadata(
        userId,
        projectId,
        undefined, // assetId not created yet
      );
      assetMetadata = {
        ...(assetMetadata || {}),
        watermark: watermarkMeta.watermark,
        watermarkTimestamp: watermarkMeta.timestamp,
      };
    }

    const asset = await createAsset({
      ...validated,
      projectId,
      bytes: BigInt(validated.bytes),
      metadata: assetMetadata,
    });

    if (projectSlug) {
      revalidatePath(`/app/projects/${projectSlug}`);
    }
    revalidatePath("/app/assets");

    return {
      success: true,
      data: { id: asset.id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create asset",
    };
  }
}

/**
 * Get download URL for asset
 */
export async function getAssetDownloadUrlAction(
  assetId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    await requireOrgSession();

    const asset = await getAssetById(assetId);
    if (!asset) {
      return {
        success: false,
        error: "Asset not found",
      };
    }

    if (!isStorageConfigured()) {
      return {
        success: false,
        error: "Storage not configured",
      };
    }

    const url = await getDownloadUrl(asset.storageKey, {
      expiresIn: 3600,
      filename: asset.name,
    });

    return {
      success: true,
      data: { url },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get download URL",
    };
  }
}

/**
 * Update asset
 */
export async function updateAssetAction(
  assetId: string,
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    const session = await requireOrgSession();
    const validated = updateAssetSchema.parse(input);

    if (!session.activeMembership) {
      return {
        success: false,
        error: "Active organization not found",
      };
    }

    await updateAsset(assetId, validated, session.activeMembership.org.id);

    revalidatePath("/app/assets");
    revalidatePath("/app/projects");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update asset",
    };
  }
}

/**
 * Delete asset
 */
export async function deleteAssetAction(assetId: string): Promise<ActionResult<void>> {
  try {
    // SECURITY: CSRF Protection
    const csrfValid = await validateCSRFToken();
    if (!csrfValid) {
      return {
        success: false,
        error: "Invalid CSRF token",
      };
    }

    // SECURITY: Rate Limiting
    await rateLimitMiddleware("serverAction");

    const session = await requireOrgSession();

    if (!session.activeMembership) {
      return {
        success: false,
        error: "Active organization not found",
      };
    }

    const asset = await getAssetById(assetId);
    if (!asset) {
      return {
        success: false,
        error: "Asset not found",
      };
    }

    // Delete from storage if configured
    if (isStorageConfigured()) {
      try {
        await deleteObject(asset.storageKey);
      } catch (error) {
        console.error("Failed to delete from storage:", error);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database with org validation
    await deleteAsset(assetId, session.activeMembership.org.id);

    revalidatePath("/app/assets");
    revalidatePath("/app/projects");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete asset",
    };
  }
}

/**
 * List assets for a project
 */
export async function listAssetsAction(projectSlug: string) {
  try {
    const session = await requireOrgSession();
    if (!session.activeMembership) {
      return {
        success: false,
        error: "Active organization not found",
        data: [],
      };
    }

    const { getProjectBySlug } = await import("@cronkwaters/db");
    const project = await getProjectBySlug(projectSlug, session.activeMembership.org.id);
    if (!project) {
      return {
        success: false,
        error: "Project not found",
        data: [],
      };
    }

    const assets = await listAssets(project.id);

    return {
      success: true,
      data: assets.map(
        (a: {
          id: string;
          name: string;
          assetType: string;
          bytes: bigint;
          mimeType: string;
          createdAt: Date;
        }) => ({
          id: a.id,
          name: a.name,
          type: a.assetType,
          bytes: Number(a.bytes),
          mimeType: a.mimeType,
          createdAt: a.createdAt.toISOString(),
        }),
      ),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list assets",
      data: [],
    };
  }
}
