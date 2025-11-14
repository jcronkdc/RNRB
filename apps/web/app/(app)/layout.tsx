import type { OrgSession } from "@cronkwaters/auth";
import { getOrgSession } from "@cronkwaters/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppChrome } from "../../components/app/AppChrome";

// eslint-disable-next-line import/no-default-export
export default async function AppLayout({ children }: { children: ReactNode }) {
  let orgSession: OrgSession | null = null;

  try {
    orgSession = await getOrgSession();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    // No authentication bypass - require proper authentication
    if (message === "UNAUTHENTICATED") {
      redirect("/auth");
    } else if (message === "NO_ACTIVE_ORG") {
      redirect("/onboarding/organization");
    } else {
      // Log the error for debugging
      console.error("Error in app layout:", error);
      
      // For database connection errors or other critical issues,
      // redirect to a maintenance page or show a friendly error
      if (message.includes("DATABASE_URL") || message.includes("PrismaClient")) {
        throw new Error("Database connection error. Please try again later.");
      }
      
      // Re-throw with a more user-friendly message
      throw new Error("An unexpected error occurred. Please try refreshing the page.");
    }
  }

  if (!orgSession) {
    redirect("/auth");
  }

  const userName = orgSession.session.user?.name ?? "CronkWaters Member";
  const userEmail = orgSession.session.user?.email ?? undefined;

  return (
    <AppChrome title="CronkWaters HQ" userName={userName} userEmail={userEmail}>
      {children}
    </AppChrome>
  );
}
