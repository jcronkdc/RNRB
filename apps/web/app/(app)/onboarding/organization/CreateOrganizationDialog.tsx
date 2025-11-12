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
import { Textarea } from "@cronkwaters/ui/textarea";
import { AlertCircle, Copy, CheckCircle } from "lucide-react";
import { createOrganizationAction } from "./actions";

interface CreateOrganizationDialogProps {
  children: React.ReactNode;
  userId: string;
}

export function CreateOrganizationDialog({ children, userId }: CreateOrganizationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'create' | 'success'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  
  // Success data
  const [inviteCode, setInviteCode] = useState("");

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim() || !slug.trim()) {
      setError("Organization name and slug are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrganizationAction({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        userId
      });
      
      if (result.success) {
        setInviteCode(result.inviteCode!);
        setStep('success');
      } else {
        setError(result.error || "Failed to create organization");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    if (step === 'success') {
      router.refresh();
      router.push('/projects');
    }
    // Reset form
    setTimeout(() => {
      setStep('create');
      setName("");
      setSlug("");
      setDescription("");
      setError(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        {step === 'create' ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Set up a new organization to collaborate with your team.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name *</Label>
                <Input
                  id="org-name"
                  placeholder="e.g., Awesome Records"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-slug">URL Slug *</Label>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">cronkwaters.com/</span>
                  <Input
                    id="org-slug"
                    placeholder="awesome-records"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be your organization's unique URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-description">Description (optional)</Label>
                <Textarea
                  id="org-description"
                  placeholder="What's your organization about?"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
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
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim() || !slug.trim()}>
                {isSubmitting ? "Creating..." : "Create Organization"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <DialogTitle>Organization Created!</DialogTitle>
              </div>
              <DialogDescription>
                Your organization has been created successfully.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-6">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <p className="text-sm font-medium">Share this invite code with your team:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-background rounded font-mono text-lg text-center">
                    {inviteCode}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyInviteCode}
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This code expires in 7 days. You can generate new codes from your organization settings.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Go to Projects
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
