import { type ApiError } from '@/types/api';
import { CSRFManager } from '@/utils/csrfManager';

class ApiClient {
  private baseURL: string;
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

  private clearAuthState() {
    // Clear CSRF token only - don't call logout endpoint to avoid recursion
    CSRFManager.clearToken();
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: await CSRFManager.addCSRFHeader({
          'Content-Type': 'application/json',
        }),
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status, response.statusText);
        this.clearAuthState();
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Update CSRF token if provided
      if (data.csrfToken) {
        CSRFManager.setToken(data.csrfToken);
      }
    } catch (error) {
      await this.clearAuthState();
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAutoRefresh = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Add CSRF token to headers for state-changing operations
    const needsCSRF = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(options.method?.toUpperCase() || 'GET');
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (needsCSRF) {
      headers = await CSRFManager.addCSRFHeader(headers);
    }

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Always include cookies
    });

    // Handle 401 with automatic token refresh (skip during initial auth check)
    if (response.status === 401 && endpoint !== '/auth/refresh' && !skipAutoRefresh) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshAccessToken()
          .finally(() => {
            this.refreshPromise = null;
          });
      }

      await this.refreshPromise;

      // Update headers with new CSRF token if needed
      if (needsCSRF) {
        headers = await CSRFManager.addCSRFHeader({
          'Content-Type': 'application/json',
          ...options.headers,
        });
      }

      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
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

  public async get<T>(endpoint: string, params?: Record<string, unknown>, skipAutoRefresh = false): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(endpoint + (url.search ? `?${url.searchParams}` : ''), {}, skipAutoRefresh);
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

  public async clearTokens() {
    this.clearAuthState();
  }

  public async isAuthenticated(): Promise<boolean> {
    // Check if there are cookies that might contain tokens
    if (!document.cookie || !document.cookie.includes('access_token')) {
      return false;
    }
    
    // Check authentication by making a request to a protected endpoint
    try {
      await this.get('/auth/me', undefined, true); // Skip auto-refresh
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();