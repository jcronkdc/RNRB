/**
 * AI ASSISTANT ADVANCED TOOLS
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY: USER DATA ISOLATION - ALL TOOLS SCOPED TO AUTHENTICATED USER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Every function in this module receives userId as the FIRST parameter.
 * All database queries are filtered by userId or membership.
 * Users can ONLY access their own data through these tools.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Extended capabilities for the AI assistant:
 * - Content Generation (press releases, social posts, emails)
 * - Smart Analytics (patterns, productivity)
 * - Business Helper (budgets, royalties, revenue)
 * - Collaboration Assistant (messages, suggestions)
 */

import { prisma } from '@cronkwaters/db';

// ============================================
// CONTENT GENERATION
// ============================================

export interface ContentGenerationResult {
  success: boolean;
  content: string;
  type: string;
  suggestions?: string[];
}

/**
 * Generate a press release for a project/release
 */
export async function generatePressRelease(
  userId: string,
  projectId: string
): Promise<ContentGenerationResult> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, members: { some: { userId } } },
    select: {
      name: true,
      description: true,
      type: true,
      genre: true,
      targetReleaseDate: true,
      songs: { select: { title: true }, take: 20 },
      members: {
        select: { user: { select: { name: true } }, role: true },
      },
      org: { select: { name: true } },
    },
  });

  if (!project) {
    return { success: false, content: 'Project not found', type: 'press_release' };
  }

  const artistName =
    project.org?.name ||
    project.members.find((m) => m.role === 'owner')?.user?.name ||
    'The Artist';
  const releaseDate = project.targetReleaseDate
    ? new Date(project.targetReleaseDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '[RELEASE DATE]';

  const trackList = project.songs.map((s, i) => `${i + 1}. ${s.title}`).join('\n');

  const content = `FOR IMMEDIATE RELEASE

${artistName} Announces New ${project.type.charAt(0).toUpperCase() + project.type.slice(1)}: "${project.name}"

[CITY, STATE] — ${artistName} is thrilled to announce the upcoming release of their new ${project.type}, "${project.name}", set to drop on ${releaseDate}.

${project.description || `This highly anticipated ${project.type} showcases ${artistName}'s signature sound while exploring new musical territories.`}

${project.genre ? `Blending elements of ${project.genre}, ` : ''}"${project.name}" features ${project.songs.length} ${project.songs.length === 1 ? 'track' : 'tracks'} that ${project.songs.length > 1 ? 'take listeners on a journey through' : 'captures'} the artist's creative vision.

TRACK LISTING:
${trackList || '[Track listing to be announced]'}

"${project.name}" will be available on all major streaming platforms starting ${releaseDate}.

For more information, interviews, or press inquiries, please contact:
[CONTACT NAME]
[EMAIL]
[PHONE]

###

About ${artistName}:
[INSERT ARTIST BIO HERE]

Follow ${artistName}:
[SOCIAL MEDIA LINKS]`;

  return {
    success: true,
    content,
    type: 'press_release',
    suggestions: [
      'Add your artist bio at the bottom',
      'Include social media links',
      'Add contact information for press inquiries',
      'Consider adding a quote about the album',
    ],
  };
}

/**
 * Generate social media posts for various platforms
 */
export async function generateSocialPosts(
  userId: string,
  context: {
    type: 'release' | 'show' | 'announcement' | 'behind_the_scenes';
    projectId?: string;
    showId?: string;
    customMessage?: string;
  }
): Promise<ContentGenerationResult> {
  let projectName = '';
  let showInfo = '';
  let releaseDate = '';

  if (context.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: context.projectId, members: { some: { userId } } },
      select: { name: true, targetReleaseDate: true, type: true },
    });
    if (project) {
      projectName = project.name;
      releaseDate = project.targetReleaseDate
        ? new Date(project.targetReleaseDate).toLocaleDateString()
        : '';
    }
  }

  if (context.showId) {
    const show = await prisma.show.findFirst({
      where: { id: context.showId, org: { members: { some: { userId } } } },
      select: { name: true, date: true, venue: { select: { name: true, city: true } } },
    });
    if (show) {
      showInfo = `${show.name} at ${show.venue?.name || 'TBD'}${show.venue?.city ? `, ${show.venue.city}` : ''} on ${new Date(show.date).toLocaleDateString()}`;
    }
  }

  let posts = '';

  if (context.type === 'release') {
    posts = `📱 SOCIAL MEDIA POSTS FOR "${projectName || 'Your Release'}"

🐦 TWITTER/X (280 chars):
🎵 NEW MUSIC ALERT! "${projectName}" drops ${releaseDate || 'soon'}! 

We poured our hearts into this one. Pre-save link in bio. 

Who's ready? 🎸🔥

#NewMusic #${projectName.replace(/\s+/g, '')} #ComingSoon

---

📸 INSTAGRAM:
🎤 It's finally happening...

"${projectName}" - coming ${releaseDate || 'soon'}

This project means everything to us. Every late night in the studio, every rewrite, every moment of doubt that turned into determination - it's all here in these songs.

Can't wait for you to hear it. Pre-save link in bio!

#NewMusic #IndieArtist #MusicRelease #StudioLife #${projectName.replace(/\s+/g, '')}

---

📘 FACEBOOK:
🎶 BIG NEWS! 🎶

We're beyond excited to announce that "${projectName}" will be released on ${releaseDate || '[date]'}!

This has been a labor of love, and we can't wait to share it with all of you. Thank you for your continued support - it means the world.

Pre-save now to be the first to listen! [LINK]

❤️ + Share if you're excited!`;
  } else if (context.type === 'show') {
    posts = `📱 SOCIAL MEDIA POSTS FOR SHOW

🐦 TWITTER/X:
🎤 SHOW ANNOUNCEMENT! 

Catch us LIVE: ${showInfo || '[Show details]'}

Tickets on sale now! Who's coming? 🎫

#LiveMusic #Concert

---

📸 INSTAGRAM:
🎸 LET'S GO!

We're hitting the stage at ${showInfo || '[venue]'}! 

This is going to be a night to remember. Grab your tickets before they're gone!

Link in bio 🎫

#LiveShow #ConcertNight #SupportLiveMusic

---

📘 FACEBOOK:
🎵 SHOW ANNOUNCEMENT 🎵

We're thrilled to announce we'll be performing at ${showInfo || '[venue]'}!

Come hang out, sing along, and let's make some memories together.

🎫 Tickets: [LINK]

Tag someone you want to bring! 👇`;
  } else {
    posts = `📱 GENERAL ANNOUNCEMENT TEMPLATES

🐦 TWITTER/X:
${context.customMessage || '[Your announcement here]'} 

Stay tuned for more updates! 🎵

---

📸 INSTAGRAM:
${context.customMessage || '[Your announcement here]'}

More coming soon... 👀

#Music #Announcement

---

📘 FACEBOOK:
${context.customMessage || '[Your announcement here]'}

Thanks for all your support! ❤️`;
  }

  return {
    success: true,
    content: posts,
    type: 'social_posts',
    suggestions: [
      'Customize with your own voice and personality',
      'Add relevant hashtags for your genre',
      'Include a call-to-action (link, pre-save, tickets)',
      'Post at peak engagement times for your audience',
    ],
  };
}

