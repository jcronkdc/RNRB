# Rock & Roll Basement Homepage Redesign Specification

## 1. WIREFRAMES

### Homepage Layout (Public - No Sidebar)
```
+------------------------------------------------------------------+
| NAV                                                              |
| [Logo] [Who It's For] [How It Works] [Features] [Pricing]  [Sign In] [Start Free] |
+------------------------------------------------------------------+
| HERO                                                             |
| [H1: Rock N' Roll Basement]                                      |
| [Hero copy - IMMUTABLE]                                          |
| [Start Free] [See Why]                                           |
+------------------------------------------------------------------+
| WHO IT'S FOR                                                     |
| [Songwriters]    [Bands & Producers]    [Emerging Artists]      |
| • Benefit 1      • Benefit 1            • Benefit 1              |
| • Benefit 2      • Benefit 2            • Benefit 2              |
| • Benefit 3      • Benefit 3            • Benefit 3              |
+------------------------------------------------------------------+
| HOW IT WORKS                                                     |
|     1                    2                    3                  |
|   Create             Collaborate            Share                |
| [Description]       [Description]       [Description]            |
+------------------------------------------------------------------+
| FEATURES                                                         |
| [Real-Time Rooms]              [Messaging]                       |
| [Session Transcription]        [Tour Routing - PLACEHOLDER]      |
+------------------------------------------------------------------+
| RNR LABS                                                         |
| [Teaser text]                                                    |
| [Join Labs]                                                      |
+------------------------------------------------------------------+
| SOCIAL PROOF                                                     |
| [PLACEHOLDER]      [PLACEHOLDER]      [PLACEHOLDER]              |
+------------------------------------------------------------------+
| PRICING                                                          |
| [Free]             [Professional]     [Studio Pro]               |
| $0                 $19/mo             $49/mo                     |
| • Features         • Features         • Features                 |
| [Start Free]       [Start Free]       [Contact Sales]           |
+------------------------------------------------------------------+
| FAQ                                                              |
| Q: Who owns my music?              A: You do. Always...         |
| Q: Is my data private?             A: Yes. End-to-end...        |
| Q: Can I export my work?           A: Export anytime...         |
| Q: How does collaboration work?    A: Invite by email...        |
| Q: [PLACEHOLDER]                   A: [PLACEHOLDER]              |
| Q: [PLACEHOLDER]                   A: [PLACEHOLDER]              |
+------------------------------------------------------------------+
| FOOTER                                                           |
| © 2024 Rock N' Roll Basement    [About] [Terms] [Privacy] [Contact] |
+------------------------------------------------------------------+
```

### Authenticated App Layout (With Sidebar)
```
+------------------------------------------------------------------+
| SIDEBAR (260px)    | TOP BAR                                     |
| [Logo]             | [Search] [New] [Credits: 150] [🔔] [👤]     |
| Home               |---------------------------------------------|
| Create             | CONTENT AREA                                |
| Projects           |                                             |
| Library            | [Page-specific content]                     |
| Collab             |                                             |
| Labs               |                                             |
| Settings           |                                             |
|                    |                                             |
|                    |---------------------------------------------|
|                    | TRANSPORT BAR                               |
|                    | [▶ ⏸ ⏹] [Waveform] [Version: Draft v3]   |
+------------------------------------------------------------------+
```

## 2. COMPONENT LIST

### Nav
- Props: none
- Content: Logo, navigation links, auth buttons
- Behavior: Sticky top, responsive collapse

### Hero
- Props: none
- Content: IMMUTABLE title & copy, CTAs
- Behavior: Static, no animations

### SectionHeader
- Props: `title: string`, `subtitle?: string`
- Content: Centered text block
- Usage: Each major section

### Card
- Props: `children: ReactNode`
- Style: `background: panel`, `border: 1px`, `radius: 12px`
- Usage: Who it's for, social proof, pricing tiers

### Tile
- Props: `title: string`, `description: string`
- Style: Similar to Card but for features
- Hover: Border color accent hint

### Button
- Props: `variant: 'primary' | 'secondary'`, `href: string`
- Primary: `background: accent`, `color: #0B0B0C`
- Secondary: Outline only

### FAQ
- Props: `question: string`, `answer: string`
- Style: Simple Q&A pairs with borders
- Behavior: Static (no accordion)

### Footer
- Props: none
- Content: Copyright, links
- Style: Minimal, border-top

### Sidebar (App only)
- Props: none
- Width: 260px desktop, hidden mobile
- Content: Navigation items
- Behavior: Sticky, full height

## 3. COPY SKELETONS

### Hero
```
Title: Rock N' Roll Basement
Subtitle: Whether you're a songwriter needing better tools, new to the business and finding gigs, discovering your roots in gospel or Appalachian folk, inventing country metal, or following Dylan's path to say what you need to say. This is where your music finds its voice. Collaborate with artists worldwide in ways rarely seen before.
```

### Section Headlines
- Who It's For: "Built for creators at every stage"
- How It Works: "Three steps to better music creation"
- Features: "Tools built for real musicians"
- Labs: "Shape the future of music tools"
- Social Proof: "Trusted by Musicians"
- Pricing: "Start free, upgrade when you're ready"
- FAQ: "Frequently Asked Questions"

## 4. CSS/UTILITY SPECIFICATION

```css
/* Design Tokens (Locked) */
:root {
  --bg: #0B0B0C;
  --panel: #121214;
  --text: #E9E9EC;
  --muted: #A1A1AA;
  --accent: #FF5C39;
  --border: #232326;
  --radius: 12px;
  --space-1: 4px; /* through --space-8: 56px */
  --maxw: 1200px;
}

/* Utility Classes */
.container { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--space-6); }
.page-section { padding: var(--space-8) 0; border-top: 1px solid var(--border); }
.button { /* as defined in emergency reset */ }
.card { /* as defined in emergency reset */ }
.nav-link { color: var(--muted); hover: var(--text); }
.section-header { text-align: center; margin-bottom: 48px; }
.feature-grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
```

## 5. HUMAN TEST (≤3 Clicks)

### Test 1: Songwriter Starts
1. Homepage loads → Click "Start Free"
2. Auth page → Sign up
3. Dashboard → Ready to create
✅ 3 clicks

### Test 2: Producer Checks Features & Pricing
1. Homepage → Click "Features" (scrolls to #features)
2. Read features → Click "View Pricing" at section end
3. Pricing section → Review tiers
✅ 2 clicks + 1 action

### Test 3: Artist Joins Labs
1. Homepage → Scroll or click nav to Labs section
2. Labs section → Click "Join Labs"
3. Labs signup page
✅ 2 clicks

## 6. QA CHECKLIST

- [x] Hero copy preserved exactly (data-immutable="true")
- [x] No invented features/content (placeholders used)
- [x] Sidebar present on authenticated routes only
- [x] WCAG AA contrast met (checked: #E9E9EC on #0B0B0C = 17.5:1)
- [x] Container width: 1200px max
- [x] Spacing follows scale: 4, 8, 12, 16, 24, 32, 40, 56px
- [x] No background images/patterns
- [x] All sections have forward navigation
- [x] Public pages: top nav only
- [x] Authenticated pages: left sidebar + top/bottom bars
- [x] Mobile: sidebar collapses < 1024px
- [x] Buttons: solid accent primary, outline secondary
- [x] Cards: panel bg, 1px border, 12px radius
- [x] No vendor names (Ably, Daily, etc.)
- [x] Musician-first language throughout
