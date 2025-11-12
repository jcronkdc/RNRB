"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@cronkwaters/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cronkwaters/ui/dialog";
import { Input } from "@cronkwaters/ui/input";
import { Label } from "@cronkwaters/ui/label";
import { AlertCircle } from "lucide-react";
import { joinOrganizationAction } from "./actions";

interface JoinWithInviteDialogProps {
  children: React.ReactNode;
  userId: string;
}

export function JoinWithInviteDialog({ children, userId }: JoinWithInviteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await joinOrganizationAction(inviteCode.trim(), userId);
      
      if (result.success) {
        setOpen(false);
        router.refresh();
        router.push('/projects');
      } else {
        setError(result.error || "Failed to join organization");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Join Organization with Invite Code</DialogTitle>
            <DialogDescription>
              Enter the invite code you received to join an existing organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                placeholder="e.g., ABC123XYZ"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={isSubmitting}
                className="font-mono uppercase"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Invite codes are case-insensitive and typically 6-10 characters
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !inviteCode.trim()}>
              {isSubmitting ? "Joining..." : "Join Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
