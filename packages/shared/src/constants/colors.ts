/**
 * Colors used in the spiral visualization
 */
export const SPIRAL_COLORS = {
  task: '#4A90D9', // Blue for tasks
  event: '#F5A623', // Yellow for events
  completed: '#D0D0D0', // Light gray for completed
  urgent: '#D64545', // Red for urgent/priority
  currentTime: '#E74C3C', // Red for time indicator
  background: '#FFFFFF', // White for empty space
  border: '#333333', // Dark border
} as const;

/**
 * Dark mode color variants
 */
export const SPIRAL_COLORS_DARK = {
  task: '#5BA3EC', // Brighter blue for dark mode
  event: '#FFB84D', // Brighter yellow for dark mode
  completed: '#6B6B6B', // Darker gray for dark mode
  urgent: '#E85A5A', // Brighter red for dark mode
  currentTime: '#FF6B5A', // Brighter indicator for dark mode
  background: '#1A1A1A', // Dark background
  border: '#E0E0E0', // Light border for dark mode
} as const;

export type SpiralColorKey = keyof typeof SPIRAL_COLORS;

/**
 * Get color for an item based on its state and type
 */
export function getItemColor(
  type: 'task' | 'event',
  completed: boolean,
  priority: 'normal' | 'urgent',
  isDarkMode: boolean = false
): string {
  const colors = isDarkMode ? SPIRAL_COLORS_DARK : SPIRAL_COLORS;

  if (completed) {
    return colors.completed;
  }

  if (priority === 'urgent') {
    return colors.urgent;
  }

  return type === 'task' ? colors.task : colors.event;
}