/**
 * Generate email template for venue booking
 */
export async function generateVenueEmail(
  userId: string,
  venueInfo: {
    venueName: string;
    city: string;
    preferredDate?: string;
    genre?: string;
  }
): Promise<ContentGenerationResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, bio: true },
  });

  // Get user's org/band info
  const membership = await prisma.membership.findFirst({
    where: { userId },
    select: { org: { select: { name: true, bio: true } } },
  });

  const artistName = membership?.org?.name || user?.name || '[Your Name/Band Name]';
  const bio = membership?.org?.bio || user?.bio || '[Brief artist bio]';

  const content = `Subject: Booking Inquiry - ${artistName} for ${venueInfo.venueName}

Dear ${venueInfo.venueName} Booking Team,

I hope this email finds you well. My name is ${artistName}, and I'm reaching out to inquire about booking opportunities at your venue${venueInfo.preferredDate ? ` around ${venueInfo.preferredDate}` : ''}.

ABOUT US:
${bio}

${venueInfo.genre ? `Our music style: ${venueInfo.genre}` : ''}

WHY ${venueInfo.venueName.toUpperCase()}:
We've heard great things about your venue and believe our sound would be a perfect fit for your audience in ${venueInfo.city}. We're committed to bringing an energetic, professional show and promoting the event to our fanbase.

WHAT WE OFFER:
- Professional, punctual, and easy to work with
- Active social media promotion before and after the show
- Quality live performance with our own equipment (if needed)
- Flexibility on show format (headline, support, etc.)

LINKS:
- Music: [STREAMING LINK]
- Website: [WEBSITE]
- Social: [SOCIAL LINKS]
- Press Kit: [EPK LINK]

I'd love to discuss potential dates and details at your convenience. Please let me know what information you need from us.

Thank you for your time and consideration!

Best regards,
${artistName}
[PHONE]
[EMAIL]`;

  return {
    success: true,
    content,
    type: 'venue_email',
    suggestions: [
      'Add your streaming/music links',
      'Include your EPK or press kit link',
      'Mention any notable past shows or press',
      'Follow up in 1-2 weeks if no response',
    ],
  };
}

