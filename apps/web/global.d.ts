// Global type declarations for CronkWaters web app

interface Window {
  posthog?: {
    capture: (event: string, properties?: Record<string, any>) => void;
    identify: (userId: string, properties?: Record<string, any>) => void;
    // Add other PostHog methods as needed
  };
}
