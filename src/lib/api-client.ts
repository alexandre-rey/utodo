import { type ApiError } from '@/types/api';
import { CookieAuth, CSRFProtection } from '@/utils/cookieAuth';

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL?: string) {
    // Determine the appropriate API URL based on environment
    const isDevelopment = import.meta.env.VITE_ENV === 'development' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    if (baseURL) {
      this.baseURL = baseURL;
    } else if (isDevelopment) {
      this.baseURL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';
    } else {
      this.baseURL = import.meta.env.VITE_API_URL || 'https://api.todo-app.com';
    }
    
    // Enforce HTTPS in production
    this.enforceHTTPS();
    this.loadTokensFromStorage();
  }

  private enforceHTTPS(): void {
    const enforceHTTPS = import.meta.env.VITE_ENFORCE_HTTPS === 'true';
    const isProduction = import.meta.env.VITE_ENV === 'production';
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    // Enforce HTTPS in production or when explicitly enabled
    if ((isProduction || enforceHTTPS) && !isDevelopment) {
      // Redirect to HTTPS if currently on HTTP
      if (window.location.protocol === 'http:') {
        console.warn('Redirecting to HTTPS for security');
        window.location.href = window.location.href.replace('http:', 'https:');
        return;
      }
      
      // Ensure API URL uses HTTPS
      if (this.baseURL.startsWith('http://')) {
        this.baseURL = this.baseURL.replace('http://', 'https://');
      }
    }
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      // Migration: Move existing tokens from localStorage
      CookieAuth.migrateTokensFromStorage();
      
      // For backward compatibility during transition
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    // In a secure implementation, tokens would be set as httpOnly cookies by the server
    // For now, we use localStorage but log a security warning
    console.warn('Security Warning: Tokens should be stored in httpOnly cookies by the server');
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  private clearTokensFromStorage() {
    // Clear both cookie and localStorage tokens
    CookieAuth.clearAuth();
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearTokensFromStorage();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.saveTokensToStorage(data.access_token, data.refresh_token);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add CSRF protection for cookie-based auth
    headers = CSRFProtection.addToHeaders(headers as Record<string, string>);

    if (this.accessToken) {
      headers = {
        ...headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include httpOnly cookies in requests
    });

    if (response.status === 401 && this.refreshToken && endpoint !== '/auth/refresh') {
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshAccessToken()
          .finally(() => {
            this.refreshPromise = null;
          });
      }

      await this.refreshPromise;

      headers = {
        ...headers,
        Authorization: `Bearer ${this.accessToken}`,
      };

      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include httpOnly cookies in requests
      });
    }

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          statusCode: response.status,
          message: response.statusText,
          timestamp: new Date().toISOString(),
          path: endpoint,
        };
      }
      throw errorData;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  public async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(endpoint + (url.search ? `?${url.searchParams}` : ''));
  }

  public async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  public setTokens(accessToken: string, refreshToken: string) {
    this.saveTokensToStorage(accessToken, refreshToken);
  }

  public clearTokens() {
    this.clearTokensFromStorage();
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public isAuthenticated(): boolean {
    // Check both localStorage (for backward compatibility) and cookie-based auth
    return !!this.accessToken || CookieAuth.isAuthenticated();
  }
}

export const apiClient = new ApiClient();