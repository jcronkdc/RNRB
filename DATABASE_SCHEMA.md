# DATABASE SCHEMA DOCUMENTATION

**Last Updated:** 2025-11-25 @ Agent 124  
**Schema:** Prisma 5.22.0 | **Lines:** 1302 | **Models:** 40+  
**Database:** Neon PostgreSQL (us-west-2 region)

---

## 📊 SCHEMA SUMMARY

### Core Models (User & Auth)

- `User` - Main user table (Stripe subscriptions, usage tracking)
- `Account` - OAuth provider accounts (Google, etc.)
- `Session` - NextAuth session storage
- `VerificationToken` - Email verification tokens

### Organization & Projects

- `Org` - Organizations (bands, studios, solo artists)
- `Membership` - User-org relationships with roles
- `Project` - Albums, EPs, singles within orgs
- `ProjectMember` - Collaborators on projects

### Music Content

- `Song` - Songs with metadata, lyrics, chords
- `SongCollaborator` - Song collaborators (registered users or emails)
- `Asset` - Audio files, lyrics, charts, videos
- `SongSplit` - Royalty split agreements

### Live Performance

- `Venue` - Performance venues
- `Tour` - Tour schedules
- `Show` - Individual shows
- `Setlist` - Show setlists
- `SetlistItem` - Songs in setlists
- `SetlistTemplate` - Reusable setlist templates
- `SongRequest` - Fan song requests

### Community Features

- `CommunityTrack` - Songs published to community
- `TrackLike` - Community track likes
- `TrackPlay` - Play tracking & analytics
- `TrackComment` - Comments on tracks
- `UserFollow` - User following relationships

### Business & Legal

- `Subscription` - Paid subscriptions (Stripe)
- `Transaction` - Financial transactions
- `License` - Legal agreements
- `SplitSheet` - Copyright split sheets
- `SplitContributor` - Contributors on split sheets
- `Donation` - Donation tracking

### Collaboration & Communication

- `CollaborationRequest` - Open collaboration requests
- `CollaborationResponse` - Responses to requests
- `Message` - Direct messaging
- `Comment` - Comments on various entities
- `Connection` - User connections/friendships
- `Invitation` - Project/org invitations
- `OrgInvite` - Organization invite codes

### Studio & Sessions

- `StudioSession` - Recording/rehearsal sessions
- `SessionAttendee` - Session participants

### Content & Media

- `Event` - Events (festivals, concerts, workshops)
- `PodcastEpisode` - Podcast content
- `PressRelease` - Press releases
- `Award` - Awards & achievements
- `BandMember` - Band member profiles
- `FanEngagement` - Fan engagement tracking

### User Profiles

- `MusicianProfile` - Musician profiles (instruments, skills)
- `Skill` - Individual skills with verification
- `ForumPost` - Forum discussions
- `ForumReply` - Forum replies
- `AssetShare` - Shareable asset links

---

## 🔑 KEY RELATIONSHIPS

### Auth Flow

```
User (1) ──→ (N) Account (OAuth providers)
User (1) ──→ (N) Session (NextAuth sessions)
```

### Organization Structure

```
User (N) ←─→ (N) Org (via Membership with OrgRole)
Org (1) ──→ (N) Project
Project (1) ──→ (N) Song
Song (1) ──→ (N) SongCollaborator
```

### Performance Chain

```
Org (1) ──→ (N) Tour
Tour (1) ──→ (N) Show
Show (1) ──→ (1) Setlist
Setlist (1) ──→ (N) SetlistItem ──→ Song
```

### Community Features

```
Song (1) ──→ (1) CommunityTrack (if published)
CommunityTrack (1) ──→ (N) TrackLike
CommunityTrack (1) ──→ (N) TrackPlay
CommunityTrack (1) ──→ (N) TrackComment
User (N) ←─→ (N) User (via UserFollow)
```

---

## 🔐 SUBSCRIPTION & USAGE TRACKING

### User Model Fields (Revenue Protection)

```prisma
stripeCustomerId       String?   @unique
stripeSubscriptionId   String?   @unique
subscriptionTier       String    @default("free") // free, creator, studio
subscriptionStatus     String?   // active, canceled, past_due, trialing
aiRequestsUsed         Int       @default(0)
videoMinutesUsed       Int       @default(0)
storageUsedGB          Decimal   @default(0)
usagePeriodStart       DateTime?
```

---

## 📝 ENUMS

### Organization & Project

- `OrgType`: foundation, studio, band, solo
- `OrgRole`: owner, admin, member
- `ProjectVisibility`: private, org, public
- `ProjectStatus`: active, archived, draft

### Content & Assets

- `SongStatus`: draft, in_progress, needs_review, complete
- `Visibility`: private, org, public
- `AssetType`: audio, lyric, image, pdf, chart, video, other

### Business & Legal

- `LicenseTemplate`: COLLAB_NDA, WORK_FOR_HIRE, etc.
- `LicenseStatus`: draft, pending_signature, executed, etc.
- `TransactionType`: streaming_royalty, sync_license, etc.
- `TransactionStatus`: pending, processing, completed, failed

### Events & Performance

- `EventType`: festival, concert, showcase, workshop
- `VenueType`: club, theater, arena, stadium, festival
- `ShowStatus`: scheduled, soldout, cancelled, completed
- `TourStatus`: planning, announced, ongoing, completed
- `SongRequestStatus`: pending, approved, rejected

### Subscriptions

- `SubscriptionTier`: sustaining, patron, benefactor
- `SubscriptionStatus`: active, cancelled, past_due, trialing
- `DonationStatus`: pending, completed, failed, refunded

### Community

- `ForumCategory`: general, collaboration, feedback, showcase, technical
- `SkillLevel`: beginner, intermediate, advanced, professional
- `CollaborationStatus`: open, in_progress, completed, cancelled

---

## 🚨 CRITICAL INDEXES

### Performance Optimization

```prisma
// User lookups
@@index([email])
@@index([stripeCustomerId])
@@index([subscriptionStatus])

// Org/Project queries
@@index([slug])
@@index([orgId])
@@index([projectId])

// Time-based queries
@@index([createdAt])
@@index([publishedAt])
@@index([startDate])

// Real-time collaboration
@@index([userId, projectId])
@@index([sessionId])
```

---

## 🔄 SCHEMA EVOLUTION

**Last Migration:** 2025-11-24 (Community Features - Agent 89)

### Recent Changes

1. Added `CommunityTrack`, `TrackLike`, `TrackPlay`, `TrackComment`, `UserFollow`
2. Added `password` field to User model (2025-11-24)
3. Added `SongRequest` table for fan song requests
4. Added subscription & usage tracking fields to User

### Pending Changes

- None (schema is stable)

---

## 📖 USAGE

### Generate Prisma Client

```bash
pnpm prisma:generate
```

### Open Prisma Studio

```bash
pnpm prisma:studio
```

### View Schema

```bash
cat packages/db/prisma/schema.prisma
```

---

**For full schema:** See `packages/db/prisma/schema.prisma` (1302 lines)  
**For migrations:** See `packages/db/prisma/migrations/`
