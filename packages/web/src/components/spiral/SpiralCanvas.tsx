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
import { useDayStore } from '@/stores/day';
import { useSchedule, useSettings } from '@/api/hooks';

interface SpiralCanvasProps {
  onItemClick?: (item: NautilusItem) => void;
}

export function SpiralCanvas({ onItemClick }: SpiralCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { currentDate } = useDayStore();
  const { data: scheduleData, isLoading: scheduleLoading } = useSchedule(currentDate);
  const { data: settingsData } = useSettings();

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
    workdayStart: settingsData?.data?.workdayStart ?? 9,
    workdayEnd: settingsData?.data?.workdayEnd ?? 17,
    defaultDuration: settingsData?.data?.defaultDuration ?? 30,
    timestampFormat: settingsData?.data?.timestampFormat ?? '24h',
    colorScheme: settingsData?.data?.colorScheme ?? 'system',
  };

  const config = getDefaultConfig(dimensions.width, dimensions.height, settings);
  const hourMarkers = generateHourMarkers(config);

  // Convert API schedule data to ScheduledItem format
  const scheduledItems: ScheduledItem[] = scheduleData?.data?.scheduled?.map((item) => ({
    item: {
      id: item.item.id,
      type: item.item.type,
      text: item.item.text,
      sortOrder: 0,
      completed: item.item.completed,
      duration: item.item.duration,
      priority: item.item.priority,
      startTime: new Date(item.scheduledStart),
      endTime: new Date(item.scheduledEnd),
    },
    scheduledStart: new Date(item.scheduledStart),
    scheduledEnd: new Date(item.scheduledEnd),
    overflows: item.overflows,
  })) ?? [];

  const freeMinutes = scheduleData?.data?.freeMinutes ?? (settings.workdayEnd - settings.workdayStart) * 60;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center p-8 relative">
      {scheduleLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

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
            {formatHour(hour, settings.timestampFormat)}
          </text>
        ))}

        {/* Current time indicator */}
        <TimeIndicator currentTime={currentTime} config={config} />

        {/* Center text */}
        <text
          x={config.center.x}
          y={config.center.y - 20}
          textAnchor="middle"
          className="fill-foreground text-lg font-semibold pointer-events-none"
        >
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: settings.timestampFormat === '12h',
          })}
        </text>
        <text
          x={config.center.x}
          y={config.center.y + 5}
          textAnchor="middle"
          className="fill-muted-foreground text-sm pointer-events-none"
        >
          {formatDate(currentDate)}
        </text>
        <text
          x={config.center.x}
          y={config.center.y + 25}
          textAnchor="middle"
          className="fill-muted-foreground text-xs pointer-events-none"
        >
          {Math.floor(freeMinutes / 60)}h {freeMinutes % 60}m free
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
        {item.type === 'event' ? 'Event' : 'Task'} &middot; {item.duration}min
        {item.completed && ' \u2022 Completed'}
      </p>
    </div>
  );
}
