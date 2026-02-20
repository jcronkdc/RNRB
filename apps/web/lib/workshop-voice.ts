/**
 * THE WORKSHOP VOICE
 *
 * This is the soul of Rock N' Roll Basement.
 * Every piece of text, every message, every empty state - they all come from here.
 *
 * The voice is:
 * - Warm but not saccharine
 * - Story-focused, not feature-focused
 * - Personal and human, not corporate
 * - Understated, not over-enthusiastic
 * - Genuine encouragement, not cheerleading
 *
 * When writing new copy, ask: "Would a respected mentor say this?"
 */

// ============================================
// GREETINGS - Personal, time-aware, journey-aware
// ============================================

export function getWelcomeMessage(user: {
  name?: string;
  songCount?: number;
  practiceStreak?: number;
  lastActivityType?: string;
  lastSongTitle?: string;
}): { greeting: string; subtext: string } {
  const hour = new Date().getHours();
  const firstName = user.name?.split(' ')[0] || 'friend';
  const songCount = user.songCount || 0;
  const streak = user.practiceStreak || 0;

  // First-time user
  if (songCount === 0 && streak === 0) {
    return {
      greeting: `Welcome to your workshop, ${firstName}`,
      subtext: 'Everything you need is here. Ready to make your first mark?',
    };
  }

  // User on a streak
  if (streak >= 7) {
    return {
      greeting: `${firstName}, ${streak} days strong`,
      subtext: 'Consistency separates the serious from the casual.',
    };
  }

  // Late night session
  if (hour >= 23 || hour < 5) {
    return {
      greeting: `Late session, ${firstName}?`,
      subtext: 'The best work happens when the world is quiet.',
    };
  }

  // Early morning
  if (hour >= 5 && hour < 9) {
    return {
      greeting: `Early start, ${firstName}`,
      subtext: 'Morning hours are uninterrupted hours.',
    };
  }

  // Has songs in progress
  if (user.lastSongTitle) {
    return {
      greeting: `Back at the bench, ${firstName}`,
      subtext: `"${user.lastSongTitle}" is waiting.`,
    };
  }

  // Growing catalog
  if (songCount >= 10) {
    return {
      greeting: `${songCount} songs and counting`,
      subtext: "You're building something real here.",
    };
  }

  // Default - warm and simple
  const timeGreetings = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
  };
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  return {
    greeting: `${timeGreetings[timeOfDay]}, ${firstName}`,
    subtext: 'What are we working on today?',
  };
}

// ============================================
// EMPTY STATES - Beginnings, not failures
// ============================================

