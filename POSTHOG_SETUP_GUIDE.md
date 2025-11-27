# PostHog Analytics Setup Guide

## 🎉 Setup Complete!

PostHog analytics is now fully configured in your Rock N' Roll Basement application.

---

## 📋 Configuration Summary

### Environment Variables (.env.local)
```env
# Client-side tracking (browser)
NEXT_PUBLIC_POSTHOG_KEY="phc_uheW7h78AV2e5cMegm2OuWVQzYUvJ5uvvwRS9RlH4Df"
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"

# Server-side & MCP operations
POSTHOG_PERSONAL_API_KEY="phx_1kN2Z344JNP7rVTEjvcPUuX0u4wb4OxEEQbY6RqyCOmQ9mI"
```

### Key Files Created/Updated
- ✅ `lib/posthog.ts` - Main utilities and event definitions
- ✅ `hooks/use-posthog.ts` - React hooks for PostHog
- ✅ `components/posthog/posthog-provider.tsx` - Provider component (auto-identifies users)
- ✅ `app/posthog-test/page.tsx` - Test page to verify integration
- ✅ MCP Server configured for analytics queries

---

## 🚀 Quick Start

### 1. Test the Integration

Visit the test page to verify everything works:
```
http://localhost:3001/posthog-test
```

This page lets you:
- Check if PostHog is loaded
- See your distinct ID
- Test event tracking
- View events in real-time

### 2. Track Events in Your Code

```typescript
import { trackEvent, PostHogEvents } from '@/lib/posthog';

// Use predefined events
trackEvent(PostHogEvents.PROJECT_CREATED, {
  project_id: project.id,
  project_name: project.name
});

// Or create custom events
trackEvent('custom_action', {
  property1: 'value1',
  property2: 'value2'
});
```

### 3. User Identification (Automatic)

Users are automatically identified when they sign in. The `PostHogProvider` uses NextAuth session data to identify users with their:
- User ID
- Email
- Name

No additional code needed! 🎉

---

## 📊 Predefined Events

Located in `lib/posthog.ts` under `PostHogEvents`:

### User Events
- `user_signed_up`
- `user_signed_in`
- `user_signed_out`

### Project Events
- `project_created`
- `project_updated`
- `project_deleted`
- `project_shared`

### Song/Track Events
- `song_created`
- `song_updated`
- `song_deleted`
- `track_uploaded`
- `track_played`

### Collaboration Events
- `collaboration_started`
- `message_sent`
- `comment_added`

### Tour & Gig Events
- `tour_created`
- `gig_added`
- `setlist_generated`

### AI Feature Events
- `ai_assistant_used`
- `songwriting_ai_used`

### Studio Events
- `recording_started`
- `recording_completed`

### Billing Events
- `subscription_started`
- `subscription_upgraded`
- `subscription_cancelled`

---

## 💡 Usage Examples

### Example 1: Track Project Creation
```typescript
// In your project creation handler
import { trackEvent, PostHogEvents } from '@/lib/posthog';

async function createProject(data: ProjectData) {
  const project = await db.project.create({ data });
  
  // Track the event
  trackEvent(PostHogEvents.PROJECT_CREATED, {
    project_id: project.id,
    project_name: project.name,
    project_type: project.type,
    created_at: new Date().toISOString()
  });
  
  return project;
}
```

### Example 2: Track Song Plays
```typescript
// In your audio player component
import { trackEvent, PostHogEvents } from '@/lib/posthog';

function AudioPlayer({ track }) {
  const handlePlay = () => {
    // Track the play event
    trackEvent(PostHogEvents.TRACK_PLAYED, {
      track_id: track.id,
      track_name: track.name,
      duration: track.duration,
      project_id: track.projectId
    });
    
    // ... play logic
  };
}
```

### Example 3: Track AI Assistant Usage
```typescript
// In your AI assistant component
import { trackEvent, PostHogEvents } from '@/lib/posthog';

async function sendAIMessage(message: string) {
  const response = await aiService.chat(message);
  
  trackEvent(PostHogEvents.AI_ASSISTANT_USED, {
    message_length: message.length,
    response_length: response.length,
    feature: 'general_chat'
  });
  
  return response;
}
```

### Example 4: Track Button Clicks
```typescript
import { trackEvent } from '@/lib/posthog';

<Button 
  onClick={() => {
    trackEvent('upgrade_button_clicked', {
      location: 'dashboard',
      current_plan: userPlan
    });
    router.push('/pricing');
  }}
>
  Upgrade Now
</Button>
```

---

## 🔧 Advanced Features

### Manual User Identification
```typescript
import { identifyUser } from '@/lib/posthog';

// Manually identify a user (usually not needed, as it's automatic)
identifyUser('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'pro'
});
```

### Reset User on Logout
```typescript
import { resetUser } from '@/lib/posthog';

// Reset user identity on logout (usually automatic)
resetUser();
```

### Check if PostHog is Ready
```typescript
import { isPostHogLoaded } from '@/lib/posthog';

if (isPostHogLoaded()) {
  // PostHog is ready to use
}
```

### Session Recording
```typescript
import { startSessionRecording, stopSessionRecording } from '@/lib/posthog';

// Start recording
startSessionRecording();

// Stop recording
stopSessionRecording();
```

---

## 📈 View Your Analytics

### PostHog Dashboard
Visit: https://app.posthog.com

You'll be able to see:
- Real-time event stream
- User analytics
- Funnels and conversion rates
- Session recordings
- Feature flags
- A/B test results

### Using MCP for Analytics Queries
With the MCP server configured, you can now query PostHog data directly from Cursor!

---

## 🎯 Best Practices

1. **Track Key User Actions**: Focus on events that matter for your product
2. **Use Consistent Naming**: Use the predefined events when possible
3. **Include Context**: Add relevant properties to events (IDs, names, etc.)
4. **Respect Privacy**: Only track what you need
5. **Test Events**: Use the test page before deploying
6. **Monitor in Development**: PostHog debug mode is enabled in dev

---

## 🐛 Troubleshooting

### Events Not Showing Up?
1. Check the browser console for PostHog initialization
2. Verify environment variables are set correctly
3. Make sure you're on `http://localhost:3001` (not 3000)
4. Clear browser cache and reload
5. Check PostHog dashboard for any API errors

### PostHog Not Loading?
1. Verify `NEXT_PUBLIC_POSTHOG_KEY` starts with `phc_`
2. Check network tab for blocked requests
3. Ensure ad blockers aren't blocking PostHog
4. Try in incognito mode

### Need to Change Configuration?
Edit `.env.local` and restart the dev server:
```bash
pnpm dev
```

---

## 📚 Additional Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog JavaScript SDK](https://posthog.com/docs/libraries/js)
- [Event Tracking Best Practices](https://posthog.com/docs/data/events)
- [Privacy & GDPR](https://posthog.com/docs/privacy)

---

## ✅ Next Steps

1. **Test the integration**: Visit `/posthog-test` and verify events are tracked
2. **Add tracking to key features**: Start with high-value events like sign-ups, project creation
3. **Monitor the dashboard**: Check PostHog regularly to understand user behavior
4. **Set up funnels**: Track user journeys through your app
5. **Enable session recording**: See exactly how users interact with your app

---

**Need Help?** Check the test page at `/posthog-test` or the PostHog docs!