// ============================================
// SMART ANALYTICS
// ============================================

export interface AnalyticsResult {
  success: boolean;
  insights: {
    category: string;
    title: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
    suggestion?: string;
  }[];
}

/**
 * Analyze user's musical patterns and productivity
 */
export async function analyzeMusicalPatterns(userId: string): Promise<AnalyticsResult> {
  const songs = await prisma.song.findMany({
    where: { userId, archived: false },
    select: {
      key: true,
      tempo: true,
      genre: true,
      mood: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      lyrics: true,
      collaborators: { select: { user: { select: { name: true } } } },
    },
  });

  const insights: AnalyticsResult['insights'] = [];

  // Key analysis
  const keyCount: Record<string, number> = {};
  songs.forEach((s) => {
    if (s.key) keyCount[s.key] = (keyCount[s.key] || 0) + 1;
  });
  const topKeys = Object.entries(keyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (topKeys.length > 0) {
    insights.push({
      category: 'Musical',
      title: 'Favorite Keys',
      value: topKeys.map(([k, c]) => `${k} (${c} songs)`).join(', '),
      suggestion: `Try writing in ${['Am', 'Em', 'D', 'F'].find((k) => !keyCount[k]) || 'Bb'} for variety!`,
    });
  }

  // Tempo analysis
  const tempos = songs.filter((s) => s.tempo).map((s) => s.tempo!);
  if (tempos.length > 0) {
    const avgTempo = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
    const minTempo = Math.min(...tempos);
    const maxTempo = Math.max(...tempos);

    insights.push({
      category: 'Musical',
      title: 'Tempo Range',
      value: `${minTempo}-${maxTempo} BPM (avg: ${avgTempo})`,
      suggestion:
        avgTempo > 130
          ? 'Try a ballad under 80 BPM'
          : avgTempo < 100
            ? 'Try an uptempo track at 140+ BPM'
            : 'Great variety!',
    });
  }

  // Productivity analysis
  const songsByMonth: Record<string, number> = {};
  const songsByDay: Record<string, number> = {};
  const songsByHour: Record<number, number> = {};

  songs.forEach((s) => {
    const month = s.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const day = s.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = s.createdAt.getHours();

    songsByMonth[month] = (songsByMonth[month] || 0) + 1;
    songsByDay[day] = (songsByDay[day] || 0) + 1;
    songsByHour[hour] = (songsByHour[hour] || 0) + 1;
  });

  const topDays = Object.entries(songsByDay)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([d]) => d);

  if (topDays.length > 0) {
    insights.push({
      category: 'Productivity',
      title: 'Most Creative Days',
      value: topDays.join(' and '),
      suggestion: `Block out ${topDays[0]} afternoons for writing sessions!`,
    });
  }

  const topHours = Object.entries(songsByHour)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([h]) => {
      const hour = parseInt(h);
      return hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
    });

  if (topHours.length > 0) {
    insights.push({
      category: 'Productivity',
      title: 'Peak Creative Hours',
      value: topHours.join(' - '),
      suggestion: 'Protect this time for your best creative work!',
    });
  }

  // Collaboration analysis
  const collabCount: Record<string, number> = {};
  songs.forEach((s) => {
    s.collaborators.forEach((c) => {
      const name = c.user?.name || 'Unknown';
      collabCount[name] = (collabCount[name] || 0) + 1;
    });
  });

  const topCollabs = Object.entries(collabCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (topCollabs.length > 0) {
    insights.push({
      category: 'Collaboration',
      title: 'Top Collaborators',
      value: topCollabs.map(([n, c]) => `${n} (${c} songs)`).join(', '),
    });
  }

  // Completion rate
  const completed = songs.filter((s) => s.status === 'complete').length;
  const drafts = songs.filter((s) => s.status === 'draft').length;
  const completionRate = songs.length > 0 ? Math.round((completed / songs.length) * 100) : 0;

  insights.push({
    category: 'Progress',
    title: 'Completion Rate',
    value: `${completionRate}% (${completed} complete, ${drafts} drafts)`,
    trend: completionRate > 50 ? 'up' : 'stable',
    suggestion:
      drafts > completed
        ? `Focus on finishing ${drafts} drafts before starting new songs`
        : 'Great momentum!',
  });

  // Lyric analysis (word count, themes)
  const allLyrics = songs
    .filter((s) => s.lyrics)
    .map((s) => s.lyrics!)
    .join(' ');

  const wordCount = allLyrics.split(/\s+/).length;
  const themes = [
    'love',
    'heart',
    'night',
    'road',
    'fire',
    'dream',
    'sky',
    'time',
    'freedom',
    'rain',
  ];
  const foundThemes = themes.filter((t) => allLyrics.toLowerCase().includes(t));

  if (foundThemes.length > 0) {
    insights.push({
      category: 'Lyrical',
      title: 'Common Themes',
      value: foundThemes.slice(0, 5).join(', '),
      suggestion: `Explore new territory: try writing about ${['ocean', 'city', 'silence', 'colors'].find((t) => !foundThemes.includes(t)) || 'something unexpected'}`,
    });
  }

  return { success: true, insights };
}