export const emptyStates = {
  // Songs/Songwriting
  noSongs: {
    title: 'This is where it begins',
    message:
      "Every song you'll ever write starts with a blank page. Don't let that intimidate you—let it excite you.",
    subtext: 'You have something to say.',
    action: 'Write Your First Song',
    actionHref: '/songwriting',
  },

  // Projects
  noProjects: {
    title: 'Your next chapter starts here',
    message: 'An album. An EP. A single. Whatever it is, it deserves a home.',
    subtext: 'Give your music the space it needs to grow.',
    action: 'Start a Project',
    actionHref: '/projects/new',
  },

  // Collaborators
  noCollaborators: {
    title: "You're not alone",
    message:
      'Thousands of musicians are on this platform right now, looking for someone exactly like you.',
    subtext: 'Your sound might be exactly what someone needs.',
    action: 'Find Your People',
    actionHref: '/discover',
  },

  // Activity Feed
  noActivity: {
    title: 'Your story is just beginning',
    message: 'Every session, every breakthrough, every late night—it all gets recorded here.',
    subtext: 'Start creating and watch your journey unfold.',
    action: 'Start Creating',
    actionHref: '/songwriting',
  },

  // Practice Log
  noPractice: {
    title: 'Every master was once a beginner',
    message: 'The only difference between them and you? They kept showing up.',
    subtext: 'Track your journey, one session at a time.',
    action: 'Log Your First Session',
    actionHref: '/tools?tool=practice-logger',
  },

  // Shows/Tours
  noShows: {
    title: 'Your stage is waiting',
    message: 'From open mics to headlining tours—every performer started somewhere.',
    subtext: 'Get in front of people who need to hear you.',
    action: 'Plan Your First Show',
    actionHref: '/shows/new',
  },

  // Revenue
  noRevenue: {
    title: 'Your music has value',
    message:
      'Gigs, streaming, sync licensing, merch—there are more ways than ever to earn from your craft.',
    subtext: 'Track it all in one place.',
    action: 'Set Up Revenue Tracking',
    actionHref: '/revenue',
  },

  // Messages
  noMessages: {
    title: 'Reach out',
    message: 'The best collaborations start with a simple hello.',
    subtext: 'Find a musician you admire and say hi.',
    action: 'Find Musicians',
    actionHref: '/discover',
  },

  // Library
  noLibraryItems: {
    title: 'Your creative vault',
    message: 'Demos, stems, lyrics, reference tracks—everything you need, organized and ready.',
    subtext: 'Drop some files or import from your favorite services.',
    action: 'Add Your First File',
    actionHref: '/library',
  },

  // Website
  noWebsite: {
    title: 'Claim your corner of the internet',
    message: "Your music deserves a home online. We'll help you build it.",
    subtext: 'No coding required. Just your music and your story.',
    action: 'Build Your Site',
    actionHref: '/sites/new',
  },

  // Search Results
  noSearchResults: {
    title: 'Nothing here yet',
    message: "Try different keywords or browse what's available.",
    subtext: 'Sometimes the best discoveries come from exploration.',
    action: 'Browse All',
    actionHref: '/discover',
  },

  // Opportunities
  noOpportunities: {
    title: 'Opportunities are everywhere',
    message: "Gigs, collaborations, sync placements—they're out there waiting.",
    subtext: 'Complete your profile to get matched.',
    action: 'Complete Your Profile',
    actionHref: '/settings/profile',
  },

  // Tours
  noTours: {
    title: 'Your stage is waiting',
    message: 'From local venues to world tours—every journey starts with a single show.',
    subtext: 'Plan, organize, and optimize your touring.',
    action: 'Plan Your First Tour',
    actionHref: '/tours/new',
  },

  // Setlists
  noSetlists: {
    title: 'The show must have a plan',
    message: 'Great performances feel spontaneous but are carefully planned.',
    subtext: 'Build setlists that flow and tell a story.',
    action: 'Create Your First Setlist',
    actionHref: '/setlists/new',
  },

  // Feed
  noFeedPosts: {
    title: 'Share your journey',
    message: 'Your wins, your struggles, your process—other musicians want to hear it.',
    subtext: 'Start a conversation with the community.',
    action: 'Write Your First Post',
    actionHref: '/feed/new',
  },

  // Gear/Equipment
  noGear: {
    title: 'Document your tools',
    message: 'Your gear tells the story of your sound.',
    subtext: 'Track maintenance, insurance, and specs.',
    action: 'Add Your First Piece',
    actionHref: '/tools?tool=gear-inventory',
  },

  // Notifications
  noNotifications: {
    title: 'All quiet here',
    message: 'No new notifications right now.',
    subtext: "We'll let you know when something needs your attention.",
    action: 'Check Your Settings',
    actionHref: '/settings',
  },

  // Discover/Find Musicians
  noDiscoverResults: {
    title: 'No matches yet',
    message: 'Try adjusting your search or explore different criteria.',
    subtext: 'The right collaborator is out there.',
    action: 'Browse All Musicians',
    actionHref: '/discover',
  },

  // Credits
  noCredits: {
    title: 'Your balance is empty',
    message: 'Credits power premium features like AI assistance and high-quality exports.',
    subtext: 'Get credits to unlock more possibilities.',
    action: 'Get Credits',
    actionHref: '/credits',
  },

  // Labs/Experiments
  noLabsAccess: {
    title: 'The cutting edge',
    message: "Labs is where we test new ideas. Some will become features. Some won't.",
    subtext: 'Want early access? Join our beta program.',
    action: 'Join Beta',
    actionHref: '/tools',
  },

  // Files/Uploads
  noFiles: {
    title: 'Your creative vault awaits',
    message: 'Demos, stems, recordings, reference tracks—keep everything in one place.',
    subtext: 'Drag and drop or click to upload.',
    action: 'Upload Your First File',
    actionHref: '/library',
  },

  // Studio/Recording
  noRecordings: {
    title: 'Ready to record',
    message: 'Your ideas deserve to be captured. Start recording.',
    subtext: 'High-quality audio with real-time collaboration.',
    action: 'Start Recording',
    actionHref: '/studio',
  },
} as const;

