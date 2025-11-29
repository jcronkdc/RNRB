/**
 * Client-Safe Subscription Constants
 *
 * These constants can be safely imported in client components
 * without bundling Prisma or other server-only dependencies.
 */

export type SubscriptionTier = 'free' | 'creator' | 'studio';

/**
 * Feature descriptions for upgrade prompts
 */
export const FEATURE_DESCRIPTIONS: Record<
  string,
  { title: string; description: string; icon: string }
> = {
  setlistManagement: {
    title: 'Smart Setlist Management',
    description:
      'AI-powered setlist generation, templates, and performance mode for live shows. Organize your songs by energy level, key, and duration.',
    icon: 'ListMusic',
  },
  toursAndGigs: {
    title: 'Tour & Gig Management',
    description:
      'Track your shows, venues, and tour schedules. Manage load-ins, soundchecks, and setlists for each performance.',
    icon: 'Radio',
  },
  advancedAnalytics: {
    title: 'Advanced Analytics',
    description:
      'Deep insights into your music career: streaming stats, revenue tracking, audience demographics, and growth trends.',
    icon: 'BarChart3',
  },
  liveCollaboration: {
    title: 'Live Collaboration',
    description:
      'Real-time video sessions with your band. Co-write songs, jam remotely, and record together from anywhere.',
    icon: 'Users2',
  },
  customBranding: {
    title: 'Custom Branding',
    description:
      'White-label your projects with custom logos, colors, and domain names. Perfect for labels and studios.',
    icon: 'Palette',
  },
  apiAccess: {
    title: 'API Access',
    description:
      'Build custom integrations and automate workflows with our REST API. Perfect for power users and developers.',
    icon: 'Code',
  },
};