// ============================================
// BUSINESS HELPER
// ============================================

export interface BudgetEstimate {
  category: string;
  item: string;
  lowEstimate: number;
  highEstimate: number;
  notes?: string;
}

/**
 * Estimate tour budget
 */
export async function estimateTourBudget(
  userId: string,
  tourId?: string,
  params?: {
    numberOfShows: number;
    averageDistance: number; // miles between shows
    crewSize: number;
    vehicleType: 'van' | 'bus' | 'sprinter';
  }
): Promise<{
  success: boolean;
  total: { low: number; high: number };
  breakdown: BudgetEstimate[];
}> {
  let showCount = params?.numberOfShows || 5;
  let avgDistance = params?.averageDistance || 200;

  // If tourId provided, get actual data
  if (tourId) {
    const tour = await prisma.tour.findFirst({
      where: { id: tourId, org: { members: { some: { userId } } } },
      select: { shows: { select: { id: true } } },
    });
    if (tour) {
      showCount = tour.shows.length;
    }
  }

  const crewSize = params?.crewSize || 4;
  const vehicleType = params?.vehicleType || 'van';

  const breakdown: BudgetEstimate[] = [];

  // Transportation
  const gasCostPerMile = 0.15; // Assumes ~$4/gallon, 25mpg
  const totalMiles = avgDistance * (showCount - 1);

  const vehicleCosts = {
    van: { rental: 75, gas: gasCostPerMile },
    sprinter: { rental: 150, gas: 0.2 },
    bus: { rental: 500, gas: 0.35 },
  };

  breakdown.push({
    category: 'Transportation',
    item: `${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} Rental`,
    lowEstimate: vehicleCosts[vehicleType].rental * showCount,
    highEstimate: vehicleCosts[vehicleType].rental * showCount * 1.2,
    notes: `${showCount} days`,
  });

  breakdown.push({
    category: 'Transportation',
    item: 'Gas/Fuel',
    lowEstimate: Math.round(totalMiles * vehicleCosts[vehicleType].gas),
    highEstimate: Math.round(totalMiles * vehicleCosts[vehicleType].gas * 1.3),
    notes: `~${totalMiles} miles total`,
  });

  // Lodging
  const hotelPerNight = 120;
  const nights = showCount - 1;
  const roomsNeeded = Math.ceil(crewSize / 2);

  breakdown.push({
    category: 'Lodging',
    item: 'Hotels',
    lowEstimate: hotelPerNight * nights * roomsNeeded * 0.8,
    highEstimate: hotelPerNight * nights * roomsNeeded * 1.2,
    notes: `${nights} nights, ${roomsNeeded} rooms`,
  });

  // Food
  const perDiemPerPerson = 40;
  const days = showCount;

  breakdown.push({
    category: 'Food',
    item: 'Per Diem/Meals',
    lowEstimate: perDiemPerPerson * days * crewSize * 0.7,
    highEstimate: perDiemPerPerson * days * crewSize,
    notes: `$${perDiemPerPerson}/person/day, ${crewSize} people`,
  });

  // Miscellaneous
  breakdown.push({
    category: 'Miscellaneous',
    item: 'Tolls, Parking, Tips',
    lowEstimate: 20 * showCount,
    highEstimate: 50 * showCount,
  });

  breakdown.push({
    category: 'Miscellaneous',
    item: 'Emergency Fund (10%)',
    lowEstimate: 200,
    highEstimate: 500,
    notes: 'Unexpected expenses',
  });

  // Calculate totals
  const totalLow = breakdown.reduce((sum, b) => sum + b.lowEstimate, 0);
  const totalHigh = breakdown.reduce((sum, b) => sum + b.highEstimate, 0);

  return {
    success: true,
    total: { low: Math.round(totalLow), high: Math.round(totalHigh) },
    breakdown,
  };
}

