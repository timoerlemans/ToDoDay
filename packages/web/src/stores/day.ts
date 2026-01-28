import { create } from 'zustand';

interface DayItem {
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
}

interface DayState {
  currentDate: string;
  items: DayItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentDate: (date: string) => void;
  setItems: (items: DayItem[]) => void;
  addItem: (item: DayItem) => void;
  updateItem: (itemId: string, updates: Partial<DayItem>) => void;
  removeItem: (itemId: string) => void;
  toggleComplete: (itemId: string) => void;
  reorderItems: (startIndex: number, endIndex: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export const useDayStore = create<DayState>((set, get) => ({
  currentDate: getTodayString(),
  items: [],
  isLoading: false,
  error: null,

  setCurrentDate: (date) => {
    set({ currentDate: date, items: [], error: null });
  },

  setItems: (items) => {
    set({ items, isLoading: false, error: null });
  },

  addItem: (item) => {
    set((state) => ({
      items: [...state.items, item],
    }));
  },

  updateItem: (itemId, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  toggleComplete: (itemId) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : null,
            }
          : item
      ),
    }));
  },

  reorderItems: (startIndex, endIndex) => {
    set((state) => {
      const newItems = [...state.items];
      const [removed] = newItems.splice(startIndex, 1);
      newItems.splice(endIndex, 0, removed);

      // Update sort orders
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        sortOrder: index,
      }));

      return { items: reorderedItems };
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },
}));

// Selector helpers
export const selectPendingTasks = (state: DayState) =>
  state.items.filter((item) => item.type === 'task' && !item.completed);

export const selectCompletedTasks = (state: DayState) =>
  state.items.filter((item) => item.type === 'task' && item.completed);

export const selectEvents = (state: DayState) =>
  state.items.filter((item) => item.type === 'event');

export const selectAllItemsSorted = (state: DayState) =>
  [...state.items].sort((a, b) => a.sortOrder - b.sortOrder);
