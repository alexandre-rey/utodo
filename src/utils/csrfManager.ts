/**
 * CSRF Token Management for Cookie-Based Authentication
 * Handles CSRF token retrieval, storage, and validation
 */

export class CSRFManager {
  private static csrfToken: string | null = null;
  private static tokenPromise: Promise<string> | null = null;

  /**
   * Get CSRF token from meta tag or fetch from server
   */
  static async getCSRFToken(): Promise<string> {
    // Return cached token if available
    if (this.csrfToken) {
      return this.csrfToken;
    }

    // Prevent multiple simultaneous requests
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.fetchCSRFToken();
    
    try {
      this.csrfToken = await this.tokenPromise;
      return this.csrfToken;
    } finally {
      this.tokenPromise = null;
    }
  }

  /**
   * Fetch CSRF token from server or meta tag
   */
  private static async fetchCSRFToken(): Promise<string> {
    // First try to get from meta tag
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) {
      return metaToken;
    }

    // If no meta tag and no cached token, return empty string
    // CSRF token should be set during login via setToken()
    console.warn('No CSRF token available - this should be set during login');
    return '';
  }

  /**
   * Add CSRF token to headers
   */
  static async addCSRFHeader(headers: HeadersInit = {}): Promise<HeadersInit> {
    const token = await this.getCSRFToken();
    
    // Only add the header if we have a token
    if (token) {
      return {
        ...headers,
        'X-CSRF-Token': token,
      };
    }
    
    return headers;
  }

  /**
   * Clear cached CSRF token (e.g., on logout)
   */
  static clearToken(): void {
    this.csrfToken = null;
    this.tokenPromise = null;
  }

  /**
   * Update CSRF token (e.g., after login or refresh)
   */
  static setToken(token: string): void {
    this.csrfToken = token;
  }

  /**
   * Check if CSRF token is available
   */
  static hasToken(): boolean {
    return !!this.csrfToken;
  }
}