import { memo } from 'react';
import { arcPath, calculateSegment, type SpiralConfig } from '@tododay/shared';
import type { ScheduledItem } from '@tododay/shared';

interface SpiralSegmentProps {
  scheduledItem: ScheduledItem;
  config: SpiralConfig;
  color: string;
  layer?: number;
  onClick?: () => void;
  onHover?: (itemId: string, hovered: boolean) => void;
}

export const SpiralSegment = memo(function SpiralSegment({
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
      onMouseEnter={() => onHover?.(scheduledItem.item.id, true)}
      onMouseLeave={() => onHover?.(scheduledItem.item.id, false)}
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
});
