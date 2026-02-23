/**
 * Workspace Templates
 *
 * Smart pre-configured workspaces for different musician workflows.
 * Used by AI to suggest and create workspaces from natural language.
 */

export interface WorkspaceTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  tools: string[];
  gradient: string;
  keywords: string[]; // For AI matching
  emoji?: string; // For preview (we'll convert to icon)
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  // CREATION TEMPLATES
  {
    id: 'songwriter',
    name: 'Writing Room',
    icon: 'music',
    description: 'Your creative sanctuary for writing and developing songs',
    tools: ['songwriting', 'songs', 'library', 'tools'],
    gradient: 'from-rose-500 via-pink-500 to-orange-500',
    keywords: ['write', 'writing', 'songwriter', 'songs', 'lyrics', 'compose', 'creative'],
  },
  {
    id: 'producer',
    name: 'Producer Suite',
    icon: 'music',
    description: 'Full production toolkit for recording and mixing',
    tools: ['studio', 'library', 'songs', 'collaboration', 'tools'],
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    keywords: [
      'produce',
      'producer',
      'production',
      'record',
      'recording',
      'mix',
      'mixing',
      'studio',
    ],
  },
  {
    id: 'session',
    name: 'Session Central',
    icon: 'studio',
    description: 'Quick access for studio sessions',
    tools: ['studio', 'library', 'collaboration', 'messages'],
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    keywords: ['session', 'tracking', 'overdub', 'quick', 'fast'],
  },

  // PERFORMANCE TEMPLATES
  {
    id: 'performer',
    name: 'Stage Ready',
    icon: 'mic',
    description: 'Everything you need for live performances',
    tools: ['shows', 'setlists', 'tours', 'live'],
    gradient: 'from-red-500 via-rose-500 to-pink-500',
    keywords: ['perform', 'performer', 'live', 'stage', 'gig', 'show', 'concert'],
  },
  {
    id: 'touring',
    name: 'Tour HQ',
    icon: 'map',
    description: 'Command center for tour planning and management',
    tools: ['tours', 'shows', 'setlists', 'revenue', 'messages'],
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    keywords: ['tour', 'touring', 'road', 'travel', 'venues', 'route'],
  },
  {
    id: 'setlist',
    name: 'Setlist Lab',
    icon: 'list',
    description: 'Build and perfect your setlists',
    tools: ['setlists', 'songs', 'shows', 'tools'],
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    keywords: ['setlist', 'setlists', 'playlist', 'order', 'flow', 'arrangement'],
  },

  // COLLABORATION TEMPLATES
  {
    id: 'collaborator',
    name: 'Collab Space',
    icon: 'users',
    description: 'Work seamlessly with other musicians',
    tools: ['collaboration', 'messages', 'meet', 'discover', 'feed'],
    gradient: 'from-sky-500 via-blue-500 to-indigo-500',
    keywords: ['collab', 'collaborate', 'collaboration', 'team', 'band', 'partner', 'feature'],
  },
  {
    id: 'social',
    name: 'Network Hub',
    icon: 'globe',
    description: 'Connect with the music community',
    tools: ['discover', 'feed', 'messages', 'collaboration'],
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    keywords: ['social', 'network', 'connect', 'community', 'fans', 'friends'],
  },

  // BUSINESS TEMPLATES
  {
    id: 'business',
    name: 'Business Manager',
    icon: 'briefcase',
    description: 'Run the business side of your music career',
    tools: ['opportunities', 'revenue', 'merch', 'sites', 'mail'],
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    keywords: ['business', 'career', 'money', 'income', 'professional', 'manager'],
  },
  {
    id: 'merch',
    name: 'Merch Store',
    icon: 'bag',
    description: 'Design and sell your merchandise',
    tools: ['merch', 'revenue', 'sites', 'mail'],
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    keywords: ['merch', 'merchandise', 'store', 'sell', 'shop', 'tshirt', 'hoodie'],
  },
  {
    id: 'hustler',
    name: 'Opportunity Hunter',
    icon: 'target',
    description: 'Find and land your next gig',
    tools: ['opportunities', 'messages', 'discover', 'revenue'],
    gradient: 'from-lime-500 via-green-500 to-emerald-500',
    keywords: ['opportunity', 'gig', 'hustle', 'job', 'placement', 'sync', 'license'],
  },

  // LEARNING TEMPLATES
  {
    id: 'learner',
    name: 'Learning Studio',
    icon: 'graduation',
    description: 'Level up your skills',
    tools: ['masterclasses', 'tools', 'library', 'labs'],
    gradient: 'from-indigo-500 via-violet-500 to-purple-500',
    keywords: ['learn', 'learning', 'study', 'practice', 'improve', 'skill', 'education'],
  },
  {
    id: 'experimenter',
    name: 'Sound Lab',
    icon: 'flask',
    description: 'Experiment with new sounds and techniques',
    tools: ['labs', 'studio', 'library', 'tools'],
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
    keywords: ['experiment', 'lab', 'new', 'explore', 'innovation', 'creative', 'beta'],
  },

  // SPECIALIZED TEMPLATES
  {
    id: 'streaming',
    name: 'Stream Station',
    icon: 'radio',
    description: 'Go live and connect with fans',
    tools: ['live', 'feed', 'messages', 'setlists'],
    gradient: 'from-red-600 via-red-500 to-pink-500',
    keywords: ['stream', 'live', 'broadcast', 'twitch', 'youtube', 'fans'],
  },
  {
    id: 'minimal',
    name: 'Focus Mode',
    icon: 'target',
    description: 'Distraction-free essentials',
    tools: ['songwriting', 'songs', 'tools'],
    gradient: 'from-zinc-500 via-slate-500 to-gray-500',
    keywords: ['minimal', 'simple', 'focus', 'clean', 'basic', 'essential'],
  },
];

