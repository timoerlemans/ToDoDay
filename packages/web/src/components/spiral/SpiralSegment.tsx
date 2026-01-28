import { arcPath, calculateSegment, type SpiralConfig } from '@tododay/shared';
import type { ScheduledItem } from '@tododay/shared';

interface SpiralSegmentProps {
  scheduledItem: ScheduledItem;
  config: SpiralConfig;
  color: string;
  layer?: number;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

export function SpiralSegment({
  scheduledItem,
  config,
  color,
  layer = 0,
  onClick,
  onHover,
}: SpiralSegmentProps) {
  const segment = calculateSegment(
    scheduledItem.scheduledStart,
    scheduledItem.scheduledEnd,
    layer,
    config
  );

  const path = arcPath(
    segment.startAngle,
    segment.endAngle,
    segment.innerRadius,
    segment.outerRadius,
    config.center
  );

  return (
    <g
      className="cursor-pointer transition-opacity"
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      <path
        d={path}
        fill={color}
        stroke="white"
        strokeWidth={1}
        className="hover:opacity-80 transition-opacity"
      />
    </g>
  );
}
