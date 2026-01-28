/**
 * SpiralMath - Spiral geometry calculations
 *
 * Maps workday hours to spiral angles and calculates arc segments.
 * The spiral starts at the workday start and wraps inward as the day progresses.
 */

import type { UserSettings } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface ArcSegment {
  startAngle: number; // Radians
  endAngle: number; // Radians
  innerRadius: number;
  outerRadius: number;
}

/**
 * Configuration for spiral geometry
 */
export interface SpiralConfig {
  /** Center point of the spiral */
  center: Point;
  /** Maximum radius (outer edge) */
  maxRadius: number;
  /** Minimum radius (inner edge) */
  minRadius: number;
  /** Workday start hour */
  workdayStart: number;
  /** Workday end hour */
  workdayEnd: number;
  /** Thickness of each spiral ring */
  ringThickness: number;
  /** Gap between segments */
  segmentGap: number;
}

/**
 * Default spiral configuration
 */
export function getDefaultConfig(width: number, height: number, settings: UserSettings): SpiralConfig {
  const size = Math.min(width, height);
  const maxRadius = size * 0.45;
  const minRadius = size * 0.1;

  return {
    center: { x: width / 2, y: height / 2 },
    maxRadius,
    minRadius,
    workdayStart: settings.workdayStart,
    workdayEnd: settings.workdayEnd,
    ringThickness: (maxRadius - minRadius) * 0.15,
    segmentGap: 0.02, // radians
  };
}

/**
 * Convert time (Date or hour) to angle in radians
 * 12 o'clock (noon/workday middle) is at top (negative Y)
 * Time flows clockwise
 */
export function timeToAngle(time: Date | number, config: SpiralConfig): number {
  const hour = typeof time === 'number' ? time : time.getHours() + time.getMinutes() / 60;
  const workdayHours = config.workdayEnd - config.workdayStart;
  const elapsed = hour - config.workdayStart;
  const fraction = elapsed / workdayHours;

  // Map to 0 to 2π, starting from top (-π/2) going clockwise
  // Full workday = full circle
  return -Math.PI / 2 + fraction * 2 * Math.PI;
}

/**
 * Convert duration in minutes to angle span
 */
export function durationToAngle(minutes: number, config: SpiralConfig): number {
  const workdayMinutes = (config.workdayEnd - config.workdayStart) * 60;
  const fraction = minutes / workdayMinutes;
  return fraction * 2 * Math.PI;
}

/**
 * Convert angle back to time (hour as decimal)
 */
export function angleToTime(angle: number, config: SpiralConfig): number {
  // Normalize angle to 0-2π range starting from top
  let normalizedAngle = angle + Math.PI / 2;
  while (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
  while (normalizedAngle >= 2 * Math.PI) normalizedAngle -= 2 * Math.PI;

  const fraction = normalizedAngle / (2 * Math.PI);
  const workdayHours = config.workdayEnd - config.workdayStart;
  return config.workdayStart + fraction * workdayHours;
}

/**
 * Calculate radius at a given time
 * Earlier times = outer radius, later times = inner radius
 * This creates the "shrinking day" effect
 */
export function timeToRadius(time: Date | number, config: SpiralConfig): number {
  const hour = typeof time === 'number' ? time : time.getHours() + time.getMinutes() / 60;
  const workdayHours = config.workdayEnd - config.workdayStart;
  const elapsed = hour - config.workdayStart;
  const fraction = elapsed / workdayHours;

  // Linear interpolation from max to min radius
  return config.maxRadius - fraction * (config.maxRadius - config.minRadius);
}

/**
 * Calculate point on spiral at given angle and radius
 */
export function polarToCartesian(angle: number, radius: number, center: Point): Point {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
}

/**
 * Generate SVG arc path data for a segment
 */
export function arcPath(
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
  center: Point
): string {
  // Ensure we're drawing in the right direction
  const start = startAngle;
  const end = endAngle;
  const largeArc = Math.abs(end - start) > Math.PI ? 1 : 0;
  const sweepFlag = 1; // Clockwise

  // Outer arc points
  const outerStart = polarToCartesian(start, outerRadius, center);
  const outerEnd = polarToCartesian(end, outerRadius, center);

  // Inner arc points
  const innerStart = polarToCartesian(start, innerRadius, center);
  const innerEnd = polarToCartesian(end, innerRadius, center);

  // Build path: outer arc -> line to inner -> inner arc (reverse) -> line to start
  const path = [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} ${sweepFlag} ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} ${1 - sweepFlag} ${innerStart.x} ${innerStart.y}`,
    'Z',
  ];

  return path.join(' ');
}

/**
 * Generate SVG line path for current time indicator
 */
export function timeIndicatorPath(time: Date, config: SpiralConfig): string {
  const angle = timeToAngle(time, config);
  const innerPoint = polarToCartesian(angle, config.minRadius * 0.8, config.center);
  const outerPoint = polarToCartesian(angle, config.maxRadius * 1.05, config.center);

  return `M ${innerPoint.x} ${innerPoint.y} L ${outerPoint.x} ${outerPoint.y}`;
}

/**
 * Calculate segment geometry for a scheduled item
 */
export function calculateSegment(
  startTime: Date,
  endTime: Date,
  layer: number,
  config: SpiralConfig
): ArcSegment {
  const startAngle = timeToAngle(startTime, config);
  const endAngle = timeToAngle(endTime, config);

  // Calculate radius based on layer (for nested items)
  const baseOuterRadius = timeToRadius(startTime, config);
  const layerOffset = layer * config.ringThickness * 0.3;

  return {
    startAngle: startAngle + config.segmentGap / 2,
    endAngle: endAngle - config.segmentGap / 2,
    innerRadius: baseOuterRadius - config.ringThickness + layerOffset,
    outerRadius: baseOuterRadius - layerOffset,
  };
}

/**
 * Generate hour markers for the spiral
 */
export function generateHourMarkers(
  config: SpiralConfig
): Array<{ hour: number; angle: number; point: Point }> {
  const markers = [];

  for (let hour = config.workdayStart; hour <= config.workdayEnd; hour++) {
    const angle = timeToAngle(hour, config);
    const point = polarToCartesian(angle, config.maxRadius * 1.1, config.center);
    markers.push({ hour, angle, point });
  }

  return markers;
}

/**
 * Format hour for display
 */
export function formatHour(hour: number, format: '12h' | '24h' = '24h'): string {
  if (format === '24h') {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  const h = hour % 12 || 12;
  const period = hour >= 12 ? 'pm' : 'am';
  return `${h}${period}`;
}
