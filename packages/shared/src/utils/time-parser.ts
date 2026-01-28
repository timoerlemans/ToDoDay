/**
 * TimeParser - Parse time notations from task/event text
 *
 * Supported formats:
 * - 24h range: HH:MM-HH:MM (e.g., "12:30-14:20")
 * - 12h range: 9am to 1:45pm, 9am-10am
 * - Single time: 14:30, 2:30pm, 9am
 * - Minutes optional in 12h: 9am, 2pm
 * - Dutch time notation:
 *   - "2 uur" = 14:00 (2 o'clock, assumes afternoon for 1-12)
 *   - "half 1" = 12:30 (half past 12, so half hour before 1)
 *   - "kwart over 3" = 15:15 (quarter past 3)
 *   - "kwart voor 4" = 15:45 (quarter to 4)
 *   - "10 over half 11" = 10:40 (10 minutes past half 11, which is 10:30)
 *   - "5 voor half 2" = 13:25 (5 minutes before half 2, which is 13:30)
 */

export interface ParsedTime {
  hours: number; // 0-23
  minutes: number; // 0-59
}

export interface TimeRange {
  start: ParsedTime;
  end: ParsedTime;
}

export interface TimeParseResult {
  /** The parsed time or range */
  time?: ParsedTime;
  range?: TimeRange;
  /** Whether this represents a fixed event (has specific time) */
  isFixed: boolean;
  /** The matched text that was parsed */
  matchedText: string;
  /** Text with time notation removed */
  cleanedText: string;
}

// Regex patterns for time parsing
const TIME_24H = /(\d{1,2}):(\d{2})/;
const TIME_12H = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
const RANGE_24H = /(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})/;
const RANGE_12H =
  /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:to|[-–—])\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
