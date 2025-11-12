/**
 * File upload security validation
 * Validates file content, blocks executables, enforces size limits
 */

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  audio: 500 * 1024 * 1024, // 500 MB
  image: 50 * 1024 * 1024, // 50 MB
  video: 2 * 1024 * 1024 * 1024, // 2 GB
  pdf: 100 * 1024 * 1024, // 100 MB
  lyric: 1 * 1024 * 1024, // 1 MB
  chart: 10 * 1024 * 1024, // 10 MB
  other: 50 * 1024 * 1024 // 50 MB
};

// Executable file extensions (blocked)
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh', '.bash', '.zsh', '.ps1',
  '.msi', '.dll', '.so', '.dylib', '.bin', '.run', '.out'
];

// Magic bytes (file signatures) for common file types
const FILE_SIGNATURES: Record<string, number[][]> = {
  // Audio
  'audio/mpeg': [[0xff, 0xfb], [0xff, 0xf3], [0xff, 0xf2], [0x49, 0x44, 0x33]], // MP3, ID3
  'audio/wav': [[0x52, 0x49, 0x46, 0x46]], // RIFF
  'audio/flac': [[0x66, 0x4c, 0x61, 0x43]], // flac
  'audio/ogg': [[0x4f, 0x67, 0x67, 0x53]], // OggS
  'audio/aac': [[0xff, 0xf1], [0xff, 0xf9]], // AAC
  
  // Images
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (needs more context)
  
  // Video
  'video/mp4': [[0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]],
  'video/quicktime': [[0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x71, 0x74]],
  
  // Documents
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  
  // Text
  'text/plain': [], // No signature, validate by extension
  'text/markdown': [] // No signature, validate by extension
};

/**
 * Check if file extension is blocked (executable)
 */
export function isBlockedExtension(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return BLOCKED_EXTENSIONS.includes(extension);
}

/**
 * Validate file size against limits
 */
export function validateFileSize(size: number, assetType: string): { valid: boolean; error?: string } {
  const maxSize = MAX_FILE_SIZES[assetType as keyof typeof MAX_FILE_SIZES] || MAX_FILE_SIZES.other;
  
  if (size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB} MB for ${assetType} files`
    };
  }
  
  return { valid: true };
}

/**
 * Validate file content matches MIME type using magic bytes
 * Note: This is a simplified check. Full validation would require reading file content.
 * For presigned URLs, we validate on the client side and server validates on createAssetAction.
 */
export function validateFileContent(
  contentType: string,
  filename: string,
  fileBuffer?: Buffer
): { valid: boolean; error?: string } {
  // Block executable extensions regardless of MIME type
  if (isBlockedExtension(filename)) {
    return {
      valid: false,
      error: 'Executable files are not allowed'
    };
  }
  
  // If we have file buffer, check magic bytes
  if (fileBuffer && fileBuffer.length > 0) {
    const signatures = FILE_SIGNATURES[contentType];
    
    if (signatures && signatures.length > 0) {
      const matches = signatures.some(sig => {
        if (fileBuffer.length < sig.length) return false;
        return sig.every((byte, index) => fileBuffer[index] === byte);
      });
      
      if (!matches) {
        return {
          valid: false,
          error: `File content does not match declared MIME type: ${contentType}`
        };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Sanitize file path to prevent directory traversal
 */
export function sanitizeFilePath(path: string): string {
  // Remove any path traversal attempts
  let sanitized = path.replace(/\.\./g, '').replace(/\/\//g, '/');
  
  // Remove leading slashes
  sanitized = sanitized.replace(/^\/+/, '');
  
  // Remove any null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}

/**
 * Validate filename
 */
export function validateFilename(filename: string): { valid: boolean; error?: string } {
  if (!filename || filename.trim().length === 0) {
    return { valid: false, error: 'Filename is required' };
  }
  
  // Block executable extensions
  if (isBlockedExtension(filename)) {
    return { valid: false, error: 'Executable files are not allowed' };
  }
  
  // Block filenames with path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { valid: false, error: 'Invalid filename: path traversal not allowed' };
  }
  
  // Block null bytes
  if (filename.includes('\0')) {
    return { valid: false, error: 'Invalid filename: null bytes not allowed' };
  }
  
  // Limit filename length
  if (filename.length > 255) {
    return { valid: false, error: 'Filename too long (max 255 characters)' };
  }
  
  return { valid: true };
}

/**
 * Comprehensive file upload validation
 */
export function validateFileUpload(
  filename: string,
  contentType: string,
  contentLength: number,
  assetType: string,
  fileBuffer?: Buffer
): { valid: boolean; error?: string } {
  // Validate filename
  const filenameCheck = validateFilename(filename);
  if (!filenameCheck.valid) {
    return filenameCheck;
  }
  
  // Validate file size
  const sizeCheck = validateFileSize(contentLength, assetType);
  if (!sizeCheck.valid) {
    return sizeCheck;
  }
  
  // Validate file content (if buffer provided)
  if (fileBuffer) {
    const contentCheck = validateFileContent(contentType, filename, fileBuffer);
    if (!contentCheck.valid) {
      return contentCheck;
    }
  }
  
  return { valid: true };
}

