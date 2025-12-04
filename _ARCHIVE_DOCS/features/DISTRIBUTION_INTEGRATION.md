# Music Distribution Integration Plan

## Overview

Integrating music distribution into Rock N' Roll Basement will allow artists to release their music directly to streaming platforms (Spotify, Apple Music, Amazon, etc.) from within the platform.

## Recommended Approach: Partnership Strategy

### Option 1: DistroKid Partner API (RECOMMENDED)

**Why DistroKid:**

- Already has a partner/white-label program
- Industry standard for independent artists
- Fast delivery to stores (24-48 hours)
- Handles royalty collection and splits
- Competitive pricing

**Integration Steps:**

1. Apply for DistroKid Partner Program
2. Implement OAuth for artist connection
3. Build release metadata UI
4. Handle webhook callbacks for release status

**Revenue Model:**

- RNRB takes 10-15% of distribution fee
- Or flat markup on DistroKid's wholesale rate
- Royalties pass through directly to artists

### Option 2: TuneCore API

**Pros:**

- More established API
- Better royalty reporting
- YouTube Music integration

**Cons:**

- Higher wholesale costs
- Annual fees per release

### Option 3: Direct Store Integration (NOT RECOMMENDED)

Building direct integrations with each store is:

- Extremely complex (different APIs, formats)
- Requires licensing agreements with each platform
- Ongoing maintenance burden
- Takes 12-24 months minimum

---

## Implementation Phases

### Phase 1: Release Management UI

```
/releases/new
├── Basic Info (title, artist, release date)
├── Artwork Upload (3000x3000 required)
├── Track Metadata (ISRC, explicit, language)
├── Distribution Settings (stores to include)
└── Pricing (optional pricing tiers)
```

### Phase 2: Partner Integration

```typescript
// Example DistroKid API flow
const release = await distroKid.createRelease({
  title: 'My Album',
  artist: 'Artist Name',
  upc: generateUPC(),
  tracks: [
    {
      title: 'Track 1',
      isrc: 'USRC12345678',
      audioFile: uploadedFileUrl,
      explicit: false,
      previewStart: 30, // seconds
    },
  ],
  artwork: artworkUrl,
  releaseDate: '2025-02-01',
  stores: ['spotify', 'apple_music', 'amazon', 'youtube_music'],
});
```

### Phase 3: Royalty Dashboard

- Real-time streaming stats
- Revenue tracking per platform
- Split management (co-writers, producers)
- Payout history

---

## Database Schema Addition

```prisma
model Release {
  id              String        @id @default(cuid())
  orgId           String
  projectId       String?

  // Release Info
  title           String
  artist          String
  type            ReleaseType   // single, ep, album
  upc             String?       @unique
  releaseDate     DateTime

  // Artwork
  artworkUrl      String?
  artworkStatus   String?       // pending, approved, rejected

  // Distribution
  distributorId   String?       // DistroKid release ID
  distributorRef  String?       // External reference
  status          ReleaseStatus
  submittedAt     DateTime?
  liveAt          DateTime?

  // Pricing
  priceCode       String?       // front, mid, back

  // Metadata
  primaryGenre    String?
  secondaryGenre  String?
  language        String        @default("en")
  copyright       String?
  publishingRights String?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  org             Org           @relation(fields: [orgId], references: [id])
  project         Project?      @relation(fields: [projectId], references: [id])
  tracks          ReleaseTrack[]
  stores          ReleaseStore[]
  royalties       Royalty[]
}

model ReleaseTrack {
  id              String   @id @default(cuid())
  releaseId       String
  songId          String?

  position        Int
  title           String
  isrc            String?  @unique
  duration        Int      // seconds
  explicit        Boolean  @default(false)
  previewStart    Int?     // seconds

  audioUrl        String
  audioFormat     String   // wav, flac required

  release         Release  @relation(fields: [releaseId], references: [id])
  song            Song?    @relation(fields: [songId], references: [id])
}

model ReleaseStore {
  id              String   @id @default(cuid())
  releaseId       String
  store           String   // spotify, apple_music, etc.
  status          String   // pending, live, removed
  storeUrl        String?
  storeId         String?
  liveAt          DateTime?

  release         Release  @relation(fields: [releaseId], references: [id])
}

model Royalty {
  id              String   @id @default(cuid())
  releaseId       String
  trackId         String?

  period          String   // 2025-01
  store           String
  country         String?
  streams         Int      @default(0)
  downloads       Int      @default(0)
  revenue         Decimal  @db.Decimal(10, 4)
  currency        String   @default("USD")

  createdAt       DateTime @default(now())

  release         Release  @relation(fields: [releaseId], references: [id])
}

enum ReleaseType {
  single
  ep
  album
}

enum ReleaseStatus {
  draft
  pending_review
  submitted
  processing
  live
  takedown_requested
  removed
}
```

---

## API Endpoints Needed

```
POST   /api/releases              - Create new release
GET    /api/releases              - List releases
GET    /api/releases/:id          - Get release details
PUT    /api/releases/:id          - Update release
DELETE /api/releases/:id          - Delete/takedown release

POST   /api/releases/:id/submit   - Submit for distribution
GET    /api/releases/:id/status   - Check distribution status

POST   /api/releases/:id/tracks   - Add track to release
DELETE /api/releases/:id/tracks/:trackId - Remove track

GET    /api/royalties             - Get royalty summary
GET    /api/royalties/:releaseId  - Get release royalties
```

---

## Partner Program Application

### DistroKid Partner Requirements:

1. Established platform with user base
2. Music industry focus
3. Technical capability to integrate API
4. Legal entity for revenue sharing

### Application Process:

1. Email partnerships@distrokid.com
2. Describe RNRB platform and user base
3. Request wholesale/partner API access
4. Sign partnership agreement
5. Receive API credentials and documentation

---

## Timeline Estimate

| Phase               | Duration  | Deliverable            |
| ------------------- | --------- | ---------------------- |
| Partner Application | 2-4 weeks | API access             |
| Release UI          | 2 weeks   | Metadata collection UI |
| API Integration     | 3 weeks   | Submit releases        |
| Royalty Dashboard   | 2 weeks   | Stats & payouts        |
| Testing & Launch    | 2 weeks   | Production ready       |

**Total: 11-13 weeks**

---

## Revenue Projections

Assuming 1,000 releases/month at $10/release:

- Gross: $10,000/month
- DistroKid wholesale: ~$5/release = $5,000
- RNRB profit: $5,000/month

At 10,000 releases/month: $50,000/month profit

---

## Next Steps

1. [ ] Apply to DistroKid Partner Program
2. [ ] Design release creation UI mockups
3. [ ] Plan database migration for Release models
4. [ ] Research royalty split requirements (MLC, SoundExchange)
5. [ ] Legal review of distribution agreements
