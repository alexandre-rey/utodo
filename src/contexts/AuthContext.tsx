import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { type User, type LoginDto, type RegisterDto } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only check authentication if there are cookies that might contain tokens
        if (document.cookie && document.cookie.includes('access_token')) {
          // Check authentication status by trying to get profile
          // Skip auto-refresh to avoid unnecessary token refresh attempts
          const profile = await authService.getProfile(true);
          setUser(profile);
        } else {
          // No cookies, user is not authenticated
          setUser(null);
        }
      } catch {
        // If profile request fails, user is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    try {
      const loginResponse = await authService.login(credentials);
      // Login response might contain user data directly
      if (loginResponse.user) {
        setUser(loginResponse.user);
      } else {
        // Fallback: get profile from server
        const profile = await authService.getProfile();
        setUser(profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterDto) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(userData);
      // newUser is now the full User object with all required fields
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if server logout fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}