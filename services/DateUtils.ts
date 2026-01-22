/**
 * DateUtils - Centralized date/time utilities for timezone-safe operations
 *
 * All date comparisons use ISO date strings ("YYYY-MM-DD") to avoid timezone issues.
 * All time comparisons use 24-hour format strings ("HH:MM").
 */

export class DateUtils {
  /**
   * Get today's date as ISO string (YYYY-MM-DD)
   * Uses local timezone
   */
  static getTodayISO(): string {
    const now = new Date();
    return this.getDateISO(now);
  }

  /**
   * Convert Date object to ISO date string (YYYY-MM-DD)
   * Uses local timezone, not UTC
   */
  static getDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse ISO date string to Date object
   * Returns Date at midnight local time
   */
  static parseISO(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Check if current time is within a time window
   * @param now Current date/time
   * @param start Start time in "HH:MM" format (24-hour)
   * @param end End time in "HH:MM" format (24-hour)
   */
  static isWithinTimeWindow(now: Date, start: string, end: string): boolean {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  /**
   * Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
   */
  static getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  /**
   * Check if two ISO date strings are consecutive days
   * @param date1 Earlier date (YYYY-MM-DD)
   * @param date2 Later date (YYYY-MM-DD)
   * @returns true if date2 is exactly one day after date1
   */
  static isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = this.parseISO(date1);
    const d2 = this.parseISO(date2);
    const diffMs = d2.getTime() - d1.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays === 1;
  }

  /**
   * Calculate current streak from sorted completion dates
   * @param completionDates Sorted array of ISO date strings (most recent first)
   * @returns Number of consecutive days including today
   */
  static calculateStreak(completionDates: string[]): number {
    if (completionDates.length === 0) {
      return 0;
    }

    const today = this.getTodayISO();
    let streak = 0;
    let expectedDate = today;

    for (const date of completionDates) {
      if (date === expectedDate) {
        streak++;
        // Move to previous day
        const prevDate = this.parseISO(date);
        prevDate.setDate(prevDate.getDate() - 1);
        expectedDate = this.getDateISO(prevDate);
      } else {
        // Gap found, streak ends
        break;
      }
    }

    return streak;
  }

  /**
   * Get number of days between two dates
   * @returns Absolute number of days (always positive)
   */
  static getDaysBetween(date1: Date, date2: Date): number {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Format date for display
   * @returns Date in format "Jan 21, 2025"
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Format time for display
   * @returns Time in format "8:30 AM"
   */
  static formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Format duration in milliseconds to human-readable string
   * @param ms Duration in milliseconds
   * @returns String like "5m 30s" or "1h 15m"
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get start of day timestamp (midnight local time)
   */
  static getStartOfDayTimestamp(date?: Date): number {
    const d = date ? new Date(date) : new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  /**
   * Get end of day timestamp (23:59:59.999 local time)
   */
  static getEndOfDayTimestamp(date?: Date): number {
    const d = date ? new Date(date) : new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }

  /**
   * Check if a timestamp is from today
   */
  static isToday(timestamp: number): boolean {
    const today = this.getTodayISO();
    const date = new Date(timestamp);
    return this.getDateISO(date) === today;
  }

  /**
   * Get ISO date string for a specific number of days ago
   * @param daysAgo Number of days in the past (0 = today, 1 = yesterday, etc.)
   */
  static getDateDaysAgo(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return this.getDateISO(date);
  }
}
