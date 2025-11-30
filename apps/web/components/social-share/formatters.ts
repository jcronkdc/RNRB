import type { Platform } from './platforms';

interface ContentToFormat {
  title: string;
  description: string;
  url?: string;
  hashtags: string[];
  mentions?: string[];
  contentType: string;
  releaseDate?: string;
}

// Character limits by platform
export function getCharacterLimit(platformId: string): number | undefined {
  const limits: Record<string, number> = {
    twitter: 280,
    threads: 500,
    bluesky: 300,
    mastodon: 500,
    instagram: 2200,
    facebook: 63206,
    linkedin: 3000,
    tiktok: 2200,
    youtube: 5000,
    soundcloud: 4000,
    bandcamp: 5000,
    discord: 2000,
    telegram: 4096,
    pinterest: 500,
    whatsapp: 65536,
  };
  return limits[platformId];
}

// Generate platform-specific hashtags
export function generateHashtags(contentType: string, title: string): string[] {
  const baseHashtags: Record<string, string[]> = {
    'new-release': ['#NewMusic', '#OutNow', '#NewRelease', '#MusicRelease'],
    'tour-dates': ['#Tour', '#LiveMusic', '#OnTour', '#TourDates', '#Concert'],
    'behind-scenes': ['#BTS', '#BehindTheScenes', '#StudioLife', '#MakingOf'],
    'music-video': ['#MusicVideo', '#NewVideo', '#VideoRelease', '#Premiere'],
    merch: ['#Merch', '#NewMerch', '#MusicMerch', '#BandMerch'],
    'live-stream': ['#LiveStream', '#GoingLive', '#LiveMusic', '#StreamingNow'],
    collaboration: ['#Collab', '#Collaboration', '#Feature', '#NewCollab'],
    milestone: ['#Milestone', '#Grateful', '#ThankYou', '#Achievement'],
  };

  const hashtags = baseHashtags[contentType] || ['#Music', '#Artist'];

  // Add genre-neutral music hashtags
  hashtags.push('#IndependentArtist', '#SupportIndieMusic');

  return hashtags.slice(0, 10);
}

// Format content for a specific platform
export function formatForPlatform(platform: Platform, content: ContentToFormat): string {
  const { title, description, url, hashtags, contentType } = content;

  switch (platform.id) {
    case 'twitter':
      return formatForTwitter(content);
    case 'instagram':
      return formatForInstagram(content);
    case 'facebook':
      return formatForFacebook(content);
    case 'linkedin':
      return formatForLinkedIn(content);
    case 'tiktok':
      return formatForTikTok(content);
    case 'youtube':
      return formatForYouTube(content);
    case 'soundcloud':
      return formatForSoundCloud(content);
    case 'bandcamp':
      return formatForBandcamp(content);
    case 'threads':
      return formatForThreads(content);
    case 'discord':
      return formatForDiscord(content);
    case 'reddit':
      return formatForReddit(content);
    case 'spotify':
      return formatForSpotify(content);
    case 'whatsapp':
    case 'telegram':
      return formatForMessaging(content);
    case 'bluesky':
      return formatForBluesky(content);
    case 'mastodon':
      return formatForMastodon(content);
    default:
      return formatGeneric(content);
  }
}

// Twitter/X - 280 chars, threads for longer content
function formatForTwitter(content: ContentToFormat): string {
  const { title, description, url, hashtags } = content;

  // Build tweet
  let tweet = '';

  if (title) {
    tweet = `🎵 ${title}\n\n`;
  }

  // Add description (truncated if needed)
  const descLimit = 200 - tweet.length - (url ? 30 : 0);
  if (description) {
    tweet +=
      description.length > descLimit ? description.slice(0, descLimit - 3) + '...' : description;
  }

  // Add URL
  if (url) {
    tweet += `\n\n🔗 ${url}`;
  }

  // Add top 3 hashtags if space
  const topHashtags = hashtags.slice(0, 3).join(' ');
  if (tweet.length + topHashtags.length + 2 <= 280) {
    tweet += `\n\n${topHashtags}`;
  }

  return tweet.trim();
}

