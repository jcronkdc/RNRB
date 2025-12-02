import { NextResponse } from 'next/server';
import { APP_VERSION, MIN_SUPPORTED_VERSION, BUILD_DATE, compareVersions } from '@/lib/version';

/**
 * Version Check API
 *
 * GET /api/version - Returns current version info
 * GET /api/version?client=X.X.X - Checks if client version needs update
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientVersion = searchParams.get('client');

  const response = {
    latest: APP_VERSION,
    minimum: MIN_SUPPORTED_VERSION,
    buildDate: BUILD_DATE,
    forceUpdate: false,
    updateAvailable: false,
    message: null as string | null,
    releaseNotes: [
      'Custom SVG icons throughout the platform',
      'Enhanced landing page with feature comparison',
      'Improved PWA update system',
      'Performance optimizations',
    ],
  };

  // If client version provided, check if update needed
  if (clientVersion) {
    const needsForceUpdate = compareVersions(clientVersion, MIN_SUPPORTED_VERSION) < 0;
    const hasUpdate = compareVersions(clientVersion, APP_VERSION) < 0;

    response.forceUpdate = needsForceUpdate;
    response.updateAvailable = hasUpdate;

    if (needsForceUpdate) {
      response.message = `Your app version (${clientVersion}) is no longer supported. Please update to continue using Rock N' Roll Basement.`;
    } else if (hasUpdate) {
      response.message = `A new version (${APP_VERSION}) is available with new features and improvements!`;
    }
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  });
}
