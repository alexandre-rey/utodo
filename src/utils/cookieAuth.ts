/**
 * Cookie-based authentication utilities
 * Note: This handles client-side cookie operations for tokens
 * The server should set httpOnly cookies for maximum security
 */

// Cookie utilities for auth tokens
export class CookieAuth {
  private static readonly ACCESS_TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  /**
   * Check if authentication cookies exist
   * Note: httpOnly cookies cannot be read by JavaScript
   * This checks for the presence of readable auth cookies
   */
  static isAuthenticated(): boolean {
    // In a real implementation with httpOnly cookies,
    // we would make an API call to verify authentication
    // For now, we check for any auth-related cookies
    return document.cookie.includes(this.ACCESS_TOKEN_KEY) || 
           this.hasTokenInStorage();
  }
  
  /**
   * Fallback: Check if tokens exist in secure storage
   * This is used during the transition period
   */
  private static hasTokenInStorage(): boolean {
    return !!(localStorage.getItem('access_token') || 
             sessionStorage.getItem('access_token'));
  }
  
  /**
   * Clear authentication cookies
   * Sets cookies to expire immediately
   */
  static clearAuth(): void {
    // Clear any readable cookies
    this.setCookie(this.ACCESS_TOKEN_KEY, '', -1);
    this.setCookie(this.REFRESH_TOKEN_KEY, '', -1);
    
    // Also clear legacy localStorage tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
  }
  
  /**
   * Set a cookie with security flags
   * Note: In production, the server should set httpOnly cookies
   */
  private static setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    const sameSiteFlag = '; SameSite=Strict';
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/${secureFlag}${sameSiteFlag}`;
  }
  
  /**
   * Get a cookie value by name
   * Note: This won't work for httpOnly cookies (which is the goal)
   */
  static getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  
  /**
   * Migrate tokens from localStorage to secure cookies
   * This should be called during the authentication process
   */
  static migrateTokensFromStorage(): void {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (accessToken || refreshToken) {
      
      // Clear old tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Note: In a real implementation, we would send these tokens to the server
      // and have the server set httpOnly cookies
      console.warn('Token migration requires server-side implementation of httpOnly cookies');
    }
  }
  
  /**
   * Verify authentication status with the server
   * This is necessary when using httpOnly cookies
   */
  static async verifyAuthentication(): Promise<boolean> {
    try {
      // Make a request to a protected endpoint to verify auth
      const response = await fetch('/auth/verify', {
        method: 'GET',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Authentication verification failed:', error);
      return false;
    }
  }
}

/**
 * CSRF Token management
 * Required when using cookies for authentication
 */
export class CSRFProtection {
  private static readonly CSRF_TOKEN_KEY = 'csrf_token';
  private static readonly CSRF_HEADER_NAME = 'X-CSRF-Token';
  
  /**
   * Get CSRF token from meta tag or cookie
   */
  static getToken(): string | null {
    // First, try to get from meta tag (set by server)
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }
    
    // Fallback to cookie
    return CookieAuth.getCookie(this.CSRF_TOKEN_KEY);
  }
  
  /**
   * Add CSRF token to request headers
   */
  static addToHeaders(headers: Record<string, string>): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers[this.CSRF_HEADER_NAME] = token;
    }
    return headers;
  }
}