// ============================================
// MILESTONE MESSAGES - Celebrating the journey
// ============================================

export const milestoneMessages = {
  firstSong: {
    title: 'Your first song',
    message: 'You did it. You put something out into the world. That takes courage.',
    subtext: 'This is just the beginning.',
  },
  fiveSongs: {
    title: 'Five songs strong',
    message: "That's the start of an EP. You're building a catalog.",
    subtext: 'Keep going.',
  },
  tenSongs: {
    title: 'Double digits',
    message: "Ten songs. You're not dabbling anymore.",
    subtext: 'Your craft is growing.',
  },
  firstCollaboration: {
    title: 'Your first collaboration',
    message: 'Music is better together. You found someone who hears what you hear.',
    subtext: 'This could be the start of something.',
  },
  firstShow: {
    title: 'First show logged',
    message: 'You got on stage. You shared your music with real people.',
    subtext: "That's what it's all about.",
  },
  weekStreak: {
    title: '7-day streak',
    message: 'A week of showing up. Consistency is the secret.',
    subtext: 'Your future self will thank you.',
  },
  monthStreak: {
    title: '30-day streak',
    message: "A full month of dedication. This is how it's done.",
    subtext: "You're not the same musician you were 30 days ago.",
  },
  firstRevenue: {
    title: 'Your first dollar',
    message: 'Someone valued your music enough to pay for it. Remember this moment.',
    subtext: "You're a working musician.",
  },
} as const;

// ============================================
// JOURNEY MILESTONES - The path forward
// ============================================

export const journeyMilestones = [
  {
    id: 'first_song',
    label: 'Write your first song',
    completed: (user: any) => (user.songCount || 0) >= 1,
    encouragement: 'Everyone starts here',
  },
  {
    id: 'complete_profile',
    label: 'Complete your profile',
    completed: (user: any) => user.profileComplete,
    encouragement: 'Let people know who you are',
  },
  {
    id: 'five_songs',
    label: 'Build a catalog (5 songs)',
    completed: (user: any) => (user.songCount || 0) >= 5,
    encouragement: "That's an EP",
  },
  {
    id: 'first_collaboration',
    label: 'Collaborate with another musician',
    completed: (user: any) => (user.collaborationCount || 0) >= 1,
    encouragement: 'Music is better together',
  },
  {
    id: 'practice_streak',
    label: 'Build a 7-day practice streak',
    completed: (user: any) => (user.practiceStreak || 0) >= 7,
    encouragement: 'Consistency is everything',
  },
  {
    id: 'first_show',
    label: 'Book and play a show',
    completed: (user: any) => (user.showsPlayed || 0) >= 1,
    encouragement: 'Get on that stage',
  },
  {
    id: 'build_website',
    label: 'Launch your website',
    completed: (user: any) => user.hasWebsite,
    encouragement: 'Own your presence',
  },
  {
    id: 'first_revenue',
    label: 'Earn your first dollar',
    completed: (user: any) => (user.totalRevenue || 0) > 0,
    encouragement: "You're a working musician",
  },
] as const;

// ============================================
// DAILY SPARKS - Reasons to return
// ============================================

