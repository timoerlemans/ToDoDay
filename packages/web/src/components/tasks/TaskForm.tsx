import { useState } from 'react';

interface TaskFormProps {
  onAdd: (text: string, type: 'task' | 'event') => void;
  isLoading?: boolean;
}

export function TaskForm({ onAdd, isLoading }: TaskFormProps) {
  const [text, setText] = useState('');
  const [type, setType] = useState<'task' | 'event'>('task');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onAdd(text.trim(), type);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a task or event..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="type"
            value="task"
            checked={type === 'task'}
            onChange={() => setType('task')}
            disabled={isLoading}
            className="w-4 h-4 accent-[#4A90D9]"
          />
          <span className="text-[#4A90D9]">Task</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="type"
            value="event"
            checked={type === 'event'}
            onChange={() => setType('event')}
            disabled={isLoading}
            className="w-4 h-4 accent-[#F5A623]"
          />
          <span className="text-[#F5A623]">Event</span>
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: Add time notations like &quot;9am-10am&quot;, &quot;half 2&quot;, or durations like
        &quot;1h30m&quot;
      </p>
    </form>
  );
}