// Icon mapping for templates (LucideReact icon names)
export const TEMPLATE_ICONS: Record<string, string> = {
  music: 'Music4',
  mic: 'Mic2',
  studio: 'Headphones',
  map: 'MapPin',
  list: 'ListMusic',
  users: 'Users',
  globe: 'Globe',
  briefcase: 'Briefcase',
  bag: 'ShoppingBag',
  target: 'Target',
  graduation: 'GraduationCap',
  flask: 'FlaskConical',
  radio: 'Radio',
  sparkles: 'Sparkles',
};

/**
 * Find matching templates for a natural language query
 */
export function findMatchingTemplates(query: string, limit = 3): WorkspaceTemplate[] {
  const normalizedQuery = query.toLowerCase();
  const words = normalizedQuery.split(/\s+/);

  // Score each template based on keyword matches
  const scored = WORKSPACE_TEMPLATES.map((template) => {
    let score = 0;

    // Check direct keyword matches
    for (const keyword of template.keywords) {
      if (normalizedQuery.includes(keyword)) {
        score += 10;
      }
      // Partial matches
      for (const word of words) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 3;
        }
      }
    }

    // Check name matches
    if (normalizedQuery.includes(template.name.toLowerCase())) {
      score += 20;
    }

    // Check description matches
    for (const word of words) {
      if (template.description.toLowerCase().includes(word)) {
        score += 2;
      }
    }

    return { template, score };
  });

  // Sort by score and return top matches
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.template);
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): WorkspaceTemplate | undefined {
  return WORKSPACE_TEMPLATES.find((t) => t.id === id);
}

/**
 * Parse a natural language workspace description and generate config
 */
export function parseWorkspaceDescription(description: string): {
  suggestedName: string;
  suggestedIcon: string;
  suggestedTools: string[];
  matchedTemplate?: WorkspaceTemplate;
} {
  const matches = findMatchingTemplates(description, 1);

  if (matches.length > 0) {
    const template = matches[0];
    return {
      suggestedName: template.name,
      suggestedIcon: template.icon,
      suggestedTools: template.tools,
      matchedTemplate: template,
    };
  }

  // Default fallback
  return {
    suggestedName: 'My Workspace',
    suggestedIcon: 'layout',
    suggestedTools: ['songwriting', 'library', 'messages', 'tools'],
  };
}
