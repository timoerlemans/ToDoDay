import { create } from 'zustand';

interface DayState {
  currentDate: string;
  setCurrentDate: (date: string) => void;
}

function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export const useDayStore = create<DayState>((set) => ({
  currentDate: getTodayString(),

  setCurrentDate: (date) => {
    set({ currentDate: date });
  },
}));
