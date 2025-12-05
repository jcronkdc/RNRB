/**
 * CENTRALIZED ROUTE CONSTANTS
 *
 * This file is the SINGLE SOURCE OF TRUTH for all application routes.
 * ALWAYS import from here instead of hardcoding route strings.
 *
 * Benefits:
 * - Prevents broken links from typos or inconsistent paths
 * - Makes route changes easy (update once, works everywhere)
 * - TypeScript ensures compile-time safety
 * - Enables route validation in CI/tests
 */

/**
 * Application Routes
 * Use these functions/constants for all internal links
 */
export const ROUTES = {
  // ============================================
  // HOME & DASHBOARD
  // ============================================
  home: '/',
  dashboard: '/dashboard',
  workspace: '/workspace',

  // ============================================
  // USER PROFILES
  // ============================================
  profile: {
    /** View another user's public profile */
    view: (userId: string) => `/community/users/${userId}` as const,
    /** View your own profile */
    own: '/social/profile' as const,
    /** Edit your profile settings */
    edit: '/settings/profile' as const,
  },

  // ============================================
  // SOCIAL FEATURES
  // ============================================
  social: {
    feed: '/social' as const,
    discover: '/social/discover' as const,
    explore: '/social/explore' as const,
    network: '/social/network' as const,
    friends: '/social/friends' as const,
    blocked: '/social/blocked' as const,
    notifications: '/social/notifications' as const,
    messages: {
      inbox: '/social/messages' as const,
      requests: '/social/messages/requests' as const,
      report: '/social/messages/report' as const,
    },
  },

  // ============================================
  // FEED & POSTS
  // ============================================
  feed: {
    main: '/feed' as const,
    explore: '/feed/explore' as const,
    post: (postId: string) => `/feed/post/${postId}` as const,
    tag: (tag: string) => `/feed/tag/${encodeURIComponent(tag)}` as const,
    withFilter: (filter: string) => `/feed?type=${filter}` as const,
    withTag: (tag: string) => `/feed?tag=${encodeURIComponent(tag)}` as const,
  },

  // ============================================
  // COMMUNITY
  // ============================================
  community: {
    user: (userId: string) => `/community/users/${userId}` as const,
  },

  // ============================================
  // MESSAGING & MAIL
  // ============================================
  mail: {
    inbox: '/mail' as const,
    compose: (toUserId?: string) =>
      toUserId ? (`/mail/compose?to=${toUserId}` as const) : ('/mail/compose' as const),
  },
  messages: {
    main: '/messages' as const,
    withUser: (userId: string) => `/messages?user=${userId}` as const,
  },

  // ============================================
  // MUSIC & CREATIVE
  // ============================================
  library: '/library' as const,
  songs: '/songs' as const,
  songwriting: '/songwriting' as const,
  studio: {
    main: '/studio' as const,
    recordingGuide: '/studio/recording-guide' as const,
  },
  create: '/create' as const,

  // ============================================
  // COLLABORATION
  // ============================================
  collaboration: '/collaboration' as const,
  collaborationNeeds: '/collaboration-needs' as const,
  opportunities: {
    list: '/opportunities' as const,
    view: (id: string) => `/opportunities/${id}` as const,
    post: '/opportunities/post' as const,
  },

  // ============================================
  // MARKETPLACE
  // ============================================
  marketplace: {
    main: '/marketplace' as const,
    listing: (id: string) => `/marketplace/${id}` as const,
    edit: (id: string) => `/marketplace/${id}/edit` as const,
    create: '/marketplace/create' as const,
    myListings: '/marketplace/my-listings' as const,
    becomeProvider: '/marketplace/become-provider' as const,
    messages: '/marketplace/messages' as const,
    seller: (id: string) => `/marketplace/seller/${id}` as const,
    review: (userId: string) => `/marketplace/review/${userId}` as const,
  },

  // ============================================
  // MASTERCLASSES
  // ============================================
  masterclasses: {
    list: '/masterclasses' as const,
    view: (slug: string) => `/masterclasses/${slug}` as const,
    watch: (slug: string) => `/masterclasses/${slug}/watch` as const,
    live: (slug: string) => `/masterclasses/${slug}/live` as const,
    certificate: (slug: string) => `/masterclasses/${slug}/certificate` as const,
    create: '/masterclasses/create' as const,
    becomeInstructor: '/masterclasses/become-instructor' as const,
    instructor: {
      dashboard: '/masterclasses/instructor' as const,
      analytics: '/masterclasses/instructor/analytics' as const,
    },
  },

  // ============================================
  // TOURS & SHOWS
  // ============================================
  tours: {
    list: '/tours' as const,
    view: (slug: string) => `/tours/${slug}` as const,
  },
  shows: {
    list: '/shows' as const,
    calendar: '/shows/calendar' as const,
    today: '/shows/today' as const,
    new: '/shows/new' as const,
    view: (id: string) => `/shows/${id}` as const,
    edit: (id: string) => `/shows/${id}/edit` as const,
  },

  // ============================================
  // LIVE STREAMING
  // ============================================
  live: {
    main: '/live' as const,
    go: '/live/go' as const,
    stream: (streamId: string) => `/live/${streamId}` as const,
    analytics: '/live/analytics' as const,
  },

  // ============================================
  // VIDEO MEETINGS
  // ============================================
  meet: {
    main: '/meet' as const,
    room: (meetingCode: string) => `/meet/${meetingCode}` as const,
    analytics: '/meet/analytics' as const,
  },

  // ============================================
  // MERCH
  // ============================================
  merch: {
    shop: '/merch' as const,
    checkout: '/merch/checkout' as const,
    success: '/merch/success' as const,
    orders: '/merch/orders' as const,
    design: '/merch/design' as const,
  },
  myMerch: {
    main: '/my-merch' as const,
    create: '/my-merch/create' as const,
    customize: (productId: string) => `/my-merch/customize/${productId}` as const,
    earnings: '/my-merch/earnings' as const,
    printfulCatalog: '/my-merch/printful-catalog' as const,
  },

  // ============================================
  // SETTINGS
  // ============================================
  settings: {
    main: '/settings' as const,
    profile: '/settings/profile' as const,
    billing: '/settings/billing' as const,
    display: '/settings/display' as const,
    email: '/settings/email' as const,
    usage: '/settings/usage' as const,
  },

  // ============================================
  // AFFILIATE & REVENUE
  // ============================================
  affiliate: {
    main: '/affiliate' as const,
    streamSetup: '/affiliate/stream-setup' as const,
  },
  revenue: '/revenue' as const,
  credits: '/credits' as const,

  // ============================================
  // LABS & EXPERIMENTAL
  // ============================================
  labs: {
    main: '/labs' as const,
    contribute: '/labs/contribute' as const,
    experiment: '/labs/experiment' as const,
    research: '/labs/research' as const,
    volunteer: '/labs/volunteer' as const,
  },

  // ============================================
  // SITES & TOOLS
  // ============================================
  sites: {
    main: '/sites' as const,
    edit: '/sites/edit' as const,
    success: '/sites/success' as const,
  },
  tools: '/tools' as const,
  setlistsPage: '/setlists' as const,
  share: '/share' as const,

  // ============================================
  // HELP & SUPPORT
  // ============================================
  help: {
    main: '/help' as const,
    merch: '/help/merch' as const,
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  notifications: '/notifications' as const,

  // ============================================
  // DISCOVER
  // ============================================
  discover: '/discover' as const,
  explore: '/explore' as const,

  // ============================================
  // NETWORK
  // ============================================
  network: '/network' as const,

  // ============================================
  // AUTH
  // ============================================
  auth: {
    main: '/auth' as const,
    signup: '/auth?signup=true' as const,
    signin: '/signin' as const,
    login: '/login' as const,
  },

  // ============================================
  // LEGAL & MARKETING
  // ============================================
  legal: {
    terms: '/terms' as const,
    privacy: '/privacy' as const,
    dmca: '/dmca' as const,
    instructorTerms: '/legal/instructor-terms' as const,
  },
  marketing: {
    pricing: '/pricing' as const,
    features: '/features' as const,
    whyRnrb: '/why-rnrb' as const,
    about: '/about' as const,
    contact: '/contact' as const,
    donate: '/donate' as const,
    blog: '/blog' as const,
    support: '/support' as const,
  },

  // ============================================
  // PUBLIC PAGES
  // ============================================
  public: {
    userProfile: (username: string) => `/u/${username}` as const,
    userMerch: (username: string) => `/u/${username}/merch` as const,
    sitePreview: (id: string) => `/s/${id}` as const,
    setlistShare: (token: string) => `/setlist/${token}` as const,
    shareLink: (token: string) => `/share/${token}` as const,
  },

  // ============================================
  // VENUES
  // ============================================
  venues: '/venues' as const,

  // ============================================
  // ADMIN
  // ============================================
  admin: {
    main: '/admin' as const,
    users: '/admin/users' as const,
    user: (id: string) => `/admin/users/${id}` as const,
    analytics: '/admin/analytics' as const,
    reports: '/admin/reports' as const,
    bugs: '/admin/bugs' as const,
  },

  // ============================================
  // PROJECTS (Extended)
  // ============================================
  projects: {
    list: '/projects' as const,
    new: '/projects/new' as const,
    view: (slug: string) => `/projects/${slug}` as const,
    settings: (slug: string) => `/projects/${slug}/settings` as const,
    collaborate: (slug: string) => `/projects/${slug}/collaborate` as const,
    sessions: (slug: string) => `/projects/${slug}/sessions` as const,
    setlists: (slug: string) => `/projects/${slug}/setlists` as const,
    song: (slug: string, songId: string) => `/projects/${slug}/songs/${songId}` as const,
  },

  // ============================================
  // SETLISTS (Extended)
  // ============================================
  setlists: {
    list: '/setlists' as const,
    new: '/setlists/new' as const,
    view: (id: string) => `/setlists/${id}` as const,
    perform: (id: string) => `/setlists/${id}/perform` as const,
  },

  // ============================================
  // ASSISTANT
  // ============================================
  assistant: '/assistant' as const,
} as const;

/**
 * API Routes (for reference, not typically used in links)
 */
export const API_ROUTES = {
  community: {
    follow: (userId: string) => `/api/community/users/${userId}/follow` as const,
  },
  social: {
    profile: (userId?: string) =>
      userId ? (`/api/social/profile/${userId}` as const) : ('/api/social/profile' as const),
  },
  network: '/api/network' as const,
  discover: {
    search: '/api/discover/search' as const,
  },
  users: {
    suggested: '/api/users/suggested' as const,
  },
  feed: {
    trending: '/api/feed/trending' as const,
    search: '/api/feed/search' as const,
  },
} as const;

/**
 * Type helper to extract route string type
 */
export type RouteString = string;

/**
 * Validate that a route exists (for runtime checks)
 */
export function isValidRoute(path: string): boolean {
  // Strip query params for validation
  const basePath = path.split('?')[0];

  // Check against known route patterns
  const knownPatterns = [
    /^\/$/,
    /^\/dashboard$/,
    /^\/community\/users\/[^/]+$/,
    /^\/social\/(profile|discover|explore|network|friends|blocked|notifications)$/,
    /^\/social\/profile\/[^/]+$/,
    /^\/social\/messages(\/requests|\/report)?$/,
    /^\/feed(\/explore)?$/,
    /^\/feed\/post\/[^/]+$/,
    /^\/feed\/tag\/[^/]+$/,
    /^\/mail(\/compose)?$/,
    /^\/messages$/,
    /^\/library$/,
    /^\/songs$/,
    /^\/songwriting$/,
    /^\/studio(\/recording-guide)?$/,
    /^\/create$/,
    /^\/collaboration(-needs)?$/,
    /^\/opportunities(\/post)?$/,
    /^\/opportunities\/[^/]+$/,
    /^\/marketplace(\/create|\/my-listings|\/become-provider|\/messages)?$/,
    /^\/marketplace\/[^/]+(\/edit)?$/,
    /^\/marketplace\/seller\/[^/]+$/,
    /^\/marketplace\/review\/[^/]+$/,
    /^\/masterclasses(\/create|\/become-instructor)?$/,
    /^\/masterclasses\/instructor(\/analytics)?$/,
    /^\/masterclasses\/[^/]+(\/watch|\/live|\/certificate)?$/,
    /^\/tours$/,
    /^\/tours\/[^/]+$/,
    /^\/shows\/(calendar|today)$/,
    /^\/live(\/go|\/analytics)?$/,
    /^\/live\/[^/]+$/,
    /^\/meet(\/analytics)?$/,
    /^\/meet\/[^/]+$/,
    /^\/merch(\/checkout|\/success|\/orders|\/design)?$/,
    /^\/my-merch(\/create|\/earnings|\/printful-catalog)?$/,
    /^\/my-merch\/customize\/[^/]+$/,
    /^\/settings(\/profile|\/billing|\/display|\/email|\/usage)?$/,
    /^\/affiliate(\/stream-setup)?$/,
    /^\/revenue$/,
    /^\/credits$/,
    /^\/labs(\/contribute|\/experiment|\/research|\/volunteer)?$/,
    /^\/sites(\/edit|\/success)?$/,
    /^\/tools$/,
    /^\/setlists$/,
    /^\/share$/,
    /^\/help(\/merch)?$/,
    /^\/notifications$/,
    /^\/discover$/,
    /^\/explore$/,
    /^\/network$/,
  ];

  return knownPatterns.some((pattern) => pattern.test(basePath));
}
