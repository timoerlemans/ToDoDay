import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { useDayStore } from '@/stores/day';
import { useDay, useCreateItem, useCompleteItem, useDeleteItem } from '@/api/hooks';
import type { NautilusItem } from '@tododay/shared';

export function TaskList() {
  const currentDate = useDayStore((state) => state.currentDate);

  const { data: dayData, isLoading, error } = useDay(currentDate);
  const createItemMutation = useCreateItem(currentDate);
  const completeItemMutation = useCompleteItem();
  const deleteItemMutation = useDeleteItem();

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

  // Convert API item to NautilusItem format
  const toNautilusItem = (item: NonNullable<typeof dayData>['data']['items'][0]): NautilusItem => ({
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

  const items = dayData?.data?.items ?? [];
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

  if (error) {
    return (
      <div className="space-y-6">
        <TaskForm onAdd={handleAddItem} isLoading={createItemMutation.isPending} />
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          Failed to load items: {error instanceof Error ? error.message : 'Unknown error'}
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
