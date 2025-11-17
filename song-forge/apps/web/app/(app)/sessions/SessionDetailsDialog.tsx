"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
 Badge , Button } from "@cronkwaters/ui";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteSessionAction } from "@/lib/actions/sessions";

interface SessionDetailsDialogProps {
  session: {
    id: string;
    title: string;
    type: string;
    status: string;
    startTime: Date;
    endTime: Date;
    location?: string | null;
    notes?: string | null;
    project: {
      id: string;
      name: string;
    };
    attendees: Array<{
      id: string;
      role: string;
      status: string;
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    }>;
    createdBy: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  currentUserId: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

export function SessionDetailsDialog({
  session,
  currentUserId,
  children,
  onEdit,
}: SessionDetailsDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOrganizer = session.createdBy.id === currentUserId;
  const isActive =
    new Date() >= new Date(session.startTime) && new Date() <= new Date(session.endTime);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteSessionAction({ sessionId: session.id });

      if (result.data?.success) {
        setOpen(false);
        router.refresh();
      } else {
        console.error("Failed to delete session:", result.error);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleJoinSession() {
    // For now, just open a Google Meet or Zoom link if available
    if (session.location?.includes("meet.google.com") || session.location?.includes("zoom.us")) {
      window.open(session.location, "_blank");
    } else {
      // In the future, this could open an in-app collaboration space
      router.push(`/sessions/${session.id}/live`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{session.title}</DialogTitle>
            {isOrganizer && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setOpen(false);
                      onEdit();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <DialogDescription>
            {session.project.name} • {format(new Date(session.startTime), "EEEE, MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and Type */}
          <div className="flex items-center gap-2">
            <Badge variant={session.status === "confirmed" ? "success" : "subtle"}>
              {session.status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {session.type}
            </Badge>
            {isActive && (
              <Badge variant="warning" className="bg-orange-500 text-white">
                In Progress
              </Badge>
            )}
          </div>

          {/* Time & Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span>
                {format(new Date(session.startTime), "h:mm a")} -{" "}
                {format(new Date(session.endTime), "h:mm a")}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span>{format(new Date(session.startTime), "EEEE, MMMM d, yyyy")}</span>
            </div>

            {session.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span>{session.location}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Notes</h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">{session.notes}</p>
            </div>
          )}

          {/* Attendees */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4" />
              Attendees ({session.attendees.length})
            </h3>
            <div className="space-y-2">
              {session.attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{attendee.user.name || attendee.user.email}</span>
                    {attendee.role === "organizer" && (
                      <Badge variant="subtle" className="ml-2 text-xs">
                        Organizer
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant={
                      attendee.status === "confirmed"
                        ? "success"
                        : attendee.status === "declined"
                          ? "danger"
                          : "subtle"
                    }
                    className="text-xs"
                  >
                    {attendee.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            {isActive ? (
              <Button onClick={handleJoinSession} className="flex-1">
                <Video className="mr-2 h-4 w-4" />
                Join Session
              </Button>
            ) : (
              <Button variant="outline" className="flex-1">
                Add to Calendar
              </Button>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="bg-background max-w-sm rounded-lg border p-6 shadow-lg">
              <h3 className="mb-2 text-lg font-semibold">Delete Session?</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                This will permanently delete the session and notify all attendees. This action
                cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Session"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
