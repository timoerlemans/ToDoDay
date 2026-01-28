import { SpiralCanvas } from '@/components/spiral/SpiralCanvas';
import { TaskList } from '@/components/tasks/TaskList';

export function HomePage() {
  return (
    <div className="flex h-full gap-6">
      {/* Spiral visualization */}
      <div className="flex-1 flex items-center justify-center">
        <SpiralCanvas />
      </div>

      {/* Task list sidebar */}
      <aside className="w-80 border-l border-border p-4 overflow-y-auto">
        <TaskList />
      </aside>
    </div>
  );
}
