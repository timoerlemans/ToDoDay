import { cn } from '@/lib/utils';
import { formatDuration } from '@tododay/shared';
import type { NautilusItem } from '@tododay/shared';

interface TaskItemProps {
  item: NautilusItem;
  onToggleComplete: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TaskItem({ item, onToggleComplete, onDelete }: TaskItemProps) {
  const isEvent = item.type === 'event';
  const isUrgent = item.priority === 'urgent';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <li
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-colors group',
        item.completed
          ? 'bg-muted/50 border-border'
          : isUrgent
            ? 'bg-destructive/5 border-destructive/20'
            : 'bg-card border-border hover:bg-muted/50'
      )}
    >
      <button
        onClick={() => onToggleComplete(item.id)}
        className={cn(
          'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
          item.completed
            ? 'bg-muted-foreground border-muted-foreground'
            : isEvent
              ? 'border-[#F5A623] hover:bg-[#F5A623]/10'
              : isUrgent
                ? 'border-destructive hover:bg-destructive/10'
                : 'border-[#4A90D9] hover:bg-[#4A90D9]/10'
        )}
      >
        {item.completed && (
          <svg
            className="w-3 h-3 text-background"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            item.completed && 'line-through text-muted-foreground'
          )}
        >
          {item.text}
        </p>

        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {isEvent && item.startTime && item.endTime && (
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </span>
          )}

          {!isEvent && (
            <span className="flex items-center gap-1">
              <TimerIcon className="w-3 h-3" />
              {formatDuration(item.duration)}
            </span>
          )}

          {isUrgent && !item.completed && (
            <span className="px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-xs font-medium">
              Urgent
            </span>
          )}

          {isEvent && (
            <span className="px-1.5 py-0.5 bg-[#F5A623]/10 text-[#F5A623] rounded text-xs font-medium">
              Event
            </span>
          )}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive"
          title="Delete item"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </li>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function TimerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