/**
 * Calculate royalty splits
 */
export async function calculateRoyaltySplits(
  songId: string,
  userId: string
): Promise<{
  success: boolean;
  splits: { name: string; role: string; percentage: number; estimatedPer1000?: number }[];
  total: number;
  suggestions: string[];
}> {
  const song = await prisma.song.findFirst({
    where: { id: songId, userId },
    select: {
      title: true,
      songSplits: {
        select: {
          percentage: true,
          role: true,
          user: { select: { name: true } },
          name: true,
        },
      },
      collaborators: {
        select: {
          role: true,
          user: { select: { name: true } },
          email: true,
        },
      },
    },
  });

  if (!song) {
    return { success: false, splits: [], total: 0, suggestions: ['Song not found'] };
  }

  // If splits already exist, return them
  if (song.songSplits.length > 0) {
    const splits = song.songSplits.map((s) => ({
      name: s.user?.name || s.name || 'Unknown',
      role: s.role,
      percentage: Number(s.percentage),
      estimatedPer1000: Number(s.percentage) * 0.04, // ~$4 per 1000 streams
    }));

    const total = splits.reduce((sum, s) => sum + s.percentage, 0);

    return {
      success: true,
      splits,
      total,
      suggestions: total !== 100 ? [`Splits total ${total}% - should be 100%`] : [],
    };
  }

  // Suggest splits based on collaborators
  const suggestions: string[] = [];
  const collaborators = song.collaborators;

  if (collaborators.length === 0) {
    return {
      success: true,
      splits: [{ name: 'You', role: 'Writer/Artist', percentage: 100, estimatedPer1000: 4 }],
      total: 100,
      suggestions: ['You own 100% - no collaborators on this song'],
    };
  }

  // Common split structures
  const numPeople = collaborators.length + 1; // +1 for the user
  const evenSplit = Math.floor(100 / numPeople);
  const remainder = 100 - evenSplit * numPeople;

  suggestions.push(`Suggested even split: ${evenSplit}% each (${numPeople} people)`);
  suggestions.push('Common structures: 50/50 for co-writes, 60/40 for melody vs lyrics');

  const splits = [
    {
      name: 'You',
      role: 'Primary Writer',
      percentage: evenSplit + remainder,
      estimatedPer1000: (evenSplit + remainder) * 0.04,
    },
    ...collaborators.map((c) => ({
      name: c.user?.name || c.email || 'Collaborator',
      role: c.role,
      percentage: evenSplit,
      estimatedPer1000: evenSplit * 0.04,
    })),
  ];

  return {
    success: true,
    splits,
    total: 100,
    suggestions,
  };
}

