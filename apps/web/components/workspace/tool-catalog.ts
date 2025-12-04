/**
 * Tool Catalog - All available tools for custom workspaces
 *
 * Each tool represents a feature/page that can be added to a workspace.
 * Grouped by purpose for easy discovery.
 */

import {
  Users,
  Globe,
  Library,
  Guitar,
  MapPin,
  Briefcase,
  Video,
  GraduationCap,
  ShoppingBag,
  Mail,
  MessageCircle,
  Target,
  Compass,
  Sparkles,
  DollarSign,
  FlaskConical,
  ListMusic,
  Headphones,
  type IconProps,
  // Custom musician icons
  SongManuscript,
  VintageCondenserMic,
  BandMembers,
  TourCalendar,
  BroadcastTower,
  VinylRecord,
  MusiciansMultiTool,
  StageLights,
} from '@/components/ui/custom-icons';

export interface ToolDefinition {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<IconProps>;
  href: string;
  color: string;
  category: 'create' | 'connect' | 'perform' | 'business' | 'tools';
}

export const TOOL_CATALOG: ToolDefinition[] = [
  // CREATE - Core creative tools
  {
    key: 'songwriting',
    label: 'Songwriting',
    description: 'Write lyrics, melodies, and arrangements',
    icon: SongManuscript,
    href: '/songwriting',
    color: 'var(--accent)',
    category: 'create',
  },
  {
    key: 'songs',
    label: 'My Songs',
    description: 'Your song library and projects',
    icon: VinylRecord,
    href: '/songs',
    color: 'var(--accent)',
    category: 'create',
  },
  {
    key: 'studio',
    label: 'Studio',
    description: 'Record, mix, and produce',
    icon: VintageCondenserMic,
    href: '/studio',
    color: 'var(--sage)',
    category: 'create',
  },
  {
    key: 'library',
    label: 'Library',
    description: 'Stems, samples, and files',
    icon: Library,
    href: '/library',
    color: 'var(--gold)',
    category: 'create',
  },

  // CONNECT - Collaboration and social
  {
    key: 'discover',
    label: 'Discover',
    description: 'Find and connect with musicians',
    icon: Compass,
    href: '/discover',
    color: 'var(--accent)',
    category: 'connect',
  },
  {
    key: 'collaboration',
    label: 'Collaborate',
    description: 'Work with other artists',
    icon: BandMembers,
    href: '/collaboration',
    color: 'var(--sky)',
    category: 'connect',
  },
  {
    key: 'messages',
    label: 'Messages',
    description: 'Chat with collaborators',
    icon: MessageCircle,
    href: '/messages',
    color: 'var(--sky)',
    category: 'connect',
  },
  {
    key: 'feed',
    label: 'Feed',
    description: 'Social updates and posts',
    icon: Sparkles,
    href: '/feed',
    color: 'var(--accent)',
    category: 'connect',
  },
  {
    key: 'meet',
    label: 'Meet',
    description: 'Video calls with your team',
    icon: Video,
    href: '/meet',
    color: '#8b5cf6',
    category: 'connect',
  },

  // PERFORM - Live and touring
  {
    key: 'shows',
    label: 'Shows',
    description: 'Manage your gig calendar',
    icon: TourCalendar,
    href: '/shows',
    color: 'var(--sky)',
    category: 'perform',
  },
  {
    key: 'tours',
    label: 'Tours',
    description: 'Plan and manage tours',
    icon: MapPin,
    href: '/tours',
    color: 'var(--clay)',
    category: 'perform',
  },
  {
    key: 'setlists',
    label: 'Setlists',
    description: 'Build and manage setlists',
    icon: ListMusic,
    href: '/setlists',
    color: 'var(--gold)',
    category: 'perform',
  },
  {
    key: 'live',
    label: 'Go Live',
    description: 'Stream to your fans',
    icon: BroadcastTower,
    href: '/live',
    color: '#ef4444',
    category: 'perform',
  },

  // BUSINESS - Career and monetization
  {
    key: 'opportunities',
    label: 'Opportunities',
    description: 'Find gigs and placements',
    icon: Briefcase,
    href: '/opportunities',
    color: 'var(--gold)',
    category: 'business',
  },
  {
    key: 'sites',
    label: 'My Site',
    description: 'Your artist website',
    icon: Globe,
    href: '/sites',
    color: 'var(--accent)',
    category: 'business',
  },
  {
    key: 'merch',
    label: 'Merch',
    description: 'Sell your merchandise',
    icon: ShoppingBag,
    href: '/my-merch',
    color: '#f59e0b',
    category: 'business',
  },
  {
    key: 'marketplace',
    label: 'Gear Market',
    description: 'Buy and sell equipment',
    icon: ShoppingBag,
    href: '/marketplace',
    color: '#f59e0b',
    category: 'business',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    description: 'Track your earnings',
    icon: DollarSign,
    href: '/revenue',
    color: 'var(--gold)',
    category: 'business',
  },
  {
    key: 'mail',
    label: 'Email',
    description: 'Professional @rnrb.me email',
    icon: Mail,
    href: '/mail',
    color: '#38bdf8',
    category: 'business',
  },

  // TOOLS - Utilities and learning
  {
    key: 'tools',
    label: 'Toolbox',
    description: "Musician's utilities",
    icon: MusiciansMultiTool,
    href: '/tools',
    color: 'var(--gold)',
    category: 'tools',
  },
  {
    key: 'masterclasses',
    label: 'Classes',
    description: 'Learn from the best',
    icon: GraduationCap,
    href: '/masterclasses',
    color: '#ec4899',
    category: 'tools',
  },
  {
    key: 'labs',
    label: 'Labs',
    description: 'Experimental features',
    icon: FlaskConical,
    href: '/labs',
    color: '#8b5cf6',
    category: 'tools',
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'Account preferences',
    icon: MusiciansMultiTool,
    href: '/settings',
    color: 'var(--muted)',
    category: 'tools',
  },
];

