import { Vercel } from '@vercel/sdk';

// Initialize Vercel SDK
const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

// Project and team info from .vercel/project.json
const PROJECT_ID = 'prj_IVRXSJT78FdVy8E5Sj51440HAuu3';
const TEAM_ID = 'team_WeBoOSXWzKGtRgHXfRURkxyZ';

export interface VercelDomainResult {
  success: boolean;
  domain?: string;
  verified?: boolean;
  verification?: Array<{
    type: string;
    domain: string;
    value: string;
    reason: string;
  }>;
  error?: string;
  errorCode?: string;
}

/**
 * Add a domain to the Vercel project
 * This enables the domain to serve the CronkWaters app
 */
export async function addDomainToVercel(domain: string): Promise<VercelDomainResult> {
  if (!process.env.VERCEL_TOKEN) {
    console.error('[VERCEL-DOMAINS] VERCEL_TOKEN not configured');
    return {
      success: false,
      error: 'Vercel API not configured. Contact support.',
      errorCode: 'NO_TOKEN',
    };
  }

  try {
    const result = await vercel.projects.addProjectDomain({
      idOrName: PROJECT_ID,
      teamId: TEAM_ID,
      requestBody: {
        name: domain,
      },
    });

    console.log('[VERCEL-DOMAINS] Domain added:', domain, result);

    return {
      success: true,
      domain: result.name,
      verified: result.verified,
      verification: result.verification as VercelDomainResult['verification'],
    };
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number;
      body?: { error?: { code?: string; message?: string } };
    };
    console.error('[VERCEL-DOMAINS] Add domain error:', error);

    // Handle common errors
    if (err.statusCode === 400) {
      const errorBody = err.body?.error;
      if (errorBody?.code === 'domain_already_exists') {
        return {
          success: true,
          domain,
          verified: true, // If it exists, it's already configured
        };
      }
      return {
        success: false,
        error: errorBody?.message || 'Invalid domain configuration',
        errorCode: errorBody?.code || 'INVALID_DOMAIN',
      };
    }

    if (err.statusCode === 401) {
      return {
        success: false,
        error: 'Vercel API authentication failed',
        errorCode: 'AUTH_FAILED',
      };
    }

    if (err.statusCode === 402) {
      return {
        success: false,
        error: 'Vercel plan limit reached. Contact support.',
        errorCode: 'PLAN_LIMIT',
      };
    }

    return {
      success: false,
      error: 'Failed to add domain to Vercel',
      errorCode: 'UNKNOWN',
    };
  }
}

/**
 * Remove a domain from the Vercel project
 */
export async function removeDomainFromVercel(domain: string): Promise<VercelDomainResult> {
  if (!process.env.VERCEL_TOKEN) {
    console.error('[VERCEL-DOMAINS] VERCEL_TOKEN not configured');
    return {
      success: false,
      error: 'Vercel API not configured',
      errorCode: 'NO_TOKEN',
    };
  }

  try {
    await vercel.projects.removeProjectDomain({
      idOrName: PROJECT_ID,
      domain,
      teamId: TEAM_ID,
    });

    console.log('[VERCEL-DOMAINS] Domain removed:', domain);

    return {
      success: true,
      domain,
    };
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number;
      body?: { error?: { code?: string; message?: string } };
    };
    console.error('[VERCEL-DOMAINS] Remove domain error:', error);

    // If domain doesn't exist, that's fine
    if (err.statusCode === 404) {
      return {
        success: true,
        domain,
      };
    }

    return {
      success: false,
      error: 'Failed to remove domain from Vercel',
      errorCode: 'UNKNOWN',
    };
  }
}

/**
 * Verify a domain on Vercel (after DNS is configured)
 */
export async function verifyDomainOnVercel(domain: string): Promise<VercelDomainResult> {
  if (!process.env.VERCEL_TOKEN) {
    return {
      success: false,
      error: 'Vercel API not configured',
      errorCode: 'NO_TOKEN',
    };
  }

  try {
    const result = await vercel.projects.verifyProjectDomain({
      idOrName: PROJECT_ID,
      domain,
      teamId: TEAM_ID,
    });

    console.log('[VERCEL-DOMAINS] Domain verification result:', domain, result);

    return {
      success: true,
      domain: result.name,
      verified: result.verified,
    };
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number;
      body?: { error?: { code?: string; message?: string } };
    };
    console.error('[VERCEL-DOMAINS] Verify domain error:', error);

    return {
      success: false,
      error: err.body?.error?.message || 'Domain verification failed',
      errorCode: err.body?.error?.code || 'VERIFICATION_FAILED',
    };
  }
}

/**
 * Get domain configuration status from Vercel
 */
export async function getDomainStatus(domain: string): Promise<VercelDomainResult> {
  if (!process.env.VERCEL_TOKEN) {
    return {
      success: false,
      error: 'Vercel API not configured',
      errorCode: 'NO_TOKEN',
    };
  }

  try {
    const result = await vercel.projects.getProjectDomain({
      idOrName: PROJECT_ID,
      domain,
      teamId: TEAM_ID,
    });

    return {
      success: true,
      domain: result.name,
      verified: result.verified,
    };
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err.statusCode === 404) {
      return {
        success: false,
        error: 'Domain not found on Vercel',
        errorCode: 'NOT_FOUND',
      };
    }

    return {
      success: false,
      error: 'Failed to get domain status',
      errorCode: 'UNKNOWN',
    };
  }
}