// Instagram - visual focus, hashtags in comments strategy
function formatForInstagram(content: ContentToFormat): string {
  const { title, description, url, hashtags, contentType } = content;

  let caption = '';

  // Compelling opening line
  const openers: Record<string, string> = {
    'new-release': '🎶 NEW MUSIC ALERT',
    'tour-dates': '🎤 TOUR ANNOUNCEMENT',
    'behind-scenes': '🎬 Behind the scenes',
    'music-video': '🎥 NEW VIDEO',
    merch: '🔥 NEW MERCH DROP',
    'live-stream': '📺 GOING LIVE',
    collaboration: '🤝 COLLAB ALERT',
    milestone: '🎉 MILESTONE',
  };

  caption = `${openers[contentType] || '🎵 NEW'}\n\n`;

  if (title) {
    caption += `"${title}"\n\n`;
  }

  if (description) {
    caption += `${description}\n\n`;
  }

  // CTA
  if (url) {
    caption += '👆 Link in bio\n\n';
  }

  // Add hashtags (Instagram best practice: 5-10 relevant hashtags)
  const instaHashtags = [...hashtags.slice(0, 8), '#music', '#musician'].slice(0, 10);

  caption += '.\n.\n.\n';
  caption += instaHashtags.join(' ');

  return caption;
}

// Facebook - longer form, engagement focused
function formatForFacebook(content: ContentToFormat): string {
  const { title, description, url, hashtags, contentType } = content;

  let post = '';

  if (title) {
    post = `🎵 ${title}\n\n`;
  }

  if (description) {
    post += `${description}\n\n`;
  }

  // Add engagement hook
  const hooks: Record<string, string> = {
    'new-release': 'What do you think? Drop a comment! 👇',
    'tour-dates': 'Will I see you there? Tag a friend who needs to come! 🎫',
    'behind-scenes': 'Want to see more content like this? Let me know! 💬',
    'music-video': "What's your favorite part? 🎬",
    merch: 'Which item are you grabbing? 🛒',
    'live-stream': 'Set a reminder! See you there! 🔔',
    collaboration: 'Who else should I collab with? 🤔',
    milestone: 'Thank you for making this possible! ❤️',
  };

  post += `${hooks[contentType] || 'What do you think?'}\n\n`;

  if (url) {
    post += `🔗 ${url}\n\n`;
  }

  // Facebook likes 3-5 hashtags
  post += hashtags.slice(0, 5).join(' ');

  return post;
}

// LinkedIn - professional tone
function formatForLinkedIn(content: ContentToFormat): string {
  const { title, description, url, contentType } = content;

  let post = '';

  // Professional opening
  const openers: Record<string, string> = {
    'new-release': 'Excited to announce my latest release:',
    'tour-dates': 'Upcoming tour dates announced:',
    'behind-scenes': 'A glimpse into the creative process:',
    'music-video': 'New visual project released:',
    merch: 'New merchandise collection available:',
    'live-stream': 'Join me for an exclusive live performance:',
    collaboration: 'Proud to announce a new collaboration:',
    milestone: 'Reflecting on an incredible milestone:',
  };

  post = `${openers[contentType] || 'Exciting news:'}\n\n`;

  if (title) {
    post += `"${title}"\n\n`;
  }

  if (description) {
    post += `${description}\n\n`;
  }

  // Professional CTA
  post += "I'd love to hear your thoughts and feedback.\n\n";

  if (url) {
    post += `Listen/Watch here: ${url}\n\n`;
  }

  // Professional hashtags
  post += '#MusicIndustry #IndependentArtist #NewMusic #MusicBusiness';

  return post;
}

