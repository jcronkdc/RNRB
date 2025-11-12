import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@cronkwaters/ui';
import { Calendar, Clock, MapPin, Users, Plus, Music, Video, Mic2, AlertCircle } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, isPast, isFuture } from 'date-fns';
import { CreateSessionDialog } from './CreateSessionDialog';

export const dynamic = 'force-dynamic';

async function getOrgSessions(orgId: string) {
  const sessions = await prisma.studioSession.findMany({
    where: {
      project: {
        orgId
      }
    },
    include: {
      project: true,
      attendees: {
        include: {
          user: true
        }
      },
      createdBy: true
    },
    orderBy: {
      startTime: 'asc'
    }
  });

  // Group sessions by status
  const now = new Date();
  const upcoming = sessions.filter(s => isFuture(s.startTime));
  const past = sessions.filter(s => isPast(s.endTime));
  const current = sessions.filter(s => !isPast(s.endTime) && !isFuture(s.startTime));

  return { sessions, upcoming, past, current };
}

function getSessionTypeIcon(type: string) {
  switch (type) {
    case 'writing': return Mic2;
    case 'recording': return Music;
    case 'meeting': return Video;
    case 'rehearsal': return Users;
    default: return Calendar;
  }
}

function getSessionTypeColor(type: string) {
  switch (type) {
    case 'writing': return 'text-blue-600 bg-blue-50';
    case 'recording': return 'text-red-600 bg-red-50';
    case 'meeting': return 'text-green-600 bg-green-50';
    case 'rehearsal': return 'text-purple-600 bg-purple-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export default async function SessionsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (!session.activeMembership?.orgId) {
    redirect("/organizations");
  }

  const { sessions, upcoming, past, current } = await getOrgSessions(session.activeMembership.orgId);

  // Generate calendar view data
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const daySessions = sessions.filter(s => isSameDay(s.startTime, day));
    weekDays.push({ date: day, sessions: daySessions });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">Sessions</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brand-foreground">Studio Calendar</h1>
            <p className="max-w-2xl text-base text-muted-foreground mt-2">
              Schedule writing rooms, rehearsals, and listening parties. Syncs with shared calendars and surfaces prep notes
              automatically.
            </p>
          </div>
          <CreateSessionDialog orgId={session.activeMembership.orgId}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
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
            {current.map(session => (
              <div key={session.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.project.name} • Ends {format(session.endTime, 'h:mm a')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Join Session
                </Button>
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
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(({ date, sessions: daySessions }) => (
              <div
                key={date.toISOString()}
                className={`border rounded-lg p-3 min-h-[120px] ${
                  isToday(date) ? 'border-brand-primary bg-brand-primary/5' : ''
                }`}
              >
                <div className="text-sm font-medium mb-2">
                  {format(date, 'EEE')}
                  <span className="text-muted-foreground ml-1">{format(date, 'd')}</span>
                  {isToday(date) && (
                    <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {daySessions.map(session => {
                    const Icon = getSessionTypeIcon(session.type);
                    const colorClass = getSessionTypeColor(session.type);
                    return (
                      <div
                        key={session.id}
                        className={`text-xs p-1 rounded ${colorClass}`}
                      >
                        <div className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          <span className="truncate">{format(session.startTime, 'h:mm')}</span>
                        </div>
                        <p className="truncate font-medium">{session.title}</p>
                      </div>
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
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
              <p className="text-muted-foreground mb-4">
                Schedule your next studio session to keep the momentum going
              </p>
              <CreateSessionDialog orgId={session.activeMembership.orgId}>
                <Button variant="outline">
                  Schedule Session
                </Button>
              </CreateSessionDialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map(session => {
              const Icon = getSessionTypeIcon(session.type);
              const colorClass = getSessionTypeColor(session.type);
              
              return (
                <Card key={session.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{session.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.project.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(session.startTime, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(session.startTime, 'h:mm a')} - {format(session.endTime, 'h:mm a')}</span>
                          </div>
                          {session.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{session.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <div className="flex -space-x-2">
                            {session.attendees.slice(0, 4).map((attendee, i) => (
                              <div
                                key={attendee.id}
                                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background"
                              >
                                {attendee.user.name?.charAt(0) || attendee.user.email.charAt(0)}
                              </div>
                            ))}
                            {session.attendees.length > 4 && (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                                +{session.attendees.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
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
          <h2 className="text-xl font-semibold text-muted-foreground">Past Sessions</h2>
          <div className="grid gap-3 opacity-60">
            {past.slice(0, 3).map(session => (
              <Card key={session.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(session.startTime, 'MMM d, yyyy')} • {session.attendees.length} attendees
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    View Notes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