// ============================================
// COLLABORATION ASSISTANT
// ============================================

/**
 * Draft a message to a collaborator
 */
export async function draftCollaboratorMessage(
  userId: string,
  context: {
    recipientName: string;
    purpose: 'invite' | 'feedback' | 'update' | 'followup';
    projectName?: string;
    songName?: string;
    customDetails?: string;
  }
): Promise<ContentGenerationResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const senderName = user?.name || 'there';
  let message = '';

  switch (context.purpose) {
    case 'invite':
      message = `Hey ${context.recipientName}!

Hope you're doing well! I've been working on ${context.projectName || context.songName || 'something new'} and immediately thought of you.

${context.customDetails || 'I think your style would be perfect for this project. Would you be interested in collaborating?'}

I'd love to get your input on ${context.songName ? `"${context.songName}"` : 'the direction'}. No pressure at all - just thought I'd reach out and see if you're available.

Let me know what you think!

${senderName}`;
      break;

    case 'feedback':
      message = `Hey ${context.recipientName}!

I just uploaded a new version of ${context.songName ? `"${context.songName}"` : 'the track'} ${context.projectName ? `for ${context.projectName}` : ''}.

${context.customDetails || 'Would love to get your thoughts when you have a chance. Specifically curious about the arrangement and whether the bridge works.'}

No rush - whenever you can take a listen!

Thanks,
${senderName}`;
      break;

    case 'update':
      message = `Hey ${context.recipientName}!

Quick update on ${context.projectName || context.songName || 'our project'}:

${context.customDetails || "Things are coming together nicely. I've made some progress on [specific updates] and wanted to keep you in the loop."}

Let me know if you have any questions or want to hop on a call to discuss!

${senderName}`;
      break;

    case 'followup':
      message = `Hey ${context.recipientName}!

Hope you're doing well! Just wanted to follow up on ${context.projectName || context.songName || 'our conversation'}.

${context.customDetails || "Any updates on your end? Would love to know where you're at and how I can help move things forward."}

No pressure - just checking in!

${senderName}`;
      break;
  }

  return {
    success: true,
    content: message,
    type: 'collaborator_message',
    suggestions: [
      'Personalize with specific details about their work',
      'Be clear about deadlines if any',
      'Offer to work around their schedule',
    ],
  };
}

/**
 * Suggest potential collaborators based on user's style
 */