// TikTok - casual, trend-aware, hooks
function formatForTikTok(content: ContentToFormat): string {
  const { title, description, hashtags, contentType } = content;

  let caption = '';

  // Hook first
  const hooks: Record<string, string> = {
    'new-release': 'POV: You just dropped a banger 🔥',
    'tour-dates': 'Coming to a city near you 📍',
    'behind-scenes': 'How the magic happens ✨',
    'music-video': 'the new video just dropped 🎬',
    merch: 'New merch check 🛍️',
    'live-stream': 'going live soon! 📺',
    collaboration: 'When the collab hits different 🤝',
    milestone: 'we did it 🥹',
  };

  caption = `${hooks[contentType] || 'new music 🎵'}\n\n`;

  if (title) {
    caption += `"${title}"\n\n`;
  }

  if (description && description.length < 100) {
    caption += `${description}\n\n`;
  }

  // TikTok hashtags (fewer, trend-focused)
  const tiktokHashtags = ['#fyp', '#music', '#newmusic', ...hashtags.slice(0, 2)].slice(0, 5);

  caption += tiktokHashtags.join(' ');

  return caption;
}

// YouTube - detailed description, SEO focused
function formatForYouTube(content: ContentToFormat): string {
  const { title, description, url, hashtags, contentType } = content;

  let desc = '';

  if (title) {
    desc = `${title}\n\n`;
  }

  if (description) {
    desc += `${description}\n\n`;
  }

  // Add sections
  desc += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  if (url) {
    desc += `🔗 LINKS\n${url}\n\n`;
  }

  desc += '📱 FOLLOW ME\n';
  desc += '• Instagram: @\n';
  desc += '• Twitter: @\n';
  desc += '• TikTok: @\n\n';

  desc += '🎵 STREAMING\n';
  desc += '• Spotify: \n';
  desc += '• Apple Music: \n';
  desc += '• SoundCloud: \n\n';

  // Hashtags at end
  desc += hashtags.slice(0, 10).join(' ');

  return desc;
}

// SoundCloud - detailed track info
function formatForSoundCloud(content: ContentToFormat): string {
  const { title, description, url, hashtags } = content;

  let desc = '';

  if (description) {
    desc = `${description}\n\n`;
  }

  desc += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  desc += '📱 Connect with me:\n';
  desc += '• Instagram: \n';
  desc += '• Twitter: \n';
  desc += '• Website: \n\n';

  if (url) {
    desc += `🔗 More links: ${url}\n\n`;
  }

  desc += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  desc += hashtags.join(' ');

  return desc;
}

// Bandcamp - fan-focused, story-driven
function formatForBandcamp(content: ContentToFormat): string {
  const { title, description, url, contentType } = content;

  let desc = '';

  if (description) {
    desc = `${description}\n\n`;
  }

  // Bandcamp appreciates artist stories
  desc += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  desc += 'Thank you for supporting independent music.\n';
  desc += 'Every purchase directly supports my ability to create.\n\n';

  if (url) {
    desc += `More music: ${url}`;
  }

  return desc;
}

// Threads - casual, conversational
function formatForThreads(content: ContentToFormat): string {
  const { title, description, url, hashtags } = content;

  let post = '';

  if (title) {
    post = `${title}\n\n`;
  }

  if (description) {
    const truncated = description.length > 400 ? description.slice(0, 397) + '...' : description;
    post += `${truncated}\n\n`;
  }

  if (url) {
    post += `🔗 ${url}\n\n`;
  }

  // Threads: minimal hashtags
  post += hashtags.slice(0, 3).join(' ');

  return post.slice(0, 500);
}