// Group tools by category for the catalog UI
export const TOOL_CATEGORIES = {
  create: {
    label: 'Create',
    description: 'Writing, recording, and production',
    icon: SongManuscript,
  },
  connect: {
    label: 'Connect',
    description: 'Collaboration and community',
    icon: BandMembers,
  },
  perform: {
    label: 'Perform',
    description: 'Shows, tours, and live streaming',
    icon: StageLights,
  },
  business: {
    label: 'Business',
    description: 'Career and monetization',
    icon: Briefcase,
  },
  tools: {
    label: 'Tools',
    description: 'Utilities and learning',
    icon: MusiciansMultiTool,
  },
} as const;

// Get a tool by its key
export function getToolByKey(key: string): ToolDefinition | undefined {
  return TOOL_CATALOG.find((tool) => tool.key === key);
}

// Get tools by category
export function getToolsByCategory(category: ToolDefinition['category']): ToolDefinition[] {
  return TOOL_CATALOG.filter((tool) => tool.category === category);
}

// Default tools for new users (sensible starting point)
export const DEFAULT_WORKSPACE_TOOLS = [
  'songwriting',
  'songs',
  'library',
  'studio',
  'discover',
  'shows',
  'opportunities',
  'messages',
  'mail',
  'tools',
  'sites',
  'masterclasses',
  'tours',
  'settings',
];

// AI-suggested tool groupings by workspace purpose
export const WORKSPACE_SUGGESTIONS: Record<string, string[]> = {
  writing: ['songwriting', 'songs', 'library', 'tools'],
  songwriting: ['songwriting', 'songs', 'library', 'tools'],
  recording: ['studio', 'library', 'songs', 'tools'],
  studio: ['studio', 'library', 'songs', 'tools'],
  collaboration: ['collaboration', 'messages', 'meet', 'discover'],
  collab: ['collaboration', 'messages', 'meet', 'discover'],
  social: ['feed', 'discover', 'messages', 'collaboration'],
  connect: ['discover', 'messages', 'collaboration', 'feed'],
  live: ['live', 'setlists', 'shows', 'tours'],
  performance: ['shows', 'setlists', 'tours', 'live'],
  touring: ['tours', 'shows', 'setlists', 'revenue'],
  tour: ['tours', 'shows', 'setlists', 'revenue'],
  business: ['opportunities', 'revenue', 'merch', 'sites'],
  career: ['opportunities', 'revenue', 'merch', 'sites'],
  learning: ['masterclasses', 'tools', 'labs', 'library'],
  practice: ['tools', 'masterclasses', 'library', 'songs'],
};

// Get AI suggestions based on workspace name
export function getSuggestedToolsForWorkspace(workspaceName: string): string[] {
  const normalizedName = workspaceName.toLowerCase().trim();

  // Check for exact or partial matches
  for (const [keyword, tools] of Object.entries(WORKSPACE_SUGGESTIONS)) {
    if (normalizedName.includes(keyword)) {
      return tools;
    }
  }

  // Default suggestions if no match
  return ['songwriting', 'library', 'messages', 'tools'];
}
