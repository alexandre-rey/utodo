/**
 * XSS Protection Utilities
 * Comprehensive protection against Cross-Site Scripting attacks
 */

/**
 * HTML Entity Encoding
 * Prevents XSS by encoding dangerous characters
 */
export class HTMLSanitizer {
  private static readonly HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  /**
   * Escape HTML entities to prevent XSS
   */
  static escapeHTML(str: string): string {
    if (typeof str !== 'string') {
      return String(str);
    }
    
    return str.replace(/[&<>"'`=/]/g, (match) => {
      return this.HTML_ENTITIES[match] || match;
    });
  }

  /**
   * Sanitize user input before storing or displaying
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove script tags and event handlers
    const sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '');

    // Escape remaining HTML
    return this.escapeHTML(sanitized);
  }

  /**
   * Validate that a string contains only safe characters
   */
  static isValidInput(input: string, allowHTML = false): boolean {
    if (typeof input !== 'string') {
      return false;
    }

    // Check for common XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i,
      /expression\s*\(/i
    ];

    if (!allowHTML) {
      xssPatterns.push(/<[^>]*>/);
    }

    return !xssPatterns.some(pattern => pattern.test(input));
  }
}

/**
 * URL Validation and Sanitization
 */
export class URLSanitizer {
  private static readonly SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

  /**
   * Validate that a URL is safe
   */
  static isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return this.SAFE_PROTOCOLS.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitize URL to prevent javascript: and data: URLs
   */
  static sanitizeURL(url: string): string {
    if (!this.isValidURL(url)) {
      return '#';
    }
    return url;
  }
}

/**
 * Content Security Policy Helper
 */
export class CSPManager {
  /**
   * Generate a random nonce for inline scripts
   */
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Validate that content meets CSP requirements
   */
  static validateContent(content: string): boolean {
    // Check for inline scripts without nonce
    const inlineScriptPattern = /<script(?![^>]*nonce=)[^>]*>/i;
    return !inlineScriptPattern.test(content);
  }
}

/**
 * Input Validation for specific field types
 */
export class InputValidator {
  /**
   * Validate email format and prevent XSS
   */
  static validateEmail(email: string): boolean {
    if (!HTMLSanitizer.isValidInput(email)) {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate todo title/description
   */
  static validateTodoText(text: string): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }

    // Allow basic formatting but prevent scripts
    return HTMLSanitizer.isValidInput(text, false) && text.length <= 10000;
  }

  /**
   * Validate JSON data to prevent prototype pollution
   */
  static validateJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Check for prototype pollution attempts
      const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
      const hasDangerousKeys = (obj: any): boolean => {
        if (typeof obj !== 'object' || obj === null) {
          return false;
        }
        
        return Object.keys(obj).some(key => {
          return dangerousKeys.includes(key) || hasDangerousKeys(obj[key]);
        });
      };

      return !hasDangerousKeys(parsed);
    } catch {
      return false;
    }
  }
}

/**
 * Token Security for JWT validation (cookies are managed by server)
 */
export class TokenSecurity {
  /**
   * Validate that a token has the expected format
   */
  static validateTokenFormat(token: string): boolean {
    if (typeof token !== 'string' || token.length === 0) {
      return false;
    }

    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Each part should be base64url encoded
    const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
    return parts.every(part => base64UrlRegex.test(part));
  }

  /**
   * Validate JWT token structure (for API responses)
   */
  static validateJWTResponse(response: any): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    // Check if response contains valid JWT tokens
    if (response.access_token && !this.validateTokenFormat(response.access_token)) {
      return false;
    }

    if (response.refresh_token && !this.validateTokenFormat(response.refresh_token)) {
      return false;
    }

    return true;
  }
}