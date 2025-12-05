/**
 * STANDARDIZED ERROR HANDLING
 *
 * Provides consistent error handling across all API routes.
 * - Never exposes internal error details to clients
 * - Structured error codes for frontend handling
 * - Proper logging for debugging
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Standard error codes
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'SUBSCRIPTION_REQUIRED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'BAD_REQUEST';

// Error response format
export interface ErrorResponse {
  error: string;
  code: ErrorCode;
  details?: Record<string, unknown>;
}

/**
 * Application Error class for structured errors
 */
export class AppError extends Error {
  constructor(
    public userMessage: string,
    public code: ErrorCode,
    public statusCode: number,
    public internalMessage?: string,
    public metadata?: Record<string, unknown>
  ) {
    super(internalMessage || userMessage);
    this.name = 'AppError';
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(message, 'UNAUTHORIZED', 401);
  }

  static forbidden(message = 'Access denied'): AppError {
    return new AppError(message, 'FORBIDDEN', 403);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError(`${resource} not found`, 'NOT_FOUND', 404);
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 'BAD_REQUEST', 400);
  }

  static subscriptionRequired(feature: string, requiredTier: string): AppError {
    return new AppError(
      `Upgrade to ${requiredTier} plan to access ${feature}`,
      'SUBSCRIPTION_REQUIRED',
      403,
      undefined,
      {
        feature,
        requiredTier,
        upgradeUrl: `/settings/billing?upgrade=${requiredTier.toLowerCase()}`,
      }
    );
  }

  static quotaExceeded(resource: string, used: number, limit: number, tier: string): AppError {
    return new AppError(
      `${resource} quota exceeded (${used}/${limit})`,
      'QUOTA_EXCEEDED',
      429,
      undefined,
      { used, limit, tier, requiresUpgrade: true }
    );
  }

  static rateLimited(retryAfter?: number): AppError {
    return new AppError(
      'Too many requests. Please try again later.',
      'RATE_LIMITED',
      429,
      undefined,
      retryAfter ? { retryAfter } : undefined
    );
  }

  static internal(message = 'An internal error occurred'): AppError {
    return new AppError(message, 'INTERNAL_ERROR', 500);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable'): AppError {
    return new AppError(message, 'SERVICE_UNAVAILABLE', 503);
  }
}

/**
 * Log error for debugging (server-side only)
 * In production, this would send to error tracking (Sentry, etc.)
 */
function logError(error: unknown, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    ...context,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }
        : error,
  };

  // In production, this would go to Sentry/DataDog/etc.
  console.error('[API Error]', JSON.stringify(errorInfo, null, 2));
}

/**
 * Handle API errors and return appropriate response
 * NEVER exposes internal error details to client
 */
export function handleApiError(
  error: unknown,
  context?: { route?: string; method?: string }
): NextResponse<ErrorResponse> {
  // Log the full error for debugging
  logError(error, context);

  // Handle AppError (structured errors)
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.userMessage,
        code: error.code,
        ...(error.metadata && { details: error.metadata }),
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return NextResponse.json(
      {
        error: 'Invalid input',
        code: 'VALIDATION_ERROR',
        details: { fields: fieldErrors },
      },
      { status: 400 }
    );
  }

  // Handle known error types without exposing details
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('unique constraint')) {
      return NextResponse.json(
        {
          error: 'A record with this information already exists',
          code: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    if (error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        {
          error: 'Referenced resource not found',
          code: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }
  }

  // Default: Internal server error (never expose details)
  return NextResponse.json(
    {
      error: 'An unexpected error occurred. Please try again.',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: { route?: string; method?: string }
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}
