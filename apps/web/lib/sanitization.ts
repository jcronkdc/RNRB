import DOMPurify from 'dompurify';

// Configure DOMPurify for different contexts
// Import JSDOM for server-side usage
let JSDOM: any;
if (typeof window === 'undefined') {
  // Dynamic import for server-side only
  import('jsdom').then(mod => {
    JSDOM = mod.JSDOM;
  }).catch(() => {
    // Ignore error if jsdom not available
  });
}

export const sanitizeHtml = (dirty: string): string => {
  if (typeof window === 'undefined' && JSDOM) {
    // Server-side sanitization using JSDOM
    const dom = new JSDOM('');
    const window = dom.window as unknown as Window;
    const purify = DOMPurify(window as any);
    return purify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:]+|$))/i
    });
  }
  
  // Client-side sanitization
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:]+|$))/i
  });
};

// Sanitize plain text (no HTML allowed)
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove all HTML tags
  const cleaned = text.replace(/<[^>]*>?/gm, '');
  
  // Escape special characters
  return cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize user input before display
export const sanitizeUserInput = (input: string | null | undefined): string => {
  if (!input) return '';
  
  // Remove any potential XSS vectors
  const cleaned = input
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframes
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '');
    
  return sanitizeText(cleaned);
};

// Sanitize URL to prevent javascript: and data: URLs
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  const cleaned = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (cleaned.startsWith('javascript:') || 
      cleaned.startsWith('data:') || 
      cleaned.startsWith('vbscript:')) {
    return '';
  }
  
  // Ensure URL is properly encoded
  try {
    return encodeURI(url);
  } catch {
    return '';
  }
};

  // Sanitize file names
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return '';
  
  // Remove any path traversal attempts
  return fileName
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '_')
    .replace(/[^a-zA-Z0-9._ -]/g, '');
};

// Content Security Policy header generator
export const getCSPHeader = (): string => {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com", // Remove unsafe-inline in production
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Remove unsafe-inline in production
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.cronkwaters.com wss://cronkwaters.com",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  return directives.join('; ');
};
