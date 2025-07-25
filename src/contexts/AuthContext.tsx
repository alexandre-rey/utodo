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
          // Clear any stale auth state
          await authService.clearAuth();
        }
      } catch {
        // If profile request fails, user is not authenticated
        setUser(null);
        // Clear any stale auth state and local data
        await authService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginDto) => {
    setIsLoading(true);
    try {
      await authService.login(credentials);
      // Always get complete profile from server after login
      const profile = await authService.getProfile();
      setUser(profile);
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
    // Prevent multiple logout calls during StrictMode double-execution
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Still proceed with local cleanup even if server logout fails
    } finally {
      // Always clear user state and local data
      setUser(null);
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