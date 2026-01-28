import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

  // Actions
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

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
        const { accessToken } = get();

        if (!accessToken) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        apiClient.setAccessToken(accessToken);

        try {
          const result = await apiClient.getMe();
          set({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token might be expired, try to refresh
          try {
            // The apiClient will handle refresh automatically
            // If we get here, the token couldn't be refreshed
            apiClient.setAccessToken(null);
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          } catch {
            apiClient.setAccessToken(null);
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      },
    }),
    {
      name: 'tododay-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          apiClient.setAccessToken(state.accessToken);
        }
        // After rehydration, check if token is still valid
        state?.checkAuth();
      },
    }
  )
);
