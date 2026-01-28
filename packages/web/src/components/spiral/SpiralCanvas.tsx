import { useEffect, useRef, useState } from 'react';
import {
  getDefaultConfig,
  generateHourMarkers,
  formatHour,
  timeIndicatorPath,
  type SpiralConfig,
} from '@tododay/shared';

export function SpiralCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [currentTime, setCurrentTime] = useState(new Date());

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

        {/* Hour markers */}
        {hourMarkers.map(({ hour, point }) => (
          <text
            key={hour}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-xs"
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
          className="fill-foreground text-lg font-semibold"
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
          className="fill-muted-foreground text-sm"
        >
          Today
        </text>
      </svg>
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
    <path d={path} stroke="#E74C3C" strokeWidth={2} strokeLinecap="round" className="drop-shadow" />
  );
}