const RANGE_MIXED = /(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;

// Dutch time notation patterns
// "X uur" = X:00 (e.g., "2 uur" = 14:00, "14 uur" = 14:00)
const DUTCH_UUR = /\b(\d{1,2})\s+uur\b/i;
// "half X" = X-1:30 (e.g., "half 1" = 12:30)
const DUTCH_HALF = /\bhalf\s+(\d{1,2})\b/i;
// "kwart over X" = X:15
const DUTCH_KWART_OVER = /\bkwart\s+over\s+(\d{1,2})\b/i;
// "kwart voor X" = X-1:45
const DUTCH_KWART_VOOR = /\bkwart\s+voor\s+(\d{1,2})\b/i;
// "N over half X" = X-1:30+N (e.g., "10 over half 11" = 10:40)
const DUTCH_OVER_HALF = /\b(\d{1,2})\s+over\s+half\s+(\d{1,2})\b/i;
// "N voor half X" = X-1:30-N (e.g., "5 voor half 2" = 13:25)
const DUTCH_VOOR_HALF = /\b(\d{1,2})\s+voor\s+half\s+(\d{1,2})\b/i;
// "N over X" = X:N (e.g., "10 over 3" = 3:10)
const DUTCH_OVER = /\b(\d{1,2})\s+over\s+(\d{1,2})\b/i;
// "N voor X" = X-1:60-N (e.g., "10 voor 4" = 3:50)
const DUTCH_VOOR = /\b(\d{1,2})\s+voor\s+(\d{1,2})\b/i;

/**
 * Convert 12h time to 24h format
 */
function to24Hour(hours: number, minutes: number, period: string): ParsedTime {
  let h = hours;
  const p = period.toLowerCase();

  if (p === 'pm' && h !== 12) {
    h += 12;
  } else if (p === 'am' && h === 12) {
    h = 0;
  }

  return { hours: h, minutes };
}

/**
 * Normalize hour to 0-23 range
 */
function normalizeHour(hour: number): number {
  return ((hour % 24) + 24) % 24;
}

/**
 * Convert Dutch hour (1-12) to 24h format
 * Assumes afternoon/evening for hours 1-6, morning for 7-12
 * For explicit 24h (13-23), returns as-is
 */
function dutchHourTo24(hour: number): number {
  if (hour >= 13) return hour; // Already 24h format
  if (hour >= 7 && hour <= 12) return hour; // Morning hours 7-12 stay as-is
  return hour + 12; // 1-6 become 13-18 (afternoon)
}

/**
 * Parse Dutch time notation
 * In Dutch, "half 1" means half past 12 (30 minutes before 1)
 */
export function parseDutchTime(text: string): ParsedTime | null {
  // "X uur" - e.g., "2 uur" = 14:00, "14 uur" = 14:00
  const matchUur = text.match(DUTCH_UUR);
  if (matchUur) {
    const hour = parseInt(matchUur[1], 10);
    return { hours: dutchHourTo24(hour), minutes: 0 };
  }

  // "N over half X" - e.g., "10 over half 11" = 10:40
  const matchOverHalf = text.match(DUTCH_OVER_HALF);
  if (matchOverHalf) {
    const minutes = parseInt(matchOverHalf[1], 10);
    const referenceHour = parseInt(matchOverHalf[2], 10);
    // "half X" = X-1:30, so "N over half X" = X-1:30+N
    const hours = normalizeHour(referenceHour - 1);
    return { hours, minutes: 30 + minutes };
  }

  // "N voor half X" - e.g., "5 voor half 2" = 13:25
  const matchVoorHalf = text.match(DUTCH_VOOR_HALF);
  if (matchVoorHalf) {
    const minutes = parseInt(matchVoorHalf[1], 10);
    const referenceHour = parseInt(matchVoorHalf[2], 10);
    // "half X" = X-1:30, so "N voor half X" = X-1:30-N
    const hours = normalizeHour(referenceHour - 1);
    return { hours, minutes: 30 - minutes };
  }

  // "kwart over X" - e.g., "kwart over 3" = 3:15
  const matchKwartOver = text.match(DUTCH_KWART_OVER);
  if (matchKwartOver) {
    const hours = parseInt(matchKwartOver[1], 10);
    return { hours: normalizeHour(hours), minutes: 15 };
  }

  // "kwart voor X" - e.g., "kwart voor 4" = 3:45
  const matchKwartVoor = text.match(DUTCH_KWART_VOOR);
  if (matchKwartVoor) {
    const referenceHour = parseInt(matchKwartVoor[1], 10);
    return { hours: normalizeHour(referenceHour - 1), minutes: 45 };
  }

  // "half X" - e.g., "half 1" = 12:30
  const matchHalf = text.match(DUTCH_HALF);
  if (matchHalf) {
    const referenceHour = parseInt(matchHalf[1], 10);
    // "half X" means 30 minutes before X o'clock
    return { hours: normalizeHour(referenceHour - 1), minutes: 30 };
  }

  // "N over X" - e.g., "10 over 3" = 3:10
  const matchOver = text.match(DUTCH_OVER);
  if (matchOver) {
    const minutes = parseInt(matchOver[1], 10);
    const hours = parseInt(matchOver[2], 10);
    return { hours: normalizeHour(hours), minutes };
  }

  // "N voor X" - e.g., "10 voor 4" = 3:50
  const matchVoor = text.match(DUTCH_VOOR);
  if (matchVoor) {
    const minutes = parseInt(matchVoor[1], 10);
    const referenceHour = parseInt(matchVoor[2], 10);
    return { hours: normalizeHour(referenceHour - 1), minutes: 60 - minutes };
  }

  return null;
}

/**
 * Get the regex pattern that matched Dutch time (for text cleaning)
 */
function getDutchTimePattern(text: string): RegExp | null {
  if (DUTCH_UUR.test(text)) return DUTCH_UUR;
  if (DUTCH_OVER_HALF.test(text)) return DUTCH_OVER_HALF;
  if (DUTCH_VOOR_HALF.test(text)) return DUTCH_VOOR_HALF;
  if (DUTCH_KWART_OVER.test(text)) return DUTCH_KWART_OVER;
  if (DUTCH_KWART_VOOR.test(text)) return DUTCH_KWART_VOOR;
  if (DUTCH_HALF.test(text)) return DUTCH_HALF;
  if (DUTCH_OVER.test(text)) return DUTCH_OVER;
  if (DUTCH_VOOR.test(text)) return DUTCH_VOOR;
  return null;
}

/**
 * Parse a single time from text
 */
export function parseTime(text: string): ParsedTime | null {
  // Try Dutch time notation first (most specific)
  const dutchTime = parseDutchTime(text);
  if (dutchTime) {
    return dutchTime;
  }

  // Try 12h format (more specific than 24h)
  const match12 = text.match(TIME_12H);
  if (match12) {
    const hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const period = match12[3];
    return to24Hour(hours, minutes, period);
  }

  // Try 24h format
  const match24 = text.match(TIME_24H);
  if (match24) {
    return {
      hours: parseInt(match24[1], 10),
      minutes: parseInt(match24[2], 10),
    };
  }

  return null;
}

/**
 * Parse a time range from text
 */
export function parseTimeRange(text: string): TimeRange | null {
  // Try 12h range (e.g., "9am to 1:45pm" or "9am-10am")
  const match12 = text.match(RANGE_12H);
  if (match12) {
    const startHours = parseInt(match12[1], 10);
    const startMinutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const startPeriod = match12[3];
    const endHours = parseInt(match12[4], 10);
    const endMinutes = match12[5] ? parseInt(match12[5], 10) : 0;
    const endPeriod = match12[6];

    return {
      start: to24Hour(startHours, startMinutes, startPeriod),
      end: to24Hour(endHours, endMinutes, endPeriod),
    };
  }

  // Try mixed format (e.g., "14:00-3pm")
  const matchMixed = text.match(RANGE_MIXED);
  if (matchMixed) {
    const startHours = parseInt(matchMixed[1], 10);
    const startMinutes = parseInt(matchMixed[2], 10);
    const endHours = parseInt(matchMixed[3], 10);
    const endMinutes = matchMixed[4] ? parseInt(matchMixed[4], 10) : 0;
    const endPeriod = matchMixed[5];

    return {
      start: { hours: startHours, minutes: startMinutes },
      end: to24Hour(endHours, endMinutes, endPeriod),
    };
  }

  // Try 24h range (e.g., "12:30-14:20")
  const match24 = text.match(RANGE_24H);
  if (match24) {
    return {
      start: {
        hours: parseInt(match24[1], 10),
        minutes: parseInt(match24[2], 10),
      },
      end: {
        hours: parseInt(match24[3], 10),
        minutes: parseInt(match24[4], 10),
      },
    };
  }

  return null;
}

/**
 * Extract and parse time information from text
 * Returns the parsed result and text with time notation removed
 */
export function extractTime(text: string): TimeParseResult {
  const originalText = text;

  // Try to parse as range first
  const range = parseTimeRange(text);
  if (range) {
    // Remove the matched range from text
    const cleanedText = text
      .replace(RANGE_12H, '')
      .replace(RANGE_MIXED, '')
      .replace(RANGE_24H, '')
      .trim();

    const matchedText = originalText.replace(cleanedText, '').trim();

    return {
      range,
      isFixed: true,
      matchedText,
      cleanedText,
    };
  }

  // Try single time (including Dutch notation)
  const time = parseTime(text);
  if (time) {
    // Remove the matched time from text
    const dutchPattern = getDutchTimePattern(text);
    let cleanedText = text;

    if (dutchPattern) {
      cleanedText = text.replace(dutchPattern, '').trim();
    } else {
      cleanedText = text.replace(TIME_12H, '').replace(TIME_24H, '').trim();
    }

    const matchedText = originalText.replace(cleanedText, '').trim();

    return {
      time,
      isFixed: true,
      matchedText,
      cleanedText,
    };
  }

  // No time found
  return {
    isFixed: false,
    matchedText: '',
    cleanedText: text,
  };
}

/**
 * Convert ParsedTime to a Date object for a specific day
 */
export function timeToDate(time: ParsedTime, baseDate?: Date): Date {
  const date = baseDate ? new Date(baseDate) : new Date();
  date.setHours(time.hours, time.minutes, 0, 0);
  return date;
}

/**
 * Calculate duration in minutes between two times
 */
export function calculateDuration(start: ParsedTime, end: ParsedTime): number {
  const startMinutes = start.hours * 60 + start.minutes;
  let endMinutes = end.hours * 60 + end.minutes;

  // Handle overnight events
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return endMinutes - startMinutes;
}

/**
 * Format a time to a display string
 */
export function formatTime(time: ParsedTime, format: '12h' | '24h' = '24h'): string {
  if (format === '24h') {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  }

  const hours = time.hours % 12 || 12;
  const period = time.hours >= 12 ? 'pm' : 'am';
  const minutes = time.minutes === 0 ? '' : `:${time.minutes.toString().padStart(2, '0')}`;
  return `${hours}${minutes}${period}`;
}
