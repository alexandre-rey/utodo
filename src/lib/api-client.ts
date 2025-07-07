import { type ApiError } from '@/types/api';
import { TokenSecurity } from '@/utils/xssProtection';

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
      // Securely load and validate tokens from localStorage
      this.accessToken = TokenSecurity.secureRetrieve('access_token');
      this.refreshToken = TokenSecurity.secureRetrieve('refresh_token');
    }
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      // Securely store and validate tokens in localStorage
      const accessStored = TokenSecurity.secureStore('access_token', accessToken);
      const refreshStored = TokenSecurity.secureStore('refresh_token', refreshToken);
      
      if (!accessStored || !refreshStored) {
        console.error('Failed to store tokens securely - clearing existing tokens');
        return;
      }
    }
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  private clearTokensFromStorage() {
    // Clear localStorage tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    
    // Clear in-memory tokens
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
      console.error('Token refresh failed:', response.status, response.statusText);
      this.clearTokensFromStorage();
      throw new Error(`Token refresh failed: ${response.status}`);
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


    if (this.accessToken) {
      headers = {
        ...headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    let response = await fetch(url, {
      ...options,
      headers,
credentials: 'include'
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
  credentials: 'include'
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
    return !!this.accessToken;
  }
}

export const apiClient = new ApiClient();