const API_BASE = '/api';

export class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type for requests with a body
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh token
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && this.accessToken) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry the request with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });

        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({}));
          throw new Error(error.error?.message || `Request failed: ${retryResponse.status}`);
        }

        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Request failed: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async tryRefreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  private async doRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        this.accessToken = null;
        return false;
      }

      const data = await response.json();
      this.accessToken = data.data.accessToken;
      return true;
    } catch {
      this.accessToken = null;
      return false;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string) {
    const response = await this.request<{
      data: {
        user: { id: string; email: string; name: string | null };
        accessToken: string;
        expiresIn: number;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    this.accessToken = response.data.accessToken;
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      data: {
        user: { id: string; email: string; name: string | null };
        accessToken: string;
        expiresIn: number;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.accessToken = response.data.accessToken;
    return response.data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.accessToken = null;
    }
  }

  async getMe() {
    return this.request<{
      data: {
        user: { id: string; email: string; name: string | null; createdAt: string };
      };
    }>('/auth/me');
  }

  // Day endpoints
  async getDay(date: string) {
    return this.request<{
      data: {
        id: string;
        userId: string;
        date: string;
        notes: string | null;
        items: Array<{
          id: string;
          dayId: string;
          userId: string;
          type: 'task' | 'event';
          text: string;
          sortOrder: number;
          completed: boolean;
          completedAt: string | null;
          startTime: string | null;
          endTime: string | null;
          duration: number;
          priority: 'normal' | 'urgent';
          parentId: string | null;
          createdAt: string;
          updatedAt: string;
        }>;
        createdAt: string;
        updatedAt: string;
      };
    }>(`/days/${date}`);
  }

  async getDayItems(date: string) {
    return this.request<{
      data: Array<{
        id: string;
        type: 'task' | 'event';
        text: string;
        sortOrder: number;
        completed: boolean;
        completedAt: string | null;
        startTime: string | null;
        endTime: string | null;
        duration: number;
        priority: 'normal' | 'urgent';
      }>;
    }>(`/days/${date}/items`);
  }

  async createItem(date: string, text: string, type?: 'task' | 'event', priority?: 'normal' | 'urgent') {
    return this.request<{
      data: {
        id: string;
        type: 'task' | 'event';
        text: string;
        sortOrder: number;
        completed: boolean;
        completedAt: string | null;
        startTime: string | null;
        endTime: string | null;
        duration: number;
        priority: 'normal' | 'urgent';
      };
    }>(`/days/${date}/items`, {
      method: 'POST',
      body: JSON.stringify({ text, type, priority }),
    });
  }

  async getSchedule(date: string) {
    return this.request<{
      data: {
        scheduled: Array<{
          item: {
            id: string;
            type: 'task' | 'event';
            text: string;
            completed: boolean;
            duration: number;
            priority: 'normal' | 'urgent';
          };
          scheduledStart: string;
          scheduledEnd: string;
          overflows: boolean;
        }>;
        overflow: Array<{
          id: string;
          type: 'task' | 'event';
          text: string;
          duration: number;
        }>;
        freeMinutes: number;
      };
    }>(`/days/${date}/schedule`);
  }

  // Item endpoints
  async updateItem(itemId: string, updates: {
    text?: string;
    type?: 'task' | 'event';
    startTime?: string | null;
    endTime?: string | null;
    duration?: number;
    priority?: 'normal' | 'urgent';
    sortOrder?: number;
  }) {
    return this.request<{ data: unknown }>(`/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteItem(itemId: string) {
    return this.request<{ data: { message: string } }>(`/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async completeItem(itemId: string, completed?: boolean) {
    return this.request<{ data: unknown }>(`/items/${itemId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completed }),
    });
  }

  async reorderItems(items: Array<{ id: string; sortOrder: number }>) {
    return this.request<{ data: { message: string } }>('/items/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    });
  }

  // Settings endpoints
  async getSettings() {
    return this.request<{
      data: {
        workdayStart: number;
        workdayEnd: number;
        defaultDuration: number;
        timestampFormat: '12h' | '24h';
        colorScheme: 'light' | 'dark' | 'system';
        updatedAt: string;
      };
    }>('/settings');
  }

  async updateSettings(settings: {
    workdayStart?: number;
    workdayEnd?: number;
    defaultDuration?: number;
    timestampFormat?: '12h' | '24h';
    colorScheme?: 'light' | 'dark' | 'system';
  }) {
    return this.request<{
      data: {
        workdayStart: number;
        workdayEnd: number;
        defaultDuration: number;
        timestampFormat: '12h' | '24h';
        colorScheme: 'light' | 'dark' | 'system';
        updatedAt: string;
      };
    }>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // Health endpoint
  async getHealth() {
    return this.request<{
      status: 'ok' | 'degraded';
      timestamp: string;
      services: {
        api: { status: 'ok' | 'error' };
        database: {
          status: 'ok' | 'error';
          responseTime?: number;
          error?: string;
        };
      };
    }>('/health');
  }
}

// Singleton instance
export const apiClient = new ApiClient();