export function getDailySpark(): { prompt: string; category: string } {
  const sparks = [
    // Creative prompts
    { prompt: "Write a 4-bar melody in a key you've never used", category: 'create' },
    { prompt: "Record a 30-second voice memo of whatever's in your head", category: 'create' },
    { prompt: "Write one line of lyrics about how you're feeling today", category: 'create' },
    {
      prompt: 'Pick up your instrument and play the first thing that comes to mind',
      category: 'create',
    },
    { prompt: "Write a song title—don't overthink it", category: 'create' },

    // Learning prompts
    { prompt: 'Listen to a song in a genre you normally skip', category: 'learn' },
    { prompt: "Learn one new chord you've never played", category: 'learn' },
    { prompt: 'Study the structure of your favorite song', category: 'learn' },
    { prompt: 'Watch an interview with an artist you admire', category: 'learn' },

    // Connection prompts
    { prompt: 'Send a message to a musician whose work you respect', category: 'connect' },
    { prompt: "Share something you're working on—even if it's not finished", category: 'connect' },
    { prompt: "Leave genuine feedback on another musician's work", category: 'connect' },

    // Reflection prompts
    { prompt: "What's one thing you learned in your last session?", category: 'reflect' },
    { prompt: 'What song do you wish you had written?', category: 'reflect' },
    { prompt: 'Why did you start making music?', category: 'reflect' },
  ];

  // Use the date to get a consistent daily spark
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % sparks.length;

  return sparks[index];
}

// ============================================
// MICRO-COPY - The small moments matter
// ============================================

export const microCopy = {
  // Loading states
  loading: {
    default: 'Loading...',
    songs: 'Loading your catalog...',
    projects: 'Opening your workshop...',
    collaborators: 'Finding your people...',
    activity: 'Loading your timeline...',
    dashboard: 'Getting things ready...',
    library: 'Opening your vault...',
    messages: 'Loading conversations...',
    tours: 'Loading your tours...',
    shows: 'Loading shows...',
    setlists: 'Loading setlists...',
    tools: 'Preparing your toolbox...',
    settings: 'Loading your settings...',
    billing: 'Loading billing info...',
    discover: 'Searching the network...',
    feed: 'Loading the community...',
    opportunities: 'Finding opportunities...',
    revenue: 'Calculating your earnings...',
    credits: 'Loading credits...',
    studio: 'Preparing the studio...',
    labs: 'Entering the lab...',
    sites: 'Loading your sites...',
    profile: 'Loading your profile...',
  },

  // Success messages
  success: {
    saved: 'Saved.',
    created: 'Created.',
    deleted: 'Removed.',
    sent: 'Sent.',
    updated: 'Updated.',
    exported: 'Exported.',
  },

  // Error messages
  error: {
    generic: 'Something went wrong. Try again.',
    network: "Can't reach our servers. Check your connection.",
    notFound: "We couldn't find that.",
    permission: "You don't have access to that.",
    validation: "That doesn't look right. Check your input.",
  },

  // Encouragement (subtle)
  encouragement: {
    creating: "You're in the zone.",
    practicing: 'Every minute counts.',
    collaborating: 'Two heads are better than one.',
    performing: "This is what it's all about.",
    learning: 'Curiosity is your superpower.',
  },

  // Buttons/Actions
  actions: {
    create: 'Start New',
    save: 'Save',
    delete: 'Remove',
    cancel: 'Cancel',
    continue: 'Continue',
    finish: 'Finish',
    share: 'Share',
    export: 'Export',
    invite: 'Invite',
    settings: 'Settings',
    signOut: 'Sign Out',
  },

  // Confirmations
  confirmations: {
    delete: "Are you sure? This can't be undone.",
    leave: 'You have unsaved changes. Leave anyway?',
    publish: 'Ready to share this?',
  },
} as const;

// ============================================
// COMMUNITY PULSE - You're not alone
// ============================================

export function getCommunityMessage(stats: {
  onlineNow?: number;
  creatingNow?: number;
  songsToday?: number;
}): string {
  const { onlineNow = 0, creatingNow = 0, songsToday = 0 } = stats;

  if (creatingNow > 10) {
    return `${creatingNow} musicians creating right now`;
  }

  if (onlineNow > 50) {
    return `${onlineNow} musicians online`;
  }

  if (songsToday > 0) {
    return `${songsToday} songs written today`;
  }

  return 'Musicians creating worldwide';
}

// ============================================
// HELPER: Get relevant empty state
// ============================================

export function getEmptyState(type: keyof typeof emptyStates) {
  return emptyStates[type] || emptyStates.noActivity;
}

export function getMilestoneMessage(type: keyof typeof milestoneMessages) {
  return milestoneMessages[type];
}
