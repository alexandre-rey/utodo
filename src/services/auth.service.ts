import { apiClient } from '@/lib/api-client';
import { type LoginDto, type RegisterDto, type AuthResponse, type User } from '@/types/api';
import { todoService } from './todo.service';
import { settingsService } from './settings.service';
import { SecurityMiddleware } from '@/middleware/securityMiddleware';
import { CSRFManager } from '@/utils/csrfManager';

class AuthService {
  public async login(credentials: LoginDto): Promise<AuthResponse> {
    // Validate credentials for XSS protection
    if (!SecurityMiddleware.validateAuthCredentials(credentials)) {
      throw new Error('Invalid credentials format');
    }

    // Check rate limiting
    if (!SecurityMiddleware.checkRateLimit('login', 5, 300000)) { // 5 attempts per 5 minutes
      throw new Error('Too many login attempts. Please try again later.');
    }

    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Update CSRF token from response
    if (response.csrfToken) {
      CSRFManager.setToken(response.csrfToken);
    }
    
    return response;
  }

  public async register(userData: RegisterDto): Promise<User> {
    // Validate registration data
    if (!SecurityMiddleware.validateAuthCredentials({ email: userData.email, password: userData.password })) {
      throw new Error('Invalid registration data format');
    }

    // Check rate limiting for registration
    if (!SecurityMiddleware.checkRateLimit('register', 3, 3600000)) { // 3 attempts per hour
      throw new Error('Too many registration attempts. Please try again later.');
    }

    await apiClient.post<User>('/auth/register', userData);
    
    // Auto-login after registration to get tokens
    await this.login({
      email: userData.email,
      password: userData.password
    });
    
    // Sync local data to backend after registration
    await Promise.all([
      todoService.syncLocalTodosToServer(),
      settingsService.syncLocalSettingsToServer()
    ]);
    
    // Get the full user profile to return complete User object
    return this.getProfile();
  }

  public async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await apiClient.clearTokens();
      // Reset sync flags
      todoService.setSyncFlag(false);
      settingsService.setSyncFlag(false);
    }
  }

  public async getProfile(skipAutoRefresh = false): Promise<User> {
    return apiClient.get<User>('/auth/profile', undefined, skipAutoRefresh);
  }

  public async refreshToken(): Promise<void> {
    // Token refresh is now handled automatically by the API client
    // This method is kept for backward compatibility
    const response = await apiClient.post<{ csrfToken?: string }>('/auth/refresh');
    
    // Update CSRF token if provided
    if (response.csrfToken) {
      CSRFManager.setToken(response.csrfToken);
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    return apiClient.isAuthenticated();
  }

  public async clearAuth(): Promise<void> {
    await apiClient.clearTokens();
    // Reset sync flags
    todoService.setSyncFlag(false);
    settingsService.setSyncFlag(false);
  }
}

export const authService = new AuthService();