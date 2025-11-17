"use server";

import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
import { revalidatePath } from "next/cache";

export async function requestProjectAccess(projectId: string) {
  const session = await auth();

  if (!session?.user || !session.activeMembership) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get the project and check if user already has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        org: true,
        songs: true,
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Check if user is already a member of the organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        orgId: project.orgId,
      },
    });

    if (membership) {
      return { success: true, message: "You already have access to this project" };
    }

    // Create a comment to track the access request
    await prisma.comment.create({
      data: {
        text: `Access Request: ${session.user.email || session.user.name || "User"} has requested access to this project.`,
        userId: session.user.id,
        entityId: projectId,
        entityType: "project",
      },
    });

    revalidatePath(`/p/${project.slug}`);

    return {
      success: true,
      message: "Access requested successfully. The project admins have been notified.",
    };
  } catch (error) {
    console.error("Error requesting project access:", error);
    return { success: false, error: "Failed to request access" };
  }
}
