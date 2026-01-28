import { useState } from 'react';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import type { NautilusItem } from '@tododay/shared';

// Sample data for demonstration
const SAMPLE_ITEMS: NautilusItem[] = [
  {
    id: '1',
    type: 'event',
    text: 'Team standup',
    sortOrder: 0,
    completed: false,
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(9, 30, 0, 0)),
    duration: 30,
    priority: 'normal',
  },
  {
    id: '2',
    type: 'task',
    text: 'Review pull requests',
    sortOrder: 1,
    completed: true,
    completedAt: new Date(new Date().setHours(10, 15, 0, 0)),
    duration: 45,
    priority: 'normal',
  },
  {
    id: '3',
    type: 'task',
    text: 'Implement user authentication',
    sortOrder: 2,
    completed: false,
    duration: 120,
    priority: 'urgent',
  },
  {
    id: '4',
    type: 'event',
    text: 'Lunch with client',
    sortOrder: 3,
    completed: false,
    startTime: new Date(new Date().setHours(12, 0, 0, 0)),
    endTime: new Date(new Date().setHours(13, 0, 0, 0)),
    duration: 60,
    priority: 'normal',
  },
  {
    id: '5',
    type: 'task',
    text: 'Write documentation',
    sortOrder: 4,
    completed: false,
    duration: 60,
    priority: 'normal',
  },
];

export function TaskList() {
  const [items, setItems] = useState<NautilusItem[]>(SAMPLE_ITEMS);

  const handleToggleComplete = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date() : undefined,
            }
          : item
      )
    );
  };

  const handleAddItem = (text: string, type: 'task' | 'event') => {
    const newItem: NautilusItem = {
      id: crypto.randomUUID(),
      type,
      text,
      sortOrder: items.length,
      completed: false,
      duration: 30,
      priority: 'normal',
    };
    setItems(prev => [...prev, newItem]);
  };

  const pendingItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  return (
    <div className="space-y-6">
      <TaskForm onAdd={handleAddItem} />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          To Do ({pendingItems.length})
        </h2>
        <ul className="space-y-2">
          {pendingItems.map(item => (
            <TaskItem key={item.id} item={item} onToggleComplete={handleToggleComplete} />
          ))}
        </ul>
      </div>

      {completedItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Completed ({completedItems.length})
          </h2>
          <ul className="space-y-2">
            {completedItems.map(item => (
              <TaskItem key={item.id} item={item} onToggleComplete={handleToggleComplete} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
