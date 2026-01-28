import { create } from 'zustand';
import { apiClient } from '@/api/client';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  hasCheckedAuth: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setAccessToken: (token) => {
    apiClient.setAccessToken(token);
    set({ accessToken: token });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.login(email, password);
      apiClient.setAccessToken(result.accessToken);
      set({
        user: result.user,
        accessToken: result.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const result = await apiClient.register(email, password, name);
      apiClient.setAccessToken(result.accessToken);
      set({
        user: result.user,
        accessToken: result.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      apiClient.setAccessToken(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Try to refresh the token using the HttpOnly cookie
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshResponse.ok) {
        // No valid refresh token - user needs to log in
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          hasCheckedAuth: true,
        });
        return;
      }

      const refreshData = await refreshResponse.json();
      const accessToken = refreshData.data.accessToken;
      apiClient.setAccessToken(accessToken);

      // Now fetch user info
      const response = await apiClient.getMe();
      set({
        user: response.data.user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true,
      });
    } catch {
      // Any error means no valid session
      apiClient.setAccessToken(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
      });
    }
  },
}));
