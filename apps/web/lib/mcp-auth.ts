/**
 * MCP Server Authentication
 *
 * Validates requests from the MCP server using an API key.
 * The MCP server sends requests on behalf of authenticated users.
 *
 * SECURITY: Uses HMAC-signed tokens to prevent user impersonation.
 * Token format: timestamp:userId:signature
 */

import { NextRequest } from 'next/server';
import { prisma } from '@cronkwaters/db';
import crypto from 'crypto';

const MCP_API_KEY = process.env.MCP_SERVER_API_KEY;

// Token validity window (5 minutes)
const TOKEN_VALIDITY_MS = 5 * 60 * 1000;

interface MCPAuthResult {
  valid: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

/**
 * Create an HMAC signature for a user token
 * Used by MCP server to create tokens for authenticated users
 */
export function createMCPUserToken(userId: string): string {
  if (!MCP_API_KEY) {
    throw new Error('MCP_SERVER_API_KEY not configured');
  }

  const timestamp = Date.now().toString();
  const data = `${timestamp}:${userId}`;
  const signature = crypto.createHmac('sha256', MCP_API_KEY).update(data).digest('hex');

  return `${timestamp}:${userId}:${signature}`;
}

/**
 * Validate an HMAC-signed user token
 */
function validateUserToken(token: string): { valid: boolean; userId?: string; error?: string } {
  if (!MCP_API_KEY) {
    return { valid: false, error: 'MCP authentication not configured' };
  }

  const parts = token.split(':');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid token format' };
  }

  const [timestamp, userId, signature] = parts;

  // Validate timestamp (must be within TOKEN_VALIDITY_MS)
  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime)) {
    return { valid: false, error: 'Invalid token timestamp' };
  }

  const now = Date.now();
  if (Math.abs(now - tokenTime) > TOKEN_VALIDITY_MS) {
    return { valid: false, error: 'Token expired' };
  }

  // Validate HMAC signature
  const data = `${timestamp}:${userId}`;
  const expectedSignature = crypto.createHmac('sha256', MCP_API_KEY).update(data).digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return { valid: false, error: 'Invalid token signature' };
  }

  // Validate userId format (CUID or UUID)
  const cuidPattern = /^c[a-z0-9]{24}$/;
  const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

  if (!cuidPattern.test(userId) && !uuidPattern.test(userId)) {
    return { valid: false, error: 'Invalid user ID format' };
  }

  return { valid: true, userId };
}

/**
 * Validate MCP server request
 *
 * Checks the X-MCP-Server-Key header and validates the HMAC-signed user token.
 *
 * SECURITY IMPROVEMENTS:
 * - Server key must match exactly
 * - User tokens are HMAC-signed (not raw IDs)
 * - Tokens expire after 5 minutes
 * - Timing-safe comparison prevents timing attacks
 */
export async function validateMCPRequest(request: NextRequest): Promise<MCPAuthResult> {
  // Check MCP server key
  const mcpKey = request.headers.get('X-MCP-Server-Key');

  if (!MCP_API_KEY) {
    console.warn('[MCP Auth] MCP_SERVER_API_KEY not configured');
    return { valid: false, error: 'MCP authentication not configured' };
  }

  // Use timing-safe comparison for server key
  if (
    !mcpKey ||
    mcpKey.length !== MCP_API_KEY.length ||
    !crypto.timingSafeEqual(Buffer.from(mcpKey), Buffer.from(MCP_API_KEY))
  ) {
    return { valid: false, error: 'Invalid MCP server key' };
  }

  // Get user token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'User authorization required' };
  }

  const userToken = authHeader.replace('Bearer ', '');

  // Validate the HMAC-signed token
  const tokenResult = validateUserToken(userToken);
  if (!tokenResult.valid || !tokenResult.userId) {
    return { valid: false, error: tokenResult.error || 'Invalid token' };
  }

  // Verify user exists in database
  try {
    const user = await prisma.user.findUnique({
      where: { id: tokenResult.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return { valid: false, error: 'User not found' };
    }

    return { valid: true, userId: user.id, email: user.email || undefined };
  } catch (error) {
    console.error('[MCP Auth] Error validating user:', error);
    return { valid: false, error: 'Authentication error' };
  }
}

/**
 * Check if request is from MCP server
 */
export function isMCPRequest(request: NextRequest): boolean {
  return request.headers.has('X-MCP-Server-Key');
}