// Discord - announcement style with formatting
function formatForDiscord(content: ContentToFormat): string {
  const { title, description, url, contentType } = content;

  let post = '';

  // Discord supports some markdown
  const headers: Record<string, string> = {
    'new-release': '🎵 **NEW RELEASE**',
    'tour-dates': '🎤 **TOUR ANNOUNCEMENT**',
    'behind-scenes': '🎬 **BEHIND THE SCENES**',
    'music-video': '🎥 **NEW VIDEO**',
    merch: '🛍️ **NEW MERCH**',
    'live-stream': '📺 **GOING LIVE**',
    collaboration: '🤝 **NEW COLLAB**',
    milestone: '🎉 **MILESTONE**',
  };

  post = `${headers[contentType] || '📢 **ANNOUNCEMENT**'}\n\n`;

  if (title) {
    post += `**${title}**\n\n`;
  }

  if (description) {
    post += `${description}\n\n`;
  }

  if (url) {
    post += `🔗 ${url}`;
  }

  return post;
}

// Reddit - authentic, community-focused
function formatForReddit(content: ContentToFormat): string {
  const { title, description, url, contentType } = content;

  let post = '';

  // Reddit appreciates authenticity
  if (description) {
    post = `${description}\n\n`;
  }

  // Add context
  post += '---\n\n';
  post += 'Would love to hear what you think! Open to any feedback.\n\n';

  if (url) {
    post += `Link: ${url}`;
  }

  return post;
}

// Spotify - concise for playlist pitching
function formatForSpotify(content: ContentToFormat): string {
  const { title, description, contentType } = content;

  // Spotify artist pick / playlist pitch format
  let pitch = '';

  if (title) {
    pitch = `"${title}"\n\n`;
  }

  if (description) {
    // Keep it short for pitching
    pitch += description.length > 200 ? description.slice(0, 197) + '...' : description;
  }

  return pitch;
}

// Messaging apps (WhatsApp, Telegram)
function formatForMessaging(content: ContentToFormat): string {
  const { title, description, url } = content;

  let message = '';

  if (title) {
    message = `🎵 *${title}*\n\n`;
  }

  if (description) {
    message += `${description}\n\n`;
  }

  if (url) {
    message += `🔗 ${url}`;
  }

  return message;
}

// Bluesky - Twitter alternative
function formatForBluesky(content: ContentToFormat): string {
  const { title, description, url, hashtags } = content;

  let post = '';

  if (title) {
    post = `🎵 ${title}\n\n`;
  }

  const descLimit = 200 - post.length;
  if (description) {
    post +=
      description.length > descLimit ? description.slice(0, descLimit - 3) + '...' : description;
  }

  if (url) {
    post += `\n\n🔗 ${url}`;
  }

  return post.slice(0, 300);
}

// Mastodon - similar to Twitter but longer
function formatForMastodon(content: ContentToFormat): string {
  const { title, description, url, hashtags } = content;

  let toot = '';

  if (title) {
    toot = `🎵 ${title}\n\n`;
  }

  if (description) {
    const truncated = description.length > 350 ? description.slice(0, 347) + '...' : description;
    toot += truncated;
  }

  if (url) {
    toot += `\n\n🔗 ${url}`;
  }

  toot += '\n\n' + hashtags.slice(0, 5).join(' ');

  return toot.slice(0, 500);
}

// Generic fallback
function formatGeneric(content: ContentToFormat): string {
  const { title, description, url, hashtags } = content;

  let post = '';

  if (title) {
    post = `${title}\n\n`;
  }

  if (description) {
    post += `${description}\n\n`;
  }

  if (url) {
    post += `${url}\n\n`;
  }

  post += hashtags.slice(0, 5).join(' ');

  return post;
}

// Export utilities
export const formatters = {
  twitter: formatForTwitter,
  instagram: formatForInstagram,
  facebook: formatForFacebook,
  linkedin: formatForLinkedIn,
  tiktok: formatForTikTok,
  youtube: formatForYouTube,
  soundcloud: formatForSoundCloud,
  bandcamp: formatForBandcamp,
  threads: formatForThreads,
  discord: formatForDiscord,
  reddit: formatForReddit,
  spotify: formatForSpotify,
  messaging: formatForMessaging,
  bluesky: formatForBluesky,
  mastodon: formatForMastodon,
  generic: formatGeneric,
};
