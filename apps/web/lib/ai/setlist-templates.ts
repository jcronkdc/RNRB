/**
 * SETLIST TEMPLATES LIBRARY
 * 
 * Pre-configured professional setlist templates for common scenarios
 * Industry-standard configurations used by touring musicians
 */

import type { OptimizerOptions } from './setlist-optimizer';

export type SetlistTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'festival' | 'club' | 'acoustic' | 'cover-band' | 'special';
  config: Partial<OptimizerOptions>;
  usageHints: string[];
};

/**
 * Professional setlist templates library
 */
export const SETLIST_TEMPLATES: SetlistTemplate[] = [
  // ===========================
  // FESTIVAL TEMPLATES
  // ===========================
  {
    id: 'festival-main-stage',
    name: 'Festival Main Stage',
    description: 'High-energy 45-60 minute set for large outdoor crowds',
    icon: '🎪',
    category: 'festival',
    config: {
      targetDuration: 55,
      energyProfile: 'explosive',
      prioritizePopular: true,
      avoidKeyJumps: false, // Crowd energy > vocal health
    },
    usageHints: [
      'Start with your biggest hit or crowd favorite',
      'Keep energy consistently high',
      'Minimize talking between songs',
      'End with your anthem or crowd singalong',
    ],
  },
  {
    id: 'festival-afternoon',
    name: 'Festival Afternoon Set',
    description: 'Balanced 30-45 minute set for mid-day crowds',
    icon: '☀️',
    category: 'festival',
    config: {
      targetDuration: 40,
      energyProfile: 'dynamic',
      prioritizePopular: true,
      avoidKeyJumps: true,
    },
    usageHints: [
      'Mix high and medium energy (crowd is warming up)',
      'Include 1-2 slower songs for variety',
      'Engage crowd with call-and-response',
      'Build momentum toward end',
    ],
  },
  {
    id: 'festival-opener',
    name: 'Festival Opener',
    description: 'Strong 20-30 minute set to warm up crowd',
    icon: '🔥',
    category: 'festival',
    config: {
      targetDuration: 25,
      energyProfile: 'crescendo',
      prioritizePopular: true,
      avoidKeyJumps: false,
      minimumSongCount: 5,
      maximumSongCount: 8,
    },
    usageHints: [
      'Start strong to grab attention',
      'Build energy throughout',
      'Keep songs short and punchy',
      'Leave crowd wanting more',
    ],
  },

  // ===========================
  // CLUB/VENUE TEMPLATES
  // ===========================
  {
    id: 'club-headline',
    name: 'Club Headline Set',
    description: 'Full 90-120 minute performance with encores',
    icon: '🎸',
    category: 'club',
    config: {
      targetDuration: 100,
      energyProfile: 'balanced',
      prioritizePopular: false, // Mix hits with deep cuts
      avoidKeyJumps: true,
      allowRepetition: true, // Enable encores
    },
    usageHints: [
      'Strong opener (top 3 energy song)',
      'Dip energy 30-40 mins in (crowd break)',
      'Build momentum after halfway point',
      'Save 2-3 hits for encore',
    ],
  },
  {
    id: 'club-support',
    name: 'Club Support/Opening',
    description: 'Tight 30-40 minute opening set',
    icon: '🎤',
    category: 'club',
    config: {
      targetDuration: 35,
      energyProfile: 'explosive',
      prioritizePopular: true,
      avoidKeyJumps: true,
      minimumSongCount: 8,
      maximumSongCount: 12,
    },
    usageHints: [
      'Play your absolute best songs',
      'Don\'t overstay your welcome',
      'Build rapport quickly',
      'End strong (leave impression)',
    ],
  },
  {
    id: 'club-residency',
    name: 'Club Residency Night',
    description: '2-3 hour residency with multiple sets',
    icon: '🌙',
    category: 'club',
    config: {
      targetDuration: 60, // Per set
      energyProfile: 'dynamic',
      prioritizePopular: false,
      avoidKeyJumps: true,
    },
    usageHints: [
      'Vary setlist each week',
      'Mix crowd favorites with deep cuts',
      'Take 15-20 min breaks between sets',
      'Save encores for final set only',
    ],
  },

  // ===========================
  // ACOUSTIC/INTIMATE TEMPLATES
  // ===========================
  {
    id: 'acoustic-evening',
    name: 'Acoustic Evening',
    description: 'Intimate 60-75 minute acoustic performance',
    icon: '🪕',
    category: 'acoustic',
    config: {
      targetDuration: 70,
      energyProfile: 'intimate',
      prioritizePopular: false,
      avoidKeyJumps: true, // Vocal health crucial for acoustic
      genreBalance: 'focused',
    },
    usageHints: [
      'Tell stories between songs',
      'Focus on lyrics and vocal performance',
      'Allow for crowd requests',
      'Keep energy mellow but engaged',
    ],
  },
  {
    id: 'coffeehouse-set',
    name: 'Coffeehouse Set',
    description: 'Background-friendly 45-60 minute set',
    icon: '☕',
    category: 'acoustic',
    config: {
      targetDuration: 50,
      energyProfile: 'intimate',
      prioritizePopular: false,
      avoidKeyJumps: true,
    },
    usageHints: [
      'Keep volume conversational',
      'Avoid high-energy or aggressive songs',
      'Mix originals with tasteful covers',
      'Create relaxed atmosphere',
    ],
  },
  {
    id: 'unplugged-special',
    name: 'Unplugged Special',
    description: 'Stripped-down versions of full-band songs',
    icon: '🎹',
    category: 'acoustic',
    config: {
      targetDuration: 75,
      energyProfile: 'balanced',
      prioritizePopular: true,
      avoidKeyJumps: true,
    },
    usageHints: [
      'Reimagine full-band arrangements',
      'Showcase vocal and instrumental skills',
      'Include surprise deep cuts',
      'Build emotional connection with crowd',
    ],
  },

  // ===========================
  // COVER BAND TEMPLATES
  // ===========================
  {
    id: 'cover-wedding',
    name: 'Wedding Reception',
    description: 'Crowd-pleasing 3-hour performance with breaks',
    icon: '💒',
    category: 'cover-band',
    config: {
      targetDuration: 45, // Per set (3 sets total)
      energyProfile: 'dynamic',
      prioritizePopular: true,
      avoidKeyJumps: false, // Variety > consistency
      genreBalance: 'mixed',
    },
    usageHints: [
      'Read the room constantly',
      'Take client requests seriously',
      'Mix decades and genres',
      'Build energy toward end of night',
    ],
  },
  {
    id: 'cover-corporate',
    name: 'Corporate Event',
    description: 'Professional background/party music',
    icon: '🏢',
    category: 'cover-band',
    config: {
      targetDuration: 60,
      energyProfile: 'balanced',
      prioritizePopular: true,
      avoidKeyJumps: false,
      genreBalance: 'mixed',
    },
    usageHints: [
      'Stick to universally known hits',
      'Avoid explicit content',
      'Be ready to adjust volume',
      'Keep energy professional (not wild)',
    ],
  },
  {
    id: 'cover-party',
    name: 'Party/Bar Night',
    description: 'High-energy dance-focused set',
    icon: '🎉',
    category: 'cover-band',
    config: {
      targetDuration: 90,
      energyProfile: 'explosive',
      prioritizePopular: true,
      avoidKeyJumps: false,
      genreBalance: 'progressive', // Genre mashup
    },
    usageHints: [
      'Prioritize dance floor fillers',
      'Medley similar-tempo songs',
      'Minimize ballads (1-2 max)',
      'Keep crowd moving',
    ],
  },

  // ===========================
  // SPECIAL SCENARIOS
  // ===========================
  {
    id: 'tour-opening-night',
    name: 'Tour Opening Night',
    description: 'Polished 75-90 minute set to start tour strong',
    icon: '🚀',
    category: 'special',
    config: {
      targetDuration: 85,
      energyProfile: 'balanced',
      prioritizePopular: true,
      avoidKeyJumps: true,
      allowRepetition: true,
    },
    usageHints: [
      'Rehearse extensively beforehand',
      'Include visual/production moments',
      'Save 2 hits for encore',
      'Set tone for rest of tour',
    ],
  },
  {
    id: 'album-release-show',
    name: 'Album Release Show',
    description: 'Full album + hits (90-120 min)',
    icon: '💿',
    category: 'special',
    config: {
      targetDuration: 105,
      energyProfile: 'balanced',
      prioritizePopular: false, // Feature new album
      avoidKeyJumps: true,
    },
    usageHints: [
      'Play album front-to-back (or majority)',
      'Intersperse older hits for variety',
      'Share stories about new songs',
      'End with crowd-favorite encore',
    ],
  },
  {
    id: 'showcase-audition',
    name: 'Showcase/Audition Set',
    description: 'Tight 15-20 minute "best of" showcase',
    icon: '⭐',
    category: 'special',
    config: {
      targetDuration: 18,
      energyProfile: 'explosive',
      prioritizePopular: true,
      avoidKeyJumps: true,
      minimumSongCount: 4,
      maximumSongCount: 6,
    },
    usageHints: [
      'Only your absolute best songs',
      'Show range (fast + slow)',
      'Nail every note and transition',
      'Leave them wanting to hear more',
    ],
  },
  {
    id: 'charity-benefit',
    name: 'Charity Benefit',
    description: 'Feel-good 60 minute set with crowd interaction',
    icon: '❤️',
    category: 'special',
    config: {
      targetDuration: 60,
      energyProfile: 'balanced',
      prioritizePopular: true,
      avoidKeyJumps: true,
    },
    usageHints: [
      'Choose uplifting, positive songs',
      'Allow time for speaking/cause awareness',
      'Include sing-along moments',
      'End with inspirational closer',
    ],
  },
  {
    id: 'livestream-concert',
    name: 'Livestream Concert',
    description: 'Online performance optimized for streaming (60 min)',
    icon: '📹',
    category: 'special',
    config: {
      targetDuration: 60,
      energyProfile: 'dynamic',
      prioritizePopular: true,
      avoidKeyJumps: true,
    },
    usageHints: [
      'Plan camera-ready production',
      'Engage online audience directly',
      'Keep set tight (attention spans shorter)',
      'Include visual elements',
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplate(id: string): SetlistTemplate | undefined {
  return SETLIST_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: SetlistTemplate['category']
): SetlistTemplate[] {
  return SETLIST_TEMPLATES.filter(t => t.category === category);
}

/**
 * Search templates by name/description
 */
export function searchTemplates(query: string): SetlistTemplate[] {
  const lowerQuery = query.toLowerCase();
  return SETLIST_TEMPLATES.filter(
    t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery)
  );
}

