/**
 * Security Middleware for API requests and authentication
 */

import { InputValidator, HTMLSanitizer } from '@/utils/xssProtection';

export class SecurityMiddleware {
  /**
   * Validate and sanitize authentication credentials
   */
  static validateAuthCredentials(credentials: { email: string; password: string }): boolean {
    // Validate email format and XSS protection
    if (!InputValidator.validateEmail(credentials.email)) {
      console.error('Invalid email format or potential XSS attempt');
      return false;
    }

    // Basic password validation (server should handle complexity requirements)
    if (!credentials.password || credentials.password.length < 1) {
      console.error('Invalid password');
      return false;
    }

    // Check for potential XSS in password
    if (!HTMLSanitizer.isValidInput(credentials.password)) {
      console.error('Invalid characters in password - possible XSS attempt');
      return false;
    }

    return true;
  }

  /**
   * Validate and sanitize todo data
   */
  static validateTodoData(todo: { title: string; description?: string }): { title: string; description: string } | null {
    const sanitizedTitle = HTMLSanitizer.sanitizeInput(todo.title);
    const sanitizedDescription = todo.description ? HTMLSanitizer.sanitizeInput(todo.description) : '';

    if (!InputValidator.validateTodoText(sanitizedTitle)) {
      console.error('Invalid todo title - potential XSS attempt');
      return null;
    }

    if (sanitizedDescription && !InputValidator.validateTodoText(sanitizedDescription)) {
      console.error('Invalid todo description - potential XSS attempt');
      return null;
    }

    return {
      title: sanitizedTitle,
      description: sanitizedDescription
    };
  }

  /**
   * Validate API response data
   */
  static validateAPIResponse(data: unknown): boolean {
    if (typeof data === 'string') {
      try {
        JSON.parse(data); // Just validate JSON syntax
        return InputValidator.validateJSON(data);
      } catch {
        return HTMLSanitizer.isValidInput(data);
      }
    }

    if (typeof data === 'object' && data !== null) {
      // Check for prototype pollution in response
      const jsonString = JSON.stringify(data);
      return InputValidator.validateJSON(jsonString);
    }

    return true;
  }

  /**
   * Add security headers to requests
   */
  static addSecurityHeaders(headers: Record<string, string>): Record<string, string> {
    return {
      ...headers,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  /**
   * Rate limiting check (client-side basic protection)
   */
  static checkRateLimit(action: string, maxAttempts = 5, windowMs = 60000): boolean {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.setItem(key, JSON.stringify({ count: 1, firstAttempt: now }));
        return true;
      }

      const { count, firstAttempt } = JSON.parse(stored);
      
      // Reset if window has expired
      if (now - firstAttempt > windowMs) {
        localStorage.setItem(key, JSON.stringify({ count: 1, firstAttempt: now }));
        return true;
      }

      // Check if rate limit exceeded
      if (count >= maxAttempts) {
        console.warn(`Rate limit exceeded for action: ${action}`);
        return false;
      }

      // Increment counter
      localStorage.setItem(key, JSON.stringify({ count: count + 1, firstAttempt }));
      return true;
    } catch (error) {
      console.error('Rate limiting error:', error);
      return true; // Allow on error to avoid blocking legitimate users
    }
  }

  /**
   * Check if the current environment is secure
   */
  static isSecureEnvironment(): boolean {
    // Check for HTTPS in production
    const isProduction = import.meta.env.VITE_ENV === 'production';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isProduction && !isLocalhost && window.location.protocol !== 'https:') {
      console.error('Insecure environment: HTTPS required in production');
      return false;
    }

    // Check for CSP support
    if (!window.document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      console.warn('Content Security Policy not detected');
    }

    return true;
  }

  /**
   * Initialize security checks
   */
  static initializeSecurity(): void {
    // Check environment security
    if (!this.isSecureEnvironment()) {
      console.error('Security check failed - environment not secure');
    }

    // Prevent clickjacking
    if (window.self !== window.top) {
      console.error('Potential clickjacking attempt detected');
      if (window.top) {
        window.top.location.href = window.self.location.href;
      }
    }

    // Add global error handler for security issues
    window.addEventListener('securitypolicyviolation', (event) => {
      console.error('CSP Violation:', event.violatedDirective, event.blockedURI);
    });
  }
}