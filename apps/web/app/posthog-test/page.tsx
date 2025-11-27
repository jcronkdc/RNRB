'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@cronkwaters/ui';
import { trackEvent, PostHogEvents, isPostHogLoaded, getDistinctId } from '@/lib/posthog';

export default function PostHogTestPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [distinctId, setDistinctId] = useState<string>('');

  const checkStatus = () => {
    const loaded = isPostHogLoaded();
    const id = getDistinctId() || 'Not available';
    setIsLoaded(loaded);
    setDistinctId(id);
  };

  const addEvent = (message: string) => {
    setEvents((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const handleTestEvent = (eventName: string) => {
    trackEvent(eventName, {
      test: true,
      timestamp: new Date().toISOString(),
      user_id: session?.user?.id,
    });
    addEvent(`Tracked: ${eventName}`);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">PostHog Analytics Test Page</h1>
      
      {/* Status Section */}
      <div className="mb-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <Button onClick={checkStatus} className="mb-4">
          Check PostHog Status
        </Button>
        <div className="space-y-2">
          <p>
            <strong>PostHog Loaded:</strong>{' '}
            <span className={isLoaded ? 'text-green-600' : 'text-red-600'}>
              {isLoaded ? '✅ Yes' : '❌ No'}
            </span>
          </p>
          <p>
            <strong>Distinct ID:</strong> <code>{distinctId || 'Not checked yet'}</code>
          </p>
          <p>
            <strong>User Signed In:</strong>{' '}
            <span className={session?.user ? 'text-green-600' : 'text-yellow-600'}>
              {session?.user ? `✅ Yes (${session.user.email})` : '⚠️ No'}
            </span>
          </p>
          <p>
            <strong>Environment:</strong> {process.env.NODE_ENV}
          </p>
        </div>
      </div>

      {/* Test Events Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Events</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleTestEvent(PostHogEvents.PROJECT_CREATED)}
            variant="outline"
          >
            Track: Project Created
          </Button>
          <Button
            onClick={() => handleTestEvent(PostHogEvents.SONG_CREATED)}
            variant="outline"
          >
            Track: Song Created
          </Button>
          <Button
            onClick={() => handleTestEvent(PostHogEvents.TRACK_PLAYED)}
            variant="outline"
          >
            Track: Track Played
          </Button>
          <Button
            onClick={() => handleTestEvent(PostHogEvents.AI_ASSISTANT_USED)}
            variant="outline"
          >
            Track: AI Assistant Used
          </Button>
          <Button
            onClick={() => handleTestEvent('custom_test_event')}
            variant="outline"
          >
            Track: Custom Event
          </Button>
          <Button
            onClick={() => {
              trackEvent('button_clicked', {
                button_name: 'Test Button',
                location: 'PostHog Test Page',
                timestamp: Date.now(),
              });
              addEvent('Tracked: button_clicked with custom properties');
            }}
            variant="outline"
          >
            Track: Custom Properties
          </Button>
        </div>
      </div>

      {/* Event Log */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Event Log</h2>
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-500">No events tracked yet. Click buttons above to test.</p>
          ) : (
            events.map((event, i) => (
              <div key={i} className="mb-1">
                {event}
              </div>
            ))
          )}
        </div>
        {events.length > 0 && (
          <Button onClick={() => setEvents([])} variant="outline" className="mt-2">
            Clear Log
          </Button>
        )}
      </div>

      {/* Documentation */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How to Use PostHog</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">1. Track Events</h3>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`import { trackEvent, PostHogEvents } from '@/lib/posthog';

// Track a predefined event
trackEvent(PostHogEvents.PROJECT_CREATED, {
  project_id: '123',
  project_name: 'My Project'
});

// Track a custom event
trackEvent('custom_event_name', {
  custom_property: 'value'
});`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. User Identification (Automatic)</h3>
            <p className="mb-2">
              Users are automatically identified when they sign in. The PostHogProvider
              uses the session to identify users.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Check PostHog Dashboard</h3>
            <p>
              View your events at:{' '}
              <a
                href="https://app.posthog.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://app.posthog.com
              </a>
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Available Event Types</h3>
            <p>
              See all predefined events in <code>@/lib/posthog.ts</code> under the{' '}
              <code>PostHogEvents</code> constant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