export async function suggestCollaborators(userId: string): Promise<{
  success: boolean;
  suggestions: {
    name: string;
    reason: string;
    songsWorkedTogether: number;
    lastCollaboration: string | null;
  }[];
}> {
  // Get user's past collaborators with stats
  const collaborations = await prisma.songCollaborator.findMany({
    where: { song: { userId } },
    select: {
      user: { select: { id: true, name: true } },
      email: true,
      createdAt: true,
      song: { select: { id: true, status: true } },
    },
  });

  // Aggregate by collaborator
  const collabStats: Record<
    string,
    { name: string; count: number; lastDate: Date; completed: number }
  > = {};

  collaborations.forEach((c) => {
    const key = c.user?.id || c.email || 'unknown';
    const name = c.user?.name || c.email || 'Unknown';

    if (!collabStats[key]) {
      collabStats[key] = { name, count: 0, lastDate: c.createdAt, completed: 0 };
    }

    collabStats[key].count++;
    if (c.createdAt > collabStats[key].lastDate) {
      collabStats[key].lastDate = c.createdAt;
    }
    if (c.song.status === 'complete') {
      collabStats[key].completed++;
    }
  });

  // Sort by collaboration count and completion rate
  const sorted = Object.values(collabStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const suggestions = sorted.map((s) => ({
    name: s.name,
    reason:
      s.completed > 0
        ? `${s.completed} completed songs together - you work well!`
        : `${s.count} collaborations - good history`,
    songsWorkedTogether: s.count,
    lastCollaboration: s.lastDate.toISOString(),
  }));

  return { success: true, suggestions };
}

// ============================================
// EXPORT ALL TOOLS FOR AI FUNCTIONS
// ============================================

export const ADVANCED_AI_FUNCTIONS = [
  {
    name: 'generatePressRelease',
    description: 'Generate a professional press release for a project/album release',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID of the project to generate press release for',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'generateSocialPosts',
    description: 'Generate social media posts for release, show, or announcement',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['release', 'show', 'announcement', 'behind_the_scenes'] },
        projectId: { type: 'string', description: 'Project ID (for releases)' },
        showId: { type: 'string', description: 'Show ID (for show announcements)' },
        customMessage: { type: 'string', description: 'Custom message to include' },
      },
      required: ['type'],
    },
  },
  {
    name: 'generateVenueEmail',
    description: 'Generate a professional venue booking inquiry email',
    parameters: {
      type: 'object',
      properties: {
        venueName: { type: 'string', description: 'Name of the venue' },
        city: { type: 'string', description: 'City where venue is located' },
        preferredDate: { type: 'string', description: 'Preferred date range' },
        genre: { type: 'string', description: 'Your music genre' },
      },
      required: ['venueName', 'city'],
    },
  },
  {
    name: 'analyzeMusicalPatterns',
    description: "Analyze the user's musical patterns, productivity, and style",
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'estimateTourBudget',
    description: 'Estimate budget for a tour',
    parameters: {
      type: 'object',
      properties: {
        tourId: { type: 'string', description: 'Tour ID (optional, uses existing shows)' },
        numberOfShows: { type: 'number', description: 'Number of shows' },
        averageDistance: { type: 'number', description: 'Average miles between shows' },
        crewSize: { type: 'number', description: 'Number of people traveling' },
        vehicleType: { type: 'string', enum: ['van', 'sprinter', 'bus'] },
      },
    },
  },
  {
    name: 'calculateRoyaltySplits',
    description: 'Calculate or suggest royalty splits for a song',
    parameters: {
      type: 'object',
      properties: {
        songId: { type: 'string', description: 'Song ID to calculate splits for' },
      },
      required: ['songId'],
    },
  },
  {
    name: 'draftCollaboratorMessage',
    description: 'Draft a message to send to a collaborator',
    parameters: {
      type: 'object',
      properties: {
        recipientName: { type: 'string', description: 'Name of the recipient' },
        purpose: { type: 'string', enum: ['invite', 'feedback', 'update', 'followup'] },
        projectName: { type: 'string', description: 'Project name (if relevant)' },
        songName: { type: 'string', description: 'Song name (if relevant)' },
        customDetails: { type: 'string', description: 'Additional details to include' },
      },
      required: ['recipientName', 'purpose'],
    },
  },
  {
    name: 'suggestCollaborators',
    description: 'Suggest collaborators to work with based on past history',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];
