import { useEffect, useRef, useState } from 'react';
import {
  getDefaultConfig,
  generateHourMarkers,
  formatHour,
  timeIndicatorPath,
  getItemColor,
  type SpiralConfig,
  type ScheduledItem,
  type NautilusItem,
} from '@tododay/shared';
import { SpiralSegment } from './SpiralSegment';

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
    completedAt: new Date(new Date().setHours(9, 30, 0, 0)),
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

// Simple scheduler for demo purposes
function scheduleItems(items: NautilusItem[], currentTime: Date): ScheduledItem[] {
  const scheduled: ScheduledItem[] = [];
  let nextStart = new Date(currentTime);

  // Set to start of workday if before
  if (nextStart.getHours() < 9) {
    nextStart.setHours(9, 0, 0, 0);
  }

  for (const item of items) {
    // Events with fixed times
    if (item.type === 'event' && item.startTime && item.endTime) {
      scheduled.push({
        item,
        scheduledStart: item.startTime,
        scheduledEnd: item.endTime,
        overflows: false,
      });
      continue;
    }

    // Completed tasks with completion time
    if (item.completed && item.completedAt) {
      const endTime = new Date(item.completedAt.getTime() + item.duration * 60 * 1000);
      scheduled.push({
        item,
        scheduledStart: item.completedAt,
        scheduledEnd: endTime,
        overflows: false,
      });
      continue;
    }

    // Pending tasks - schedule from next available time
    if (!item.completed) {
      // Skip past events
      for (const s of scheduled) {
        if (s.item.type === 'event' && s.scheduledEnd > nextStart && s.scheduledStart < nextStart) {
          nextStart = new Date(s.scheduledEnd);
        }
      }

      const endTime = new Date(nextStart.getTime() + item.duration * 60 * 1000);
      scheduled.push({
        item,
        scheduledStart: new Date(nextStart),
        scheduledEnd: endTime,
        overflows: endTime.getHours() >= 17,
      });
      nextStart = endTime;
    }
  }

  return scheduled;
}

interface SpiralCanvasProps {
  items?: NautilusItem[];
  onItemClick?: (item: NautilusItem) => void;
}

export function SpiralCanvas({ items = SAMPLE_ITEMS, onItemClick }: SpiralCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height, 600);
        setDimensions({ width: size, height: size });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const settings = {
    workdayStart: 9,
    workdayEnd: 17,
    defaultDuration: 30,
    timestampFormat: '24h' as const,
    colorScheme: 'system' as const,
  };

  const config = getDefaultConfig(dimensions.width, dimensions.height, settings);
  const hourMarkers = generateHourMarkers(config);
  const scheduledItems = scheduleItems(items, currentTime);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center p-8">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="max-w-full max-h-full"
      >
        {/* Background circle */}
        <circle
          cx={config.center.x}
          cy={config.center.y}
          r={config.maxRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="text-border"
        />

        {/* Inner circle */}
        <circle
          cx={config.center.x}
          cy={config.center.y}
          r={config.minRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="text-border"
        />

        {/* Spiral segments */}
        {scheduledItems.map(scheduledItem => (
          <SpiralSegment
            key={scheduledItem.item.id}
            scheduledItem={scheduledItem}
            config={config}
            color={getItemColor(
              scheduledItem.item.type,
              scheduledItem.item.completed,
              scheduledItem.item.priority,
              false
            )}
            onClick={() => onItemClick?.(scheduledItem.item)}
            onHover={hovered => setHoveredItem(hovered ? scheduledItem.item.id : null)}
          />
        ))}

        {/* Hour markers */}
        {hourMarkers.map(({ hour, point }) => (
          <text
            key={hour}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-xs pointer-events-none"
          >
            {formatHour(hour, '24h')}
          </text>
        ))}

        {/* Current time indicator */}
        <TimeIndicator currentTime={currentTime} config={config} />

        {/* Center text */}
        <text
          x={config.center.x}
          y={config.center.y - 10}
          textAnchor="middle"
          className="fill-foreground text-lg font-semibold pointer-events-none"
        >
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </text>
        <text
          x={config.center.x}
          y={config.center.y + 15}
          textAnchor="middle"
          className="fill-muted-foreground text-sm pointer-events-none"
        >
          Today
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredItem && (
        <ItemTooltip
          item={scheduledItems.find(s => s.item.id === hoveredItem)?.item}
        />
      )}
    </div>
  );
}

function TimeIndicator({ currentTime, config }: { currentTime: Date; config: SpiralConfig }) {
  const hour = currentTime.getHours() + currentTime.getMinutes() / 60;

  // Only show if within workday
  if (hour < config.workdayStart || hour > config.workdayEnd) {
    return null;
  }

  const path = timeIndicatorPath(currentTime, config);

  return (
    <path
      d={path}
      stroke="#E74C3C"
      strokeWidth={2}
      strokeLinecap="round"
      className="drop-shadow pointer-events-none"
    />
  );
}

function ItemTooltip({ item }: { item?: NautilusItem }) {
  if (!item) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg px-4 py-2 text-sm">
      <p className="font-medium">{item.text}</p>
      <p className="text-muted-foreground text-xs">
        {item.type === 'event' ? 'Event' : 'Task'} • {item.duration}min
        {item.completed && ' • Completed'}
      </p>
    </div>
  );
}
