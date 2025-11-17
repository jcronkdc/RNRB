import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";

import { validateFileUpload } from "@/lib/validation/file-upload";


export async function POST(request: Request) {
  try {
    // Authentication
    const session = await auth();

    if (!session?.user || !session.activeMembership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    const orgId = session.activeMembership.orgId;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string | null;
    const name = (formData.get("name") as string) || file?.name || "Untitled";
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine asset type from MIME type first (needed for validation)
    let assetType: "audio" | "lyric" | "image" | "pdf" | "chart" | "video" | "other" = "other";
    if (file.type.startsWith("audio/")) assetType = "audio";
    else if (file.type.startsWith("image/")) assetType = "image";
    else if (file.type.startsWith("video/")) assetType = "video";
    else if (file.type.includes("pdf")) assetType = "pdf";
    else if (file.type.includes("text")) assetType = "lyric";

    // Validate file
    const validationResult = validateFileUpload(file.name, file.type, file.size, assetType);

    if (!validationResult.valid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    // Generate safe file name
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    const timestamp = Date.now();
    const safeFileName = `${orgId}/${timestamp}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    // Use Supabase for storage (can be swapped with Vercel Blob or S3)
    const supabase = await createClient();
    const storageBucket = assetType === "audio" ? "audio" : "assets";

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(safeFileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(storageBucket).getPublicUrl(safeFileName);

    // Generate checksum
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32);

    // Save asset record to database
    const asset = await prisma.asset.create({
      data: {
        projectId: projectId || undefined,
        name,
        mimeType: file.type,
        fileType: file.type.split("/")[1] || undefined,
        bytes: BigInt(file.size),
        size: file.size,
        storageKey: safeFileName,
        storageBucket,
        checksum,
        assetType,
        uploadedById: user.id,
        metadata: {
          originalName: file.name,
          uploadTimestamp: timestamp,
          publicUrl,
          description,
        },
      },
      include: {
        uploadedBy: true,
        project: true,
      },
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        name: asset.name,
        url: publicUrl,
        type: assetType,
        size: asset.size || 0,
        mimeType: asset.mimeType,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
