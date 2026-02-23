# TODO/FIXME Tracker

> Generated from full project audit on 2026-02-23. 25 active TODOs.

## Summary

| Category | Count |
|----------|-------|
| Notifications & Email | 7 |
| UI Navigation | 3 |
| Setlist Management | 4 |
| Live Streaming | 3 |
| Social Features | 3 |
| Other (merch, audio, meetings, mail) | 5 |

---

## Notifications & Email (7)

- [ ] `app/api/marketplace/bookings/[id]/messages/route.ts:179` — Send real-time notification via Ably
- [ ] `app/api/marketplace/bookings/[id]/messages/route.ts:180` — Send email notification if recipient offline
- [ ] `app/api/merch/webhook/route.ts:204` — Send confirmation email
- [ ] `components/notification-settings.tsx:111` — Send push subscription to server
- [ ] `components/notification-settings.tsx:134` — Remove push subscription from server
- [ ] `app/api/webhooks/stripe/route.ts:824` — Add email template for masterclass enrollment
- [ ] `app/api/meet/route.ts:155` — Send email invitations

## UI Navigation (3)

- [ ] `app/projects/[slug]/page.tsx:328` — Navigate to milestone detail or open modal
- [ ] `app/(app)/masterclasses/[slug]/page.tsx:554` — Open video player
- [ ] `app/(app)/shows/calendar/page.tsx:145` — Navigate to new show form with pre-filled date

## Setlist Management (4)

- [ ] `app/projects/[slug]/setlists/page.tsx:181` — Save setlist to API
- [ ] `app/projects/[slug]/setlists/page.tsx:185` — Refresh project songs list after import
- [ ] `app/projects/[slug]/setlists/page.tsx:189` — Create new setlist with generated songs
- [ ] `app/projects/[slug]/setlists/page.tsx:193` — Create new setlist with template songs

## Live Streaming (3)

- [ ] `lib/push-notifications.ts:197` — Implement when LiveStreamFollow model is added
- [ ] `lib/push-notifications.ts:208` — Implement when live stream follow feature is added
- [ ] `lib/ai/assistant-tools.ts:1426` — Implement when LiveStream model is added to schema

## Social Features (3)

- [ ] `components/pinned-comment-thread.tsx:144` — Implement removeReaction
- [ ] `components/social-feed/FeedPost.tsx:392` — Implement report functionality
- [ ] `components/songwriting/collaborative-visual-builder.tsx:512` — Integrate with actual invite API

## Other (5)

- [ ] `app/(app)/merch/design/page.tsx:221` — Upload design to cloud storage and call Printful API
- [ ] `components/songwriting/talkback-strip.tsx:169` — Wire isSpeaking to audio track activity
- [ ] `components/songwriting/version-history-panel.tsx:401` — Implement export
- [ ] `app/api/meet/[meetingCode]/join/route.ts:88` — Implement waiting room logic
- [ ] `app/api/email/account/route.ts:631` — Sync settings to Stalwart mail server
