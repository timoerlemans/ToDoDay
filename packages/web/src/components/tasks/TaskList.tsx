import { useEffect } from 'react';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { useDayStore, selectAllItemsSorted } from '@/stores/day';
import { useDay, useCreateItem, useCompleteItem, useDeleteItem } from '@/api/hooks';
import type { NautilusItem } from '@tododay/shared';

export function TaskList() {
  const { currentDate, setItems, setLoading, setError } = useDayStore();
  const items = useDayStore(selectAllItemsSorted);

  const { data: dayData, isLoading, error } = useDay(currentDate);
  const createItemMutation = useCreateItem(currentDate);
  const completeItemMutation = useCompleteItem();
  const deleteItemMutation = useDeleteItem();

  // Sync API data to store
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error instanceof Error ? error.message : 'Failed to load items');
    }
  }, [error, setError]);

  useEffect(() => {
    if (dayData?.data?.items) {
      const mappedItems = dayData.data.items.map((item) => ({
        id: item.id,
        type: item.type,
        text: item.text,
        sortOrder: item.sortOrder,
        completed: item.completed,
        completedAt: item.completedAt,
        startTime: item.startTime,
        endTime: item.endTime,
        duration: item.duration,
        priority: item.priority,
      }));
      setItems(mappedItems);
    }
  }, [dayData, setItems]);

  const handleToggleComplete = async (id: string) => {
    try {
      await completeItemMutation.mutateAsync({ itemId: id });
    } catch (err) {
      console.error('Failed to toggle complete:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItemMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleAddItem = async (text: string, type: 'task' | 'event') => {
    try {
      await createItemMutation.mutateAsync({ text, type });
    } catch (err) {
      console.error('Failed to create item:', err);
    }
  };

  // Convert store items to NautilusItem format for TaskItem
  const toNautilusItem = (item: typeof items[0]): NautilusItem => ({
    id: item.id,
    type: item.type,
    text: item.text,
    sortOrder: item.sortOrder,
    completed: item.completed,
    completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
    startTime: item.startTime ? new Date(item.startTime) : undefined,
    endTime: item.endTime ? new Date(item.endTime) : undefined,
    duration: item.duration,
    priority: item.priority,
  });

  const pendingItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TaskForm onAdd={handleAddItem} isLoading={createItemMutation.isPending} />
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaskForm onAdd={handleAddItem} isLoading={createItemMutation.isPending} />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          To Do ({pendingItems.length})
        </h2>
        {pendingItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No tasks yet. Add one above!
          </p>
        ) : (
          <ul className="space-y-2">
            {pendingItems.map(item => (
              <TaskItem
                key={item.id}
                item={toNautilusItem(item)}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </div>

      {completedItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Completed ({completedItems.length})
          </h2>
          <ul className="space-y-2">
            {completedItems.map(item => (
              <TaskItem
                key={item.id}
                item={toNautilusItem(item)}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
