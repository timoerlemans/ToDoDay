import { describe, test, expect } from 'vitest';
import { parseDutchTime, parseTime, parseTimeRange, extractTime } from '../time-parser';

describe('parseDutchTime', () => {
  describe('X uur notation', () => {
    test.each([
      ['2 uur', { hours: 14, minutes: 0 }],
      ['3 uur', { hours: 15, minutes: 0 }],
      ['6 uur', { hours: 18, minutes: 0 }],
      ['7 uur', { hours: 7, minutes: 0 }],
      ['12 uur', { hours: 12, minutes: 0 }],
      ['14 uur', { hours: 14, minutes: 0 }],
    ])('parseDutchTime("%s") → %j', (input, expected) => {
      expect(parseDutchTime(input)).toEqual(expected);
    });
  });

  describe('half X notation', () => {
    test.each([
      ['half 1', { hours: 12, minutes: 30 }],
      ['half 2', { hours: 13, minutes: 30 }],
      ['half 3', { hours: 14, minutes: 30 }],
      ['half 7', { hours: 6, minutes: 30 }],
      ['half 8', { hours: 7, minutes: 30 }],
      ['half 12', { hours: 11, minutes: 30 }],
    ])('parseDutchTime("%s") → %j', (input, expected) => {
      expect(parseDutchTime(input)).toEqual(expected);
    });
  });

  describe('kwart over X notation', () => {
    test.each([
      ['kwart over 1', { hours: 13, minutes: 15 }],
      ['kwart over 3', { hours: 15, minutes: 15 }],
      ['kwart over 6', { hours: 18, minutes: 15 }],
      ['kwart over 7', { hours: 7, minutes: 15 }],
      ['kwart over 12', { hours: 12, minutes: 15 }],
    ])('parseDutchTime("%s") → %j', (input, expected) => {
      expect(parseDutchTime(input)).toEqual(expected);
    });
  });

  describe('kwart voor X notation', () => {
    test.each([
      ['kwart voor 1', { hours: 12, minutes: 45 }],
      ['kwart voor 3', { hours: 14, minutes: 45 }],
      ['kwart voor 4', { hours: 15, minutes: 45 }],
      ['kwart voor 7', { hours: 6, minutes: 45 }],
      ['kwart voor 8', { hours: 7, minutes: 45 }],
    ])('parseDutchTime("%s") → %j', (input, expected) => {
      expect(parseDutchTime(input)).toEqual(expected);
    });
  });

  describe('N over half X notation', () => {
    test.each([
      ['10 over half 11', { hours: 10, minutes: 40 }],
      ['5 over half 3', { hours: 14, minutes: 35 }],
      ['10 over half 1', { hours: 12, minutes: 40 }],
    ])('parseDutchTime("%s") → %j', (input, expected) => {
      expect(parseDutchTime(input)).toEqual(expected);
    });
  });

  describe('N voor half X notation', () => {
    test.each([
      ['5 voor half 2', { hours: 13, minutes: 25 }],
      ['10 voor half 3', { hours: 14, minutes: 20 }],
      ['5 voor half 1', { hours: 12, minutes: 25 }],
    ])('parseDutchTime("%s") → %j', (input, expected) => {
      expect(parseDutchTime(input)).toEqual(expected);
    });
  });

  describe('N over X notation', () => {
    test.each([
      ['10 over 3', { hours: 15, minutes: 10 }],
      ['20 over 4', { hours: 16, minutes: 20 }],
      ['5 over 7', { hours: 7, minutes: 5 }],
    ])('parseDutchTime("%s") → %j', (input, expected) => {
      expect(parseDutchTime(input)).toEqual(expected);
    });
  });

  describe('N voor X notation', () => {
    test.each([
      ['10 voor 4', { hours: 15, minutes: 50 }],
      ['5 voor 3', { hours: 14, minutes: 55 }],
      ['10 voor 8', { hours: 7, minutes: 50 }],
    ])('parseDutchTime("%s") → %j', (input, expected) => {
      expect(parseDutchTime(input)).toEqual(expected);
    });
  });

  test('returns null for non-Dutch time text', () => {
    expect(parseDutchTime('meeting at noon')).toBeNull();
    expect(parseDutchTime('call later')).toBeNull();
  });
});

describe('parseTime', () => {
  test('parses 24h format', () => {
    expect(parseTime('14:30')).toEqual({ hours: 14, minutes: 30 });
    expect(parseTime('09:00')).toEqual({ hours: 9, minutes: 0 });
    expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 });
  });

  test('parses 12h format', () => {
    expect(parseTime('2:30pm')).toEqual({ hours: 14, minutes: 30 });
    expect(parseTime('9am')).toEqual({ hours: 9, minutes: 0 });
    expect(parseTime('12:00pm')).toEqual({ hours: 12, minutes: 0 });
    expect(parseTime('12:00am')).toEqual({ hours: 0, minutes: 0 });
  });

  test('parses Dutch time notation', () => {
    expect(parseTime('half 1')).toEqual({ hours: 12, minutes: 30 });
    expect(parseTime('kwart over 3')).toEqual({ hours: 15, minutes: 15 });
  });

  test('returns null for no time', () => {
    expect(parseTime('meeting tomorrow')).toBeNull();
  });
});

describe('parseTimeRange', () => {
  test('parses 24h range', () => {
    expect(parseTimeRange('12:30-14:20')).toEqual({
      start: { hours: 12, minutes: 30 },
      end: { hours: 14, minutes: 20 },
    });
  });

  test('parses 12h range', () => {
    expect(parseTimeRange('9am to 1:45pm')).toEqual({
      start: { hours: 9, minutes: 0 },
      end: { hours: 13, minutes: 45 },
    });
    expect(parseTimeRange('9am-10am')).toEqual({
      start: { hours: 9, minutes: 0 },
      end: { hours: 10, minutes: 0 },
    });
  });

  test('returns null for no range', () => {
    expect(parseTimeRange('9am')).toBeNull();
    expect(parseTimeRange('meeting')).toBeNull();
  });
});

describe('extractTime', () => {
  test('extracts time and cleans text', () => {
    const result = extractTime('Meeting at 2pm with team');
    expect(result.time).toEqual({ hours: 14, minutes: 0 });
    expect(result.isFixed).toBe(true);
    expect(result.cleanedText).toBe('Meeting at  with team');
  });

  test('extracts time range', () => {
    const result = extractTime('Conference 9am-11am');
    expect(result.range).toEqual({
      start: { hours: 9, minutes: 0 },
      end: { hours: 11, minutes: 0 },
    });
    expect(result.isFixed).toBe(true);
  });

  test('extracts Dutch time notation', () => {
    const result = extractTime('Lunch half 1');
    expect(result.time).toEqual({ hours: 12, minutes: 30 });
    expect(result.isFixed).toBe(true);
    expect(result.cleanedText).toBe('Lunch');
  });

  test('returns isFixed false for no time', () => {
    const result = extractTime('Buy groceries');
    expect(result.time).toBeUndefined();
    expect(result.range).toBeUndefined();
    expect(result.isFixed).toBe(false);
    expect(result.cleanedText).toBe('Buy groceries');
  });
});
