import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

// Query key factories
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  days: {
    all: ['days'] as const,
    detail: (date: string) => ['days', date] as const,
    items: (date: string) => ['days', date, 'items'] as const,
    schedule: (date: string) => ['days', date, 'schedule'] as const,
  },
  items: {
    all: ['items'] as const,
    detail: (id: string) => ['items', id] as const,
  },
  settings: ['settings'] as const,
  health: ['health'] as const,
};

// Auth hooks
export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiClient.getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name?: string }) =>
      apiClient.register(email, password, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Day hooks
export function useDay(date: string) {
  return useQuery({
    queryKey: queryKeys.days.detail(date),
    queryFn: () => apiClient.getDay(date),
    enabled: !!date,
  });
}

export function useDayItems(date: string) {
  return useQuery({
    queryKey: queryKeys.days.items(date),
    queryFn: () => apiClient.getDayItems(date),
    enabled: !!date,
  });
}

export function useSchedule(date: string) {
  return useQuery({
    queryKey: queryKeys.days.schedule(date),
    queryFn: () => apiClient.getSchedule(date),
    enabled: !!date,
  });
}

// Item hooks
export function useCreateItem(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ text, type, priority }: {
      text: string;
      type?: 'task' | 'event';
      priority?: 'normal' | 'urgent';
    }) => apiClient.createItem(date, text, type, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.days.detail(date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.days.items(date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.days.schedule(date) });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, updates }: {
      itemId: string;
      updates: {
        text?: string;
        type?: 'task' | 'event';
        startTime?: string | null;
        endTime?: string | null;
        duration?: number;
        priority?: 'normal' | 'urgent';
        sortOrder?: number;
      };
    }) => apiClient.updateItem(itemId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.days.all });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => apiClient.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.days.all });
    },
  });
}

export function useCompleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed?: boolean }) =>
      apiClient.completeItem(itemId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.days.all });
    },
  });
}

export function useReorderItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: Array<{ id: string; sortOrder: number }>) =>
      apiClient.reorderItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.days.all });
    },
  });
}

// Settings hooks
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => apiClient.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: {
      workdayStart?: number;
      workdayEnd?: number;
      defaultDuration?: number;
      timestampFormat?: '12h' | '24h';
      colorScheme?: 'light' | 'dark' | 'system';
    }) => apiClient.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      queryClient.invalidateQueries({ queryKey: queryKeys.days.all });
    },
  });
}

// Health hooks
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // 10 seconds
  });
}
