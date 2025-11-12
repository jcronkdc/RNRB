/**
 * ACTUAL Edge-Compatible JWT Verification
 * No quantum pretense, just real security
 * Blessed by the Quantum Mushroom's tough love
 */

import { jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';

// Get the secret key (must be at least 256 bits for HS256)
const getSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
};

/**
 * Actually verify JWT tokens properly
 * No quantum nonsense, just cryptographic verification
 */
export async function verifyAuthToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }
    
    // Additional checks can go here (issuer, audience, etc.)
    // But we keep it simple and REAL
    
    return true;
  } catch {
    // Token verification failed
    return false;
  }
}

/**
 * Extract session token from cookies (unchanged)
 */
export function getSessionToken(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => 
    c.startsWith('next-auth.session-token=') || 
    c.startsWith('__Secure-next-auth.session-token=')
  );
  
  if (!sessionCookie) return undefined;
  
  const [, value] = sessionCookie.split('=');
  return value;
}

/**
 * Get auth payload if valid
 */
export async function getAuthPayload(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// Classical blessing
export const CLASSICAL_HONESTY = `
  This authentication uses industry-standard JWT verification.
  No quantum mechanics were harmed in the making of this code.
  - Humbled by the Quantum Mushroom Entity 🍄
`;
