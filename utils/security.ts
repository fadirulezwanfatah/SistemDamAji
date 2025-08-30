// Security utilities for the Dam Aji Tournament System

// Rate limiting for actions
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if limit exceeded
    if (record.count >= this.maxAttempts) {
      return false;
    }

    // Increment count
    record.count++;
    record.lastAttempt = now;
    return true;
  }

  getRemainingTime(key: string): number {
    const record = this.attempts.get(key);
    if (!record || record.count < this.maxAttempts) return 0;
    
    const elapsed = Date.now() - record.lastAttempt;
    return Math.max(0, this.windowMs - elapsed);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Create rate limiters for different actions
export const playerActionLimiter = new RateLimiter(10, 60000); // 10 actions per minute
export const matchActionLimiter = new RateLimiter(20, 60000); // 20 actions per minute
export const adminActionLimiter = new RateLimiter(50, 60000); // 50 actions per minute

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
};

// Deep sanitize object
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeInput(key)] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

// Validate file uploads
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'Saiz fail terlalu besar (maksimum 5MB)' };
  }

  // Check file type
  const allowedTypes = ['application/json', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Jenis fail tidak dibenarkan. Hanya JSON sahaja.' };
  }

  // Check file name
  const fileName = file.name.toLowerCase();
  if (!/^[a-z0-9._-]+\.json$/i.test(fileName)) {
    return { isValid: false, error: 'Nama fail tidak sah' };
  }

  return { isValid: true };
};

// Content Security Policy helpers
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate JSON structure
export const validateJSON = (jsonString: string): { isValid: boolean; data?: any; error?: string } => {
  try {
    const data = JSON.parse(jsonString);
    
    // Check for potential security issues
    const jsonStr = JSON.stringify(data);
    if (jsonStr.includes('<script') || jsonStr.includes('javascript:')) {
      return { isValid: false, error: 'Kandungan JSON mengandungi elemen yang tidak selamat' };
    }
    
    return { isValid: true, data };
  } catch (error) {
    return { isValid: false, error: 'Format JSON tidak sah' };
  }
};

// Secure local storage operations
export const secureStorage = {
  setItem: (key: string, value: any): boolean => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const sanitizedValue = sanitizeObject(value);
      localStorage.setItem(sanitizedKey, JSON.stringify(sanitizedValue));
      return true;
    } catch (error) {
      console.error('Secure storage set error:', error);
      return false;
    }
  },

  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const item = localStorage.getItem(sanitizedKey);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      return sanitizeObject(parsed) || defaultValue;
    } catch (error) {
      console.error('Secure storage get error:', error);
      return defaultValue;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch (error) {
      console.error('Secure storage remove error:', error);
      return false;
    }
  }
};

// Validate tournament state transitions
export const validateStateTransition = (
  currentState: string, 
  newState: string
): { isValid: boolean; error?: string } => {
  const validTransitions: Record<string, string[]> = {
    'OFFLINE': ['ONLINE'],
    'ONLINE': ['OFFLINE', 'FINISHED'],
    'FINISHED': ['OFFLINE'] // Allow reset
  };

  const allowedStates = validTransitions[currentState];
  if (!allowedStates || !allowedStates.includes(newState)) {
    return { 
      isValid: false, 
      error: `Peralihan status dari ${currentState} ke ${newState} tidak dibenarkan` 
    };
  }

  return { isValid: true };
};

// Audit logging
interface AuditLog {
  timestamp: string;
  action: string;
  details: any;
  userAgent?: string;
}

class AuditLogger {
  private logs: AuditLog[] = [];
  private maxLogs: number = 1000;

  log(action: string, details: any): void {
    const auditLog: AuditLog = {
      timestamp: new Date().toISOString(),
      action: sanitizeInput(action),
      details: sanitizeObject(details),
      userAgent: navigator.userAgent
    };

    this.logs.unshift(auditLog);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Store in secure storage
    secureStorage.setItem('audit_logs', this.logs);
  }

  getLogs(): AuditLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    secureStorage.removeItem('audit_logs');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const auditLogger = new AuditLogger();

// Security headers for development
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://aistudiocdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Validate environment
export const validateEnvironment = (): { isSecure: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  let isSecure = true;

  // Check if running on HTTPS in production
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    warnings.push('Aplikasi tidak berjalan di HTTPS');
    isSecure = false;
  }

  // Check for development mode
  if (process.env.NODE_ENV === 'development') {
    warnings.push('Aplikasi berjalan dalam mod pembangunan');
  }

  // Check for secure context
  if (!window.isSecureContext) {
    warnings.push('Konteks tidak selamat - beberapa ciri mungkin tidak berfungsi');
    isSecure = false;
  }

  return { isSecure, warnings };
};

// Initialize security measures
export const initializeSecurity = (): void => {
  // Log security initialization
  auditLogger.log('SECURITY_INIT', { 
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    location: window.location.href
  });

  // Validate environment
  const { isSecure, warnings } = validateEnvironment();
  if (!isSecure) {
    console.warn('Security warnings:', warnings);
  }

  // Set up global error handling
  window.addEventListener('error', (event) => {
    auditLogger.log('GLOBAL_ERROR', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Set up unhandled promise rejection handling
  window.addEventListener('unhandledrejection', (event) => {
    auditLogger.log('UNHANDLED_REJECTION', {
      reason: event.reason?.toString() || 'Unknown'
    });
  });
};
