"use client";

import { Button } from "@cronkwaters/ui";
import { useState } from "react";

import { requestProjectAccess } from "./actions";

interface RequestAccessButtonProps {
  projectId: string;
  userId?: string;
}

export function RequestAccessButton({ projectId, userId }: RequestAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "requested" | "error">("idle");

  const handleRequestAccess = async () => {
    if (!userId) {
      // Redirect to auth if not logged in
      window.location.href = `/auth?redirect=/p/${projectId}`;
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestProjectAccess(projectId);
      if (result.success) {
        setStatus("requested");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "requested") {
    return <Button disabled>Access Requested ✓</Button>;
  }

  return (
    <Button onClick={handleRequestAccess} disabled={isLoading}>
      {isLoading ? "Requesting..." : "Request Access"}
    </Button>
  );
}
