// All social media platforms relevant to musicians
// Icons are single letters or abbreviations (NO EMOJIS - per design system)
export interface Platform {
  id: string;
  name: string;
  icon: string; // Single letter or short abbreviation
  color: string;
  category: 'social' | 'music' | 'video' | 'messaging';
  charLimit?: number;
  hashtagLimit?: number;
  features: string[];
  shareUrl?: string;
  description: string;
}

export const PLATFORMS: Platform[] = [
  // SOCIAL NETWORKS
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'IG',
    color: '#E4405F',
    category: 'social',
    charLimit: 2200,
    hashtagLimit: 30,
    features: ['posts', 'stories', 'reels', 'live'],
    shareUrl: 'https://instagram.com',
    description: 'Visual-first platform. Great for behind-the-scenes and music videos.',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'f',
    color: '#1877F2',
    category: 'social',
    charLimit: 63206,
    features: ['posts', 'stories', 'events', 'groups', 'live'],
    shareUrl: 'https://facebook.com',
    description: 'Largest social network. Events and fan pages are key for musicians.',
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    icon: 'X',
    color: '#000000',
    category: 'social',
    charLimit: 280,
    features: ['tweets', 'threads', 'spaces', 'live'],
    shareUrl: 'https://twitter.com',
    description: 'Real-time updates. Threads work well for album announcements.',
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: '@',
    color: '#000000',
    category: 'social',
    charLimit: 500,
    features: ['posts', 'replies'],
    shareUrl: 'https://threads.net',
    description: "Meta's text-based platform. Growing music community.",
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'in',
    color: '#0A66C2',
    category: 'social',
    charLimit: 3000,
    features: ['posts', 'articles', 'events'],
    shareUrl: 'https://linkedin.com',
    description: 'Professional network. Great for industry connections and press.',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: 'R',
    color: '#FF4500',
    category: 'social',
    features: ['posts', 'AMAs', 'communities'],
    shareUrl: 'https://reddit.com',
    description: 'Niche communities. r/WeAreTheMusicMakers, genre-specific subs.',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: 'P',
    color: '#E60023',
    category: 'social',
    charLimit: 500,
    features: ['pins', 'boards'],
    shareUrl: 'https://pinterest.com',
    description: 'Visual discovery. Album art and merch showcase.',
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    icon: 'BS',
    color: '#0085FF',
    category: 'social',
    charLimit: 300,
    features: ['posts', 'feeds'],
    shareUrl: 'https://bsky.app',
    description: 'Decentralized social. Growing alternative platform.',
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    icon: 'M',
    color: '#6364FF',
    category: 'social',
    charLimit: 500,
    features: ['toots', 'boosts'],
    shareUrl: 'https://mastodon.social',
    description: 'Federated network. Tech-savvy music fans.',
  },

  // MUSIC PLATFORMS
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: 'SC',
    color: '#FF5500',
    category: 'music',
    charLimit: 4000,
    features: ['tracks', 'playlists', 'reposts', 'comments'],
    shareUrl: 'https://soundcloud.com',
    description: 'Music sharing platform. Best for demos and unreleased tracks.',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'SP',
    color: '#1DB954',
    category: 'music',
    features: ['artist profile', 'playlists', 'canvas'],
    shareUrl: 'https://open.spotify.com',
    description: 'Streaming giant. Pre-saves and playlist pitching.',
  },
  {
    id: 'bandcamp',
    name: 'Bandcamp',
    icon: 'BC',
    color: '#629AA9',
    category: 'music',
    charLimit: 5000,
    features: ['releases', 'merch', 'fan community'],
    shareUrl: 'https://bandcamp.com',
    description: 'Direct-to-fan sales. Bandcamp Fridays are huge.',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    icon: 'AM',
    color: '#FA2D48',
    category: 'music',
    features: ['artist profile', 'playlists'],
    shareUrl: 'https://music.apple.com',
    description: "Apple's streaming service. Artist profile customization.",
  },
  {
    id: 'audiomack',
    name: 'Audiomack',
    icon: 'AU',
    color: '#FFA200',
    category: 'music',
    features: ['tracks', 'albums', 'playlists'],
    shareUrl: 'https://audiomack.com',
    description: 'Free streaming. Popular for hip-hop and R&B.',
  },
  {
    id: 'deezer',
    name: 'Deezer',
    icon: 'DZ',
    color: '#00C7F2',
    category: 'music',
    features: ['tracks', 'playlists'],
    shareUrl: 'https://deezer.com',
    description: 'European streaming service. Growing globally.',
  },
  {
    id: 'tidal',
    name: 'TIDAL',
    icon: 'TD',
    color: '#000000',
    category: 'music',
    features: ['hi-fi streaming', 'artist tools'],
    shareUrl: 'https://tidal.com',
    description: 'High-quality audio. Artist-owned platform.',
  },

  // VIDEO PLATFORMS
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'YT',
    color: '#FF0000',
    category: 'video',
    charLimit: 5000,
    hashtagLimit: 15,
    features: ['videos', 'shorts', 'community', 'live', 'premieres'],
    shareUrl: 'https://youtube.com',
    description: 'Video platform. Music videos, vlogs, lyric videos.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'TT',
    color: '#000000',
    category: 'video',
    charLimit: 2200,
    hashtagLimit: 5,
    features: ['videos', 'live', 'sounds'],
    shareUrl: 'https://tiktok.com',
    description: 'Short-form video. Viral music discovery platform.',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    icon: 'YM',
    color: '#FF0000',
    category: 'music',
    features: ['tracks', 'albums', 'playlists'],
    shareUrl: 'https://music.youtube.com',
    description: "YouTube's music streaming service.",
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    icon: 'V',
    color: '#1AB7EA',
    category: 'video',
    features: ['videos', 'showcases'],
    shareUrl: 'https://vimeo.com',
    description: 'High-quality video hosting. Professional music videos.',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: 'TW',
    color: '#9146FF',
    category: 'video',
    features: ['live streams', 'clips', 'VODs'],
    shareUrl: 'https://twitch.tv',
    description: 'Live streaming. Growing music category.',
  },

  // MESSAGING / COMMUNITY
  {
    id: 'discord',
    name: 'Discord',
    icon: 'DC',
    color: '#5865F2',
    category: 'messaging',
    charLimit: 2000,
    features: ['servers', 'announcements', 'voice'],
    shareUrl: 'https://discord.com',
    description: 'Community servers. Direct fan engagement.',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'WA',
    color: '#25D366',
    category: 'messaging',
    charLimit: 65536,
    features: ['broadcasts', 'groups', 'status'],
    shareUrl: 'https://wa.me',
    description: 'Messaging app. Broadcast lists for super fans.',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'TG',
    color: '#26A5E4',
    category: 'messaging',
    charLimit: 4096,
    features: ['channels', 'groups', 'bots'],
    shareUrl: 'https://t.me',
    description: 'Messaging with channels. Great for announcements.',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: 'SN',
    color: '#FFFC00',
    category: 'messaging',
    features: ['stories', 'spotlight', 'sounds'],
    shareUrl: 'https://snapchat.com',
    description: 'Ephemeral content. Behind-the-scenes stories.',
  },
];

// Platform groups for easy selection
export const PLATFORM_GROUPS = {
  essential: ['instagram', 'twitter', 'tiktok', 'youtube', 'spotify'],
  social: ['instagram', 'facebook', 'twitter', 'threads', 'linkedin'],
  music: ['spotify', 'soundcloud', 'bandcamp', 'apple-music', 'youtube-music'],
  video: ['youtube', 'tiktok', 'twitch', 'vimeo'],
  community: ['discord', 'whatsapp', 'telegram'],
  all: PLATFORMS.map((p) => p.id),
};

// Get platforms by category
export function getPlatformsByCategory(category: Platform['category']): Platform[] {
  return PLATFORMS.filter((p) => p.category === category);
}

// Get platform by ID
export function getPlatformById(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}
