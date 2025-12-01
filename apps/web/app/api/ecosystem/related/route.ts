import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from '@/lib/auth';
import { prisma } from '@cronkwaters/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Entity type and ID are required' }, { status: 400 });
    }

    const related: Record<string, any[]> = {
      songs: [],
      projects: [],
      setlists: [],
      shows: [],
      tours: [],
      gear: [],
      collaborators: [],
      practice: [],
      recordings: [],
    };

    switch (entityType) {
      case 'song': {
        // Get the song
        const song = await prisma.song.findUnique({
          where: { id: entityId },
          include: {
            project: {
              select: { id: true, name: true, slug: true },
            },
            setlistItems: {
              include: {
                setlist: {
                  include: {
                    show: {
                      select: { id: true, name: true, slug: true },
                    },
                  },
                },
              },
            },
            collaborators: {
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
            practiceSessions: {
              take: 5,
              orderBy: { startTime: 'desc' },
              select: { id: true, startTime: true, durationMinutes: true, focusArea: true },
            },
            recordingNotes: {
              take: 5,
              orderBy: { date: 'desc' },
              select: { id: true, title: true, date: true },
            },
          },
        });

        if (song) {
          // Projects
          if (song.project) {
            related.projects.push({
              id: song.project.id,
              type: 'project',
              title: song.project.name,
              href: `/projects/${song.project.slug}`,
            });
          }

          // Setlists & Shows
          song.setlistItems.forEach((item) => {
            related.setlists.push({
              id: item.setlist.id,
              type: 'setlist',
              title: item.setlist.name || 'Setlist',
              href: `/setlists/${item.setlist.id}`,
            });
            if (item.setlist.show) {
              related.shows.push({
                id: item.setlist.show.id,
                type: 'show',
                title: item.setlist.show.name,
                href: `/shows/${item.setlist.show.slug}`,
              });
            }
          });

          // Collaborators
          song.collaborators.forEach((collab) => {
            if (collab.user) {
              related.collaborators.push({
                id: collab.user.id,
                type: 'collaborator',
                title: collab.user.name || 'Unknown',
                subtitle: collab.role,
                href: `/u/${collab.user.id}`,
                imageUrl: collab.user.image || undefined,
              });
            }
          });

          // Practice sessions
          song.practiceSessions.forEach((session) => {
            related.practice.push({
              id: session.id,
              type: 'practice',
              title: session.focusArea || 'Practice',
              subtitle: `${session.durationMinutes || 0} min`,
              href: `/tools?tool=practice-logger`,
            });
          });

          // Recording notes
          song.recordingNotes.forEach((note) => {
            related.recordings.push({
              id: note.id,
              type: 'recording',
              title: note.title,
              subtitle: new Date(note.date).toLocaleDateString(),
              href: `/studio/notes/${note.id}`,
            });
          });
        }
        break;
      }

      case 'project': {
        const project = await prisma.project.findUnique({
          where: { id: entityId },
          include: {
            songs: {
              take: 10,
              orderBy: { updatedAt: 'desc' },
              select: { id: true, title: true, status: true, artworkUrl: true },
            },
            shows: {
              take: 5,
              orderBy: { date: 'desc' },
              select: { id: true, name: true, slug: true, date: true },
            },
            members: {
              include: {
                user: {
                  select: { id: true, name: true, image: true },
                },
              },
            },
            studioSessions: {
              take: 5,
              orderBy: { startTime: 'desc' },
              select: { id: true, title: true, startTime: true },
            },
            recordingNotes: {
              take: 5,
              orderBy: { date: 'desc' },
              select: { id: true, title: true, date: true },
            },
          },
        });

        if (project) {
          // Songs
          project.songs.forEach((song) => {
            related.songs.push({
              id: song.id,
              type: 'song',
              title: song.title,
              subtitle: song.status,
              href: `/songs/${song.id}`,
              imageUrl: song.artworkUrl || undefined,
            });
          });

          // Shows
          project.shows.forEach((show) => {
            related.shows.push({
              id: show.id,
              type: 'show',
              title: show.name,
              subtitle: new Date(show.date).toLocaleDateString(),
              href: `/shows/${show.slug}`,
            });
          });

          // Collaborators/Members
          project.members.forEach((member) => {
            related.collaborators.push({
              id: member.user.id,
              type: 'collaborator',
              title: member.user.name || 'Unknown',
              subtitle: member.role,
              href: `/u/${member.user.id}`,
              imageUrl: member.user.image || undefined,
            });
          });

          // Recording notes
          project.recordingNotes.forEach((note) => {
            related.recordings.push({
              id: note.id,
              type: 'recording',
              title: note.title,
              subtitle: new Date(note.date).toLocaleDateString(),
              href: `/studio/notes/${note.id}`,
            });
          });
        }
        break;
      }

      case 'show': {
        const show = await prisma.show.findUnique({
          where: { id: entityId },
          include: {
            project: {
              select: { id: true, name: true, slug: true },
            },
            tour: {
              select: { id: true, name: true, slug: true },
            },
            setlist: {
              include: {
                items: {
                  include: {
                    song: {
                      select: { id: true, title: true, artworkUrl: true },
                    },
                  },
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        });

        if (show) {
          // Project
          if (show.project) {
            related.projects.push({
              id: show.project.id,
              type: 'project',
              title: show.project.name,
              href: `/projects/${show.project.slug}`,
            });
          }

          // Tour
          if (show.tour) {
            related.tours.push({
              id: show.tour.id,
              type: 'tour',
              title: show.tour.name,
              href: `/tours/${show.tour.slug}`,
            });
          }

          // Songs from setlist
          if (show.setlist) {
            related.setlists.push({
              id: show.setlist.id,
              type: 'setlist',
              title: show.setlist.name || 'Setlist',
              href: `/setlists/${show.setlist.id}`,
            });

            show.setlist.items.forEach((item) => {
              if (item.song) {
                related.songs.push({
                  id: item.song.id,
                  type: 'song',
                  title: item.song.title,
                  href: `/songs/${item.song.id}`,
                  imageUrl: item.song.artworkUrl || undefined,
                });
              }
            });
          }
        }
        break;
      }

      case 'tour': {
        const tour = await prisma.tour.findUnique({
          where: { id: entityId },
          include: {
            shows: {
              orderBy: { date: 'asc' },
              select: {
                id: true,
                name: true,
                slug: true,
                date: true,
                venue: {
                  select: { name: true, city: true },
                },
              },
            },
          },
        });

        if (tour) {
          // Shows
          tour.shows.forEach((show) => {
            related.shows.push({
              id: show.id,
              type: 'show',
              title: show.name,
              subtitle: show.venue ? `${show.venue.name}, ${show.venue.city}` : undefined,
              href: `/shows/${show.slug}`,
            });
          });
        }
        break;
      }

      default:
        break;
    }

    // Deduplicate arrays
    Object.keys(related).forEach((key) => {
      const seen = new Set();
      related[key] = related[key].filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    });

    return NextResponse.json({ related });
  } catch (error) {
    console.error('Error fetching related content:', error);
    return NextResponse.json({ error: 'Failed to fetch related content' }, { status: 500 });
  }
}
