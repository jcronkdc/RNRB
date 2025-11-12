import crypto from 'crypto';
import { cookies, headers } from 'next/headers';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET_NAME = 'csrf-secret';

// Generate a CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate a CSRF secret (stored server-side)
export function generateCSRFSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create a signed CSRF token
export function createSignedToken(token: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(token);
  const signature = hmac.digest('hex');
  return `${token}.${signature}`;
}

// Verify a signed CSRF token
export function verifySignedToken(signedToken: string, secret: string): boolean {
  if (!signedToken || !secret) return false;
  
  const parts = signedToken.split('.');
  if (parts.length !== 2) return false;
  
  const [token, signature] = parts;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(token);
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Get or create CSRF token for current session
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME);
  const existingSecret = cookieStore.get(CSRF_SECRET_NAME);
  
  if (existingToken?.value && existingSecret?.value) {
    return existingToken.value;
  }
  
  // Generate new token and secret
  const token = generateCSRFToken();
  const secret = generateCSRFSecret();
  const signedToken = createSignedToken(token, secret);
  
  // Set cookies (httpOnly for secret, accessible for token)
  cookieStore.set(CSRF_TOKEN_NAME, signedToken, {
    httpOnly: false, // Client needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });
  
  cookieStore.set(CSRF_SECRET_NAME, secret, {
    httpOnly: true, // Server-only
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });
  
  return signedToken;
}

// Validate CSRF token from request
export async function validateCSRFToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    
    // Get token from header
    const headerToken = headersList.get(CSRF_HEADER_NAME);
    if (!headerToken) return false;
    
    // Get secret from cookie
    const secretCookie = cookieStore.get(CSRF_SECRET_NAME);
    if (!secretCookie?.value) return false;
    
    // Verify the token
    return verifySignedToken(headerToken, secretCookie.value);
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

// Middleware to check CSRF token
export async function csrfProtection() {
  const valid = await validateCSRFToken();
  if (!valid) {
    throw new Error('Invalid CSRF token');
  }
}

// Get CSRF token from cookie (client-side)
export function getCSRFTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Get token from cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_TOKEN_NAME) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

// Helper to add CSRF token to fetch requests
export function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfToken = getCSRFTokenFromCookie();
  
  if (csrfToken) {
    options.headers = {
      ...options.headers,
      [CSRF_HEADER_NAME]: csrfToken
    };
  }
  
  return fetch(url, options);
}
