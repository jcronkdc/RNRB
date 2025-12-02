/**
 * App Version Management
 *
 * This file manages the app version and provides utilities for version checking.
 * Update APP_VERSION whenever you deploy significant changes.
 */

// Current app version - UPDATE THIS WITH EACH RELEASE
export const APP_VERSION = '1.0.0';

// Build timestamp (set at build time via env)
export const BUILD_DATE =
  process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0];

// Minimum supported version - users below this MUST update
export const MIN_SUPPORTED_VERSION = '1.0.0';

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}

/**
 * Check if current version is below minimum supported
 */
export function isVersionOutdated(currentVersion: string): boolean {
  return compareVersions(currentVersion, MIN_SUPPORTED_VERSION) < 0;
}

/**
 * Check if an update is available
 */
export function isUpdateAvailable(currentVersion: string, latestVersion: string): boolean {
  return compareVersions(currentVersion, latestVersion) < 0;
}

/**
 * Get version display string
 */
export function getVersionString(): string {
  return `v${APP_VERSION}`;
}

/**
 * Version info object for API responses
 */
export interface VersionInfo {
  current: string;
  minimum: string;
  latest: string;
  buildDate: string;
  forceUpdate: boolean;
  updateMessage?: string;
  releaseNotes?: string[];
}
