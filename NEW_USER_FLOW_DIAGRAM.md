# New User Onboarding Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     NEW USER SIGNUP JOURNEY                          │
└─────────────────────────────────────────────────────────────────────┘

                              START HERE
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   User Visits /auth      │
                    │   ?signup=true           │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  User Enters:            │
                    │  • Email                 │
                    │  • Password              │
                    │  • Name (optional)       │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  /api/register           │
                    │  Creates User:           │
                    │  profileCompleted: false │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Auto Sign-In            │
                    │  (signInWithCredentials) │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Auth Check:             │
                    │  profileCompleted?       │
                    └────────┬─────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                   NO                YES
                    │                 │
                    ▼                 ▼
       ┌────────────────────┐  ┌──────────────┐
       │ Redirect to:       │  │ Redirect to: │
       │ /settings/profile  │  │ /dashboard   │
       │ ?setup=true        │  │              │
       └─────────┬──────────┘  └──────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ Profile Setup Page          │
    │ ┌─────────────────────────┐ │
    │ │ 🎉 Welcome Message!     │ │
    │ │ Let's set up your       │ │
    │ │ profile...              │ │
    │ └─────────────────────────┘ │
    │                             │
    │ Profile Form:               │
    │ • Username *                │
    │ • Display Name              │
    │ • Bio                       │
    │ • Profile Picture           │
    │ • Social Links              │
    │ • Contact Info              │
    │ • Privacy Settings          │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │ User Clicks "Save Profile"  │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │ /api/profile (PATCH)        │
    │ • Saves profile data        │
    │ • Sets profileCompleted:true│
    │ • Updates session           │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │ ✅ Success Message          │
    │ "Profile setup complete!"   │
    └──────────────┬──────────────┘
                   │
            (2 second delay)
                   │
                   ▼
    ┌─────────────────────────────┐
    │ Redirect to /dashboard      │
    │ Full platform access! 🎸    │
    └─────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    EXISTING USER FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────┐
                    │   User Signs In          │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Database Check:         │
                    │  profileCompleted: true  │
                    │  (Grandfathered)         │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Direct to /dashboard    │
                    │  No interruption!        │
                    └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    GOOGLE OAUTH FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────┐
                    │   "Sign in with Google"  │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  OAuth Complete          │
                    │  User Created/Found      │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Auth Callback:          │
                    │  Check profileCompleted  │
                    │  from Database           │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Redirect to /dashboard  │
                    └────────────┬─────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Dashboard Effect:       │
                    │  if (!profileCompleted)  │
                    │    → /settings/profile   │
                    └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    PROTECTION MECHANISMS                             │
└─────────────────────────────────────────────────────────────────────┘

1. Dashboard Check (Primary)
   ├─ Runs on every dashboard load
   ├─ Checks session.user.profileCompleted
   └─ Redirects if false

2. Auth Action Check (Secondary)
   ├─ Runs during sign-in for new credential users
   ├─ Queries database for profileCompleted
   └─ Redirects before reaching dashboard

3. Session Token (Persistent)
   ├─ profileCompleted stored in JWT
   ├─ Included in every session
   └─ Updated when profile saved


┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                                   │
└─────────────────────────────────────────────────────────────────────┘

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  profileCompleted  Boolean   @default(false)  ← NEW FIELD
  // ... other fields
}


┌─────────────────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                                     │
└─────────────────────────────────────────────────────────────────────┘

POST   /api/register
       └─ Creates user with profileCompleted: false

PATCH  /api/profile
       └─ Updates user profile
       └─ Sets profileCompleted: true
       └─ Updates session

```
