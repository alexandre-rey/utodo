import { apiClient } from '@/lib/api-client';
import { type LoginDto, type RegisterDto, type AuthResponse, type User } from '@/types/api';
import { todoService } from './todo.service';
import { settingsService } from './settings.service';

class AuthService {
  public async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    apiClient.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  public async register(userData: RegisterDto): Promise<User> {
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
      apiClient.clearTokens();
    }
  }

  public async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  }

  public async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    
    apiClient.setTokens(response.access_token, response.refresh_token);
  }

  public isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  public clearAuth(): void {
    apiClient.clearTokens();
  }
}

export const authService = new AuthService();