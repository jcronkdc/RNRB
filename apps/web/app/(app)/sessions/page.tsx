import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@cronkwaters/ui";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday,
  isPast,
  isFuture,
} from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Music,
  Video,
  Mic2,
  AlertCircle,
} from "lucide-react";
import { redirect } from "next/navigation";

import { CreateSessionDialog } from "./CreateSessionDialog";
import { SessionDetailsDialog } from "./SessionDetailsDialog";

export const dynamic = "force-dynamic";

async function getOrgData(orgId: string) {
  const [sessions, projects] = await Promise.all([
    prisma.studioSession.findMany({
      where: {
        project: {
          orgId,
        },
      },
      include: {
        project: true,
        attendees: {
          include: {
            user: true,
          },
        },
        createdBy: true,
      },
      orderBy: {
        startTime: "asc",
      },
    }),
    prisma.project.findMany({
      where: {
        orgId,
        status: "active",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  // Group sessions by status
  const upcoming = sessions.filter((s) => isFuture(s.startTime));
  const past = sessions.filter((s) => isPast(s.endTime));
  const current = sessions.filter((s) => !isPast(s.endTime) && !isFuture(s.startTime));

  return { sessions, upcoming, past, current, projects };
}

function getSessionTypeIcon(type: string) {
  switch (type) {
    case "writing":
      return Mic2;
    case "recording":
      return Music;
    case "meeting":
      return Video;
    case "rehearsal":
      return Users;
    default:
      return Calendar;
  }
}

function getSessionTypeColor(type: string) {
  switch (type) {
    case "writing":
      return "text-blue-600 bg-blue-50";
    case "recording":
      return "text-red-600 bg-red-50";
    case "meeting":
      return "text-green-600 bg-green-50";
    case "rehearsal":
      return "text-purple-600 bg-purple-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

// eslint-disable-next-line import/no-default-export
export default async function SessionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (!session.activeMembership?.orgId) {
    redirect("/organizations");
  }

  const { sessions, upcoming, past, current, projects } = await getOrgData(
    session.activeMembership.orgId,
  );

  // Generate calendar view data
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const daySessions = sessions.filter((s) => isSameDay(s.startTime, day));
    weekDays.push({ date: day, sessions: daySessions });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-brand-muted-foreground text-xs uppercase tracking-[0.28em]">Sessions</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-brand-foreground text-2xl font-semibold sm:text-3xl">
              Studio Calendar
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
              Schedule writing rooms, rehearsals, and listening parties. Syncs with shared calendars
              and surfaces prep notes automatically.
            </p>
          </div>
          <CreateSessionDialog orgId={session.activeMembership.orgId} projects={projects}>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </CreateSessionDialog>
        </div>
      </header>

      {/* Current Session Alert */}
      {current.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Session in Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {current.map((studioSession) => (
              <div key={studioSession.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{studioSession.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {studioSession.project.name} • Ends {format(studioSession.endTime, "h:mm a")}
                  </p>
                </div>
                <SessionDetailsDialog
                  session={studioSession}
                  currentUserId={session.user?.id || ""}
                >
                  <Button variant="outline" size="sm">
                    Join Session
                  </Button>
                </SessionDetailsDialog>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Week View Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
          <CardDescription>
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(({ date, sessions: daySessions }) => (
              <div
                key={date.toISOString()}
                className={`min-h-[120px] rounded-lg border p-3 ${
                  isToday(date) ? "border-brand-primary bg-brand-primary/5" : ""
                }`}
              >
                <div className="mb-2 text-sm font-medium">
                  {format(date, "EEE")}
                  <span className="text-muted-foreground ml-1">{format(date, "d")}</span>
                  {isToday(date) && (
                    <Badge variant="subtle" className="ml-2 text-xs">
                      Today
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {daySessions.map((studioSession) => {
                    const Icon = getSessionTypeIcon(studioSession.type);
                    const colorClass = getSessionTypeColor(studioSession.type);
                    return (
                      <SessionDetailsDialog
                        key={studioSession.id}
                        session={studioSession}
                        currentUserId={session.user?.id || ""}
                      >
                        <div
                          className={`cursor-pointer rounded p-1 text-xs hover:opacity-80 ${colorClass}`}
                        >
                          <div className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            <span className="truncate">
                              {format(studioSession.startTime, "h:mm")}
                            </span>
                          </div>
                          <p className="truncate font-medium">{studioSession.title}</p>
                        </div>
                      </SessionDetailsDialog>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No upcoming sessions</h3>
              <p className="text-muted-foreground mb-4">
                Schedule your next studio session to keep the momentum going
              </p>
              <CreateSessionDialog orgId={session.activeMembership.orgId} projects={projects}>
                <Button variant="outline">Schedule Session</Button>
              </CreateSessionDialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((studioSession) => {
              const Icon = getSessionTypeIcon(studioSession.type);
              const colorClass = getSessionTypeColor(studioSession.type);

              return (
                <Card key={studioSession.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{studioSession.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {studioSession.project.name}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(studioSession.startTime, "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(studioSession.startTime, "h:mm a")} -{" "}
                              {format(studioSession.endTime, "h:mm a")}
                            </span>
                          </div>
                          {studioSession.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{studioSession.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Users className="text-muted-foreground h-3 w-3" />
                          <div className="flex -space-x-2">
                            {studioSession.attendees.slice(0, 4).map((attendee) => (
                              <div
                                key={attendee.id}
                                className="bg-muted border-background flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-medium"
                              >
                                {attendee.user.name?.charAt(0) || attendee.user.email.charAt(0)}
                              </div>
                            ))}
                            {studioSession.attendees.length > 4 && (
                              <div className="bg-muted border-background flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-medium">
                                +{studioSession.attendees.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={studioSession.status === "confirmed" ? "success" : "subtle"}>
                        {studioSession.status}
                      </Badge>
                      <SessionDetailsDialog
                        session={studioSession}
                        currentUserId={session.user?.id || ""}
                      >
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </SessionDetailsDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-muted-foreground text-xl font-semibold">Past Sessions</h2>
          <div className="grid gap-3 opacity-60">
            {past.slice(0, 3).map((studioSession) => (
              <Card key={studioSession.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{studioSession.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {format(studioSession.startTime, "MMM d, yyyy")} •{" "}
                      {studioSession.attendees.length} attendees
                    </p>
                  </div>
                  <SessionDetailsDialog
                    session={studioSession}
                    currentUserId={session.user?.id || ""}
                  >
                    <Button size="sm" variant="ghost">
                      View Notes
                    </Button>
                  </SessionDetailsDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
