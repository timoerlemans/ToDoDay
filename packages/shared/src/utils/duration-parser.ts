/**
 * DurationParser - Parse duration notations from task/event text
 *
 * Supported formats:
 * - Minutes: 10m, 45min, 30mins, 15 minutes
 * - Hours: 2h, 1hr, 2hrs, 1 hour, 2 hours
 * - Combined: 1h30m, 1h 30m
 */

export interface DurationParseResult {
  /** Duration in minutes */
  duration: number;
  /** The matched text that was parsed */
  matchedText: string;
  /** Text with duration notation removed */
  cleanedText: string;
}

// Regex patterns for duration parsing
const DURATION_COMBINED = /(\d+)\s*h(?:r|rs|our|ours)?\s*(\d+)\s*m(?:in|ins|inute|inutes)?/i;
const DURATION_HOURS = /(\d+(?:\.\d+)?)\s*h(?:r|rs|our|ours)?(?!\s*\d)/i;
const DURATION_MINUTES = /(\d+)\s*m(?:in|ins|inute|inutes)?/i;

/**
 * Parse duration from text and return minutes
 */
export function parseDuration(text: string): number | null {
  // Try combined format first (e.g., "1h30m")
  const matchCombined = text.match(DURATION_COMBINED);
  if (matchCombined) {
    const hours = parseInt(matchCombined[1], 10);
    const minutes = parseInt(matchCombined[2], 10);
    return hours * 60 + minutes;
  }

  // Try hours only (e.g., "2h", "1.5h")
  const matchHours = text.match(DURATION_HOURS);
  if (matchHours) {
    const hours = parseFloat(matchHours[1]);
    return Math.round(hours * 60);
  }

  // Try minutes only (e.g., "45m", "30min")
  const matchMinutes = text.match(DURATION_MINUTES);
  if (matchMinutes) {
    return parseInt(matchMinutes[1], 10);
  }

  return null;
}

/**
 * Extract and parse duration from text
 * Returns the parsed result and text with duration notation removed
 */
export function extractDuration(text: string, defaultDuration: number = 15): DurationParseResult {
  // Try combined format first
  const matchCombined = text.match(DURATION_COMBINED);
  if (matchCombined) {
    const hours = parseInt(matchCombined[1], 10);
    const minutes = parseInt(matchCombined[2], 10);
    const cleanedText = text.replace(DURATION_COMBINED, '').trim();

    return {
      duration: hours * 60 + minutes,
      matchedText: matchCombined[0],
      cleanedText,
    };
  }

  // Try hours only
  const matchHours = text.match(DURATION_HOURS);
  if (matchHours) {
    const hours = parseFloat(matchHours[1]);
    const cleanedText = text.replace(DURATION_HOURS, '').trim();

    return {
      duration: Math.round(hours * 60),
      matchedText: matchHours[0],
      cleanedText,
    };
  }

  // Try minutes only
  const matchMinutes = text.match(DURATION_MINUTES);
  if (matchMinutes) {
    const cleanedText = text.replace(DURATION_MINUTES, '').trim();

    return {
      duration: parseInt(matchMinutes[1], 10),
      matchedText: matchMinutes[0],
      cleanedText,
    };
  }

  // No duration found, use default
  return {
    duration: defaultDuration,
    matchedText: '',
    cleanedText: text,
  };
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${remainingMinutes}m`;
}
