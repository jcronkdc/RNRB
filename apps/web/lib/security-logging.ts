import { prisma } from '@cronkwaters/db';

// Security event types
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_FAILURE = 'CSRF_FAILURE',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  PATH_TRAVERSAL_ATTEMPT = 'PATH_TRAVERSAL_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FILE_UPLOAD_BLOCKED = 'FILE_UPLOAD_BLOCKED',
  SESSION_HIJACK_ATTEMPT = 'SESSION_HIJACK_ATTEMPT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

// Security event severity levels
export enum SecurityEventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Security event interface
export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Log security event to database
export async function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
  try {
    // In production, this would write to a dedicated security_events table
    // For now, we'll use console logging with structured format
    const logEntry = {
      ...event,
      timestamp: new Date(),
      environment: process.env.NODE_ENV
    };

    // Critical and high severity events should trigger alerts
    if (event.severity === SecurityEventSeverity.CRITICAL || event.severity === SecurityEventSeverity.HIGH) {
      console.error('🚨 SECURITY ALERT:', JSON.stringify(logEntry, null, 2));
      // In production: Send alert to monitoring service
      await sendSecurityAlert(logEntry);
    } else {
      console.warn('⚠️ Security Event:', JSON.stringify(logEntry, null, 2));
    }

    // Store in database (when security_events table exists)
    // await prisma.securityEvent.create({ data: logEntry });
  } catch (error) {
    // Don't let logging errors break the application
    console.error('Failed to log security event:', error);
  }
}

// Send security alert for critical events
async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
  // In production, integrate with monitoring service (e.g., PagerDuty, Slack, email)
  // For now, just log to console with high visibility
  console.error('🚨🚨🚨 CRITICAL SECURITY ALERT 🚨🚨🚨');
  console.error('Event Type:', event.type);
  console.error('Severity:', event.severity);
  console.error('Details:', event.details);
  console.error('🚨🚨🚨 END ALERT 🚨🚨🚨');
}

// Helper functions for common security events
export const SecurityLogger = {
  // Authentication events
  async logLoginAttempt(email: string, ip?: string, userAgent?: string) {
    await logSecurityEvent({
      type: SecurityEventType.LOGIN_ATTEMPT,
      severity: SecurityEventSeverity.LOW,
      ip,
      userAgent,
      details: { email }
    });
  },

  async logLoginSuccess(userId: string, ip?: string, userAgent?: string) {
    await logSecurityEvent({
      type: SecurityEventType.LOGIN_SUCCESS,
      severity: SecurityEventSeverity.LOW,
      userId,
      ip,
      userAgent
    });
  },

  async logLoginFailure(email: string, reason: string, ip?: string, userAgent?: string) {
    await logSecurityEvent({
      type: SecurityEventType.LOGIN_FAILURE,
      severity: SecurityEventSeverity.MEDIUM,
      ip,
      userAgent,
      details: { email, reason }
    });
  },

  // Rate limiting events
  async logRateLimitExceeded(path: string, ip?: string, userAgent?: string) {
    await logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: SecurityEventSeverity.MEDIUM,
      ip,
      userAgent,
      path,
      details: { blockedAt: new Date() }
    });
  },

  // Attack detection events
  async logXSSAttempt(path: string, payload: string, ip?: string, userAgent?: string) {
    await logSecurityEvent({
      type: SecurityEventType.XSS_ATTEMPT,
      severity: SecurityEventSeverity.HIGH,
      ip,
      userAgent,
      path,
      details: { payload: payload.substring(0, 100) } // Truncate for safety
    });
  },

  async logSQLInjectionAttempt(path: string, query: string, ip?: string, userAgent?: string) {
    await logSecurityEvent({
      type: SecurityEventType.SQL_INJECTION_ATTEMPT,
      severity: SecurityEventSeverity.CRITICAL,
      ip,
      userAgent,
      path,
      details: { query: query.substring(0, 100) } // Truncate for safety
    });
  },

  async logPathTraversalAttempt(path: string, attemptedPath: string, ip?: string, userAgent?: string) {
    await logSecurityEvent({
      type: SecurityEventType.PATH_TRAVERSAL_ATTEMPT,
      severity: SecurityEventSeverity.HIGH,
      ip,
      userAgent,
      path,
      details: { attemptedPath }
    });
  },

  // Access control events
  async logUnauthorizedAccess(userId: string, resource: string, action: string, ip?: string) {
    await logSecurityEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: SecurityEventSeverity.HIGH,
      userId,
      ip,
      details: { resource, action }
    });
  },

  async logPermissionDenied(userId: string, resource: string, requiredPermission: string, ip?: string) {
    await logSecurityEvent({
      type: SecurityEventType.PERMISSION_DENIED,
      severity: SecurityEventSeverity.MEDIUM,
      userId,
      ip,
      details: { resource, requiredPermission }
    });
  },

  // File upload events
  async logBlockedFileUpload(fileName: string, reason: string, userId?: string, ip?: string) {
    await logSecurityEvent({
      type: SecurityEventType.FILE_UPLOAD_BLOCKED,
      severity: SecurityEventSeverity.MEDIUM,
      userId,
      ip,
      details: { fileName, reason }
    });
  },

  // Session events
  async logSessionHijackAttempt(userId: string, oldIp: string, newIp: string, userAgent?: string) {
    await logSecurityEvent({
      type: SecurityEventType.SESSION_HIJACK_ATTEMPT,
      severity: SecurityEventSeverity.CRITICAL,
      userId,
      ip: newIp,
      userAgent,
      details: { oldIp, newIp }
    });
  },

  // General suspicious activity
  async logSuspiciousActivity(description: string, userId?: string, ip?: string, details?: any) {
    await logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: SecurityEventSeverity.MEDIUM,
      userId,
      ip,
      details: { description, ...details }
    });
  }
};

// Audit trail for sensitive operations
export async function auditLog(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const auditEntry = {
      userId,
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date(),
      ip: details?.ip,
      userAgent: details?.userAgent
    };

    console.log('📋 Audit Log:', JSON.stringify(auditEntry, null, 2));
    
    // In production: Store in audit_logs table
    // await prisma.auditLog.create({ data: auditEntry });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// Helper to detect common attack patterns
export function detectAttackPatterns(input: string): {
  isXSS: boolean;
  isSQLInjection: boolean;
  isPathTraversal: boolean;
} {
  const lowerInput = input.toLowerCase();
  
  // XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /vbscript:/i,
    /data:text\/html/i
  ];
  
  // SQL injection patterns
  const sqlPatterns = [
    /union\s+select/i,
    /;\s*drop\s+table/i,
    /;\s*delete\s+from/i,
    /;\s*update\s+\w+\s+set/i,
    /'\s*or\s*'1'\s*=\s*'1/i,
    /"\s*or\s*"1"\s*=\s*"1/i,
    /--\s*$/
  ];
  
  // Path traversal patterns
  const pathPatterns = [
    /\.\.\//,
    /\.\.\\/, 
    /%2e%2e%2f/i,
    /%252e%252e%252f/i
  ];
  
  return {
    isXSS: xssPatterns.some(pattern => pattern.test(input)),
    isSQLInjection: sqlPatterns.some(pattern => pattern.test(input)),
    isPathTraversal: pathPatterns.some(pattern => pattern.test(input))
  };
}
