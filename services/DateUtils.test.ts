import { DateUtils } from './DateUtils';

describe('DateUtils', () => {
  describe('getTodayISO', () => {
    it('should return today date in YYYY-MM-DD format', () => {
      const today = DateUtils.getTodayISO();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify it matches actual today
      const now = new Date();
      const expected = DateUtils.getDateISO(now);
      expect(today).toBe(expected);
    });
  });

  describe('getDateISO', () => {
    it('should convert Date to ISO string in local timezone', () => {
      const date = new Date(2025, 0, 21); // Jan 21, 2025 (month is 0-indexed)
      const iso = DateUtils.getDateISO(date);
      expect(iso).toBe('2025-01-21');
    });

    it('should pad single-digit months and days', () => {
      const date = new Date(2025, 0, 5); // Jan 5, 2025
      const iso = DateUtils.getDateISO(date);
      expect(iso).toBe('2025-01-05');
    });
  });

  describe('parseISO', () => {
    it('should parse ISO string to Date at midnight', () => {
      const date = DateUtils.parseISO('2025-01-21');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getDate()).toBe(21);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });

    it('should handle dates with leading zeros', () => {
      const date = DateUtils.parseISO('2025-01-05');
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(5);
    });
  });

  describe('isWithinTimeWindow', () => {
    it('should return true when time is within window', () => {
      const date = new Date(2025, 0, 21, 8, 30); // 8:30 AM
      const result = DateUtils.isWithinTimeWindow(date, '07:00', '10:00');
      expect(result).toBe(true);
    });

    it('should return false when time is before window', () => {
      const date = new Date(2025, 0, 21, 6, 30); // 6:30 AM
      const result = DateUtils.isWithinTimeWindow(date, '07:00', '10:00');
      expect(result).toBe(false);
    });

    it('should return false when time is after window', () => {
      const date = new Date(2025, 0, 21, 10, 30); // 10:30 AM
      const result = DateUtils.isWithinTimeWindow(date, '07:00', '10:00');
      expect(result).toBe(false);
    });

    it('should return true when time equals start time', () => {
      const date = new Date(2025, 0, 21, 7, 0); // 7:00 AM
      const result = DateUtils.isWithinTimeWindow(date, '07:00', '10:00');
      expect(result).toBe(true);
    });

    it('should return true when time equals end time', () => {
      const date = new Date(2025, 0, 21, 10, 0); // 10:00 AM
      const result = DateUtils.isWithinTimeWindow(date, '07:00', '10:00');
      expect(result).toBe(true);
    });
  });

  describe('getDayOfWeek', () => {
    it('should return 0 for Sunday', () => {
      const date = new Date(2025, 0, 19); // Jan 19, 2025 is Sunday
      expect(DateUtils.getDayOfWeek(date)).toBe(0);
    });

    it('should return 1 for Monday', () => {
      const date = new Date(2025, 0, 20); // Jan 20, 2025 is Monday
      expect(DateUtils.getDayOfWeek(date)).toBe(1);
    });

    it('should return 6 for Saturday', () => {
      const date = new Date(2025, 0, 25); // Jan 25, 2025 is Saturday
      expect(DateUtils.getDayOfWeek(date)).toBe(6);
    });
  });

  describe('isConsecutiveDay', () => {
    it('should return true for consecutive days', () => {
      const result = DateUtils.isConsecutiveDay('2025-01-20', '2025-01-21');
      expect(result).toBe(true);
    });

    it('should return false for non-consecutive days', () => {
      const result = DateUtils.isConsecutiveDay('2025-01-20', '2025-01-22');
      expect(result).toBe(false);
    });

    it('should return false for same day', () => {
      const result = DateUtils.isConsecutiveDay('2025-01-21', '2025-01-21');
      expect(result).toBe(false);
    });

    it('should return false when date2 is before date1', () => {
      const result = DateUtils.isConsecutiveDay('2025-01-21', '2025-01-20');
      expect(result).toBe(false);
    });
  });

  describe('calculateStreak', () => {
    it('should return 0 for empty array', () => {
      const streak = DateUtils.calculateStreak([]);
      expect(streak).toBe(0);
    });

    it('should return 1 for today only', () => {
      const today = DateUtils.getTodayISO();
      const streak = DateUtils.calculateStreak([today]);
      expect(streak).toBe(1);
    });

    it('should calculate streak for consecutive days including today', () => {
      const today = DateUtils.getTodayISO();
      const yesterday = DateUtils.getDateDaysAgo(1);
      const twoDaysAgo = DateUtils.getDateDaysAgo(2);

      const streak = DateUtils.calculateStreak([today, yesterday, twoDaysAgo]);
      expect(streak).toBe(3);
    });

    it('should stop counting at first gap', () => {
      const today = DateUtils.getTodayISO();
      const yesterday = DateUtils.getDateDaysAgo(1);
      const fourDaysAgo = DateUtils.getDateDaysAgo(4);

      const streak = DateUtils.calculateStreak([today, yesterday, fourDaysAgo]);
      expect(streak).toBe(2); // Stops at gap
    });

    it('should return 0 if today is not included', () => {
      const yesterday = DateUtils.getDateDaysAgo(1);
      const twoDaysAgo = DateUtils.getDateDaysAgo(2);

      const streak = DateUtils.calculateStreak([yesterday, twoDaysAgo]);
      expect(streak).toBe(0); // Streak broken
    });

    it('should handle single old date (not today)', () => {
      const tenDaysAgo = DateUtils.getDateDaysAgo(10);
      const streak = DateUtils.calculateStreak([tenDaysAgo]);
      expect(streak).toBe(0);
    });
  });

  describe('getDaysBetween', () => {
    it('should return 0 for same day', () => {
      const date = new Date(2025, 0, 21);
      const days = DateUtils.getDaysBetween(date, date);
      expect(days).toBe(0);
    });

    it('should return 1 for consecutive days', () => {
      const date1 = new Date(2025, 0, 20);
      const date2 = new Date(2025, 0, 21);
      const days = DateUtils.getDaysBetween(date1, date2);
      expect(days).toBe(1);
    });

    it('should return positive number regardless of order', () => {
      const date1 = new Date(2025, 0, 25);
      const date2 = new Date(2025, 0, 20);
      const days = DateUtils.getDaysBetween(date1, date2);
      expect(days).toBe(5);
    });
  });

  describe('formatDate', () => {
    it('should format date in readable format', () => {
      const date = new Date(2025, 0, 21);
      const formatted = DateUtils.formatDate(date);
      expect(formatted).toMatch(/Jan 21, 2025/);
    });
  });

  describe('formatTime', () => {
    it('should format time in 12-hour format', () => {
      const date = new Date(2025, 0, 21, 8, 30);
      const formatted = DateUtils.formatTime(date);
      expect(formatted).toMatch(/8:30 AM/);
    });

    it('should format PM time correctly', () => {
      const date = new Date(2025, 0, 21, 14, 45);
      const formatted = DateUtils.formatTime(date);
      expect(formatted).toMatch(/2:45 PM/);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      const result = DateUtils.formatDuration(5000); // 5 seconds
      expect(result).toBe('5s');
    });

    it('should format minutes and seconds', () => {
      const result = DateUtils.formatDuration(90000); // 90 seconds = 1m 30s
      expect(result).toBe('1m 30s');
    });

    it('should format hours and minutes', () => {
      const result = DateUtils.formatDuration(5400000); // 90 minutes = 1h 30m
      expect(result).toBe('1h 30m');
    });

    it('should handle zero duration', () => {
      const result = DateUtils.formatDuration(0);
      expect(result).toBe('0s');
    });
  });

  describe('getStartOfDayTimestamp', () => {
    it('should return timestamp at midnight', () => {
      const date = new Date(2025, 0, 21, 14, 30);
      const timestamp = DateUtils.getStartOfDayTimestamp(date);
      const result = new Date(timestamp);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfDayTimestamp', () => {
    it('should return timestamp at end of day', () => {
      const date = new Date(2025, 0, 21, 8, 30);
      const timestamp = DateUtils.getEndOfDayTimestamp(date);
      const result = new Date(timestamp);

      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('isToday', () => {
    it('should return true for current timestamp', () => {
      const now = Date.now();
      expect(DateUtils.isToday(now)).toBe(true);
    });

    it('should return false for yesterday timestamp', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(DateUtils.isToday(yesterday.getTime())).toBe(false);
    });
  });

  describe('getDateDaysAgo', () => {
    it('should return today for 0 days ago', () => {
      const result = DateUtils.getDateDaysAgo(0);
      const expected = DateUtils.getTodayISO();
      expect(result).toBe(expected);
    });

    it('should return yesterday for 1 day ago', () => {
      const result = DateUtils.getDateDaysAgo(1);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const expected = DateUtils.getDateISO(yesterday);
      expect(result).toBe(expected);
    });

    it('should handle multiple days ago', () => {
      const result = DateUtils.getDateDaysAgo(7);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
