import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineItem } from '../types/RoutineItem';
import { DateUtils } from './DateUtils';

const HISTORY_KEY = 'dailyCompletionHistory';
const STREAK_KEY = 'streakData';

export interface DailyRecord {
  date: string; // ISO: "2025-01-21"
  completedItems: RoutineItem[];
  startedAt: number; // Timestamp when first item marked
  completedAt: number; // Timestamp when routine finished
  totalTime: number; // Duration in ms
  wasLocked: boolean; // Was app locked during this routine?
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string;
  totalCompletions: number;
  completionDates: string[]; // All dates with 100% completion (sorted desc)
}

export class HistoryManager {
  /**
   * Record a completed routine
   */
  async recordCompletion(
    items: RoutineItem[],
    startTime: number,
    endTime: number,
    locked: boolean
  ): Promise<void> {
    try {
      const today = DateUtils.getTodayISO();

      // Create daily record
      const record: DailyRecord = {
        date: today,
        completedItems: items,
        startedAt: startTime,
        completedAt: endTime,
        totalTime: endTime - startTime,
        wasLocked: locked,
      };

      // Add to history
      const history = await this.getHistory();

      // Remove any existing record for today (replace)
      const filteredHistory = history.filter((r) => r.date !== today);

      // Add new record at beginning (most recent first)
      filteredHistory.unshift(record);

      // Keep only last 90 days
      const trimmedHistory = filteredHistory.slice(0, 90);

      // Save history
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));

      // Update streak data
      await this.updateStreakData(trimmedHistory);
    } catch (error) {
      console.error('Error recording completion:', error);
    }
  }

  /**
   * Get today's record if it exists
   */
  async getTodayRecord(): Promise<DailyRecord | null> {
    try {
      const today = DateUtils.getTodayISO();
      const history = await this.getHistory();
      return history.find((r) => r.date === today) || null;
    } catch (error) {
      console.error('Error getting today record:', error);
      return null;
    }
  }

  /**
   * Get all records in date range
   */
  async getRecordsInRange(startDate: string, endDate: string): Promise<DailyRecord[]> {
    try {
      const history = await this.getHistory();
      return history.filter((r) => r.date >= startDate && r.date <= endDate);
    } catch (error) {
      console.error('Error getting records in range:', error);
      return [];
    }
  }

  /**
   * Get last 30 days of records
   */
  async getLast30Days(): Promise<DailyRecord[]> {
    try {
      const history = await this.getHistory();
      return history.slice(0, 30);
    } catch (error) {
      console.error('Error getting last 30 days:', error);
      return [];
    }
  }

  /**
   * Get streak data
   */
  async getStreakData(): Promise<StreakData> {
    try {
      const data = await AsyncStorage.getItem(STREAK_KEY);
      if (data) {
        return JSON.parse(data);
      }

      // No cached streak data, calculate from history
      const history = await this.getHistory();
      return this.calculateStreakData(history);
    } catch (error) {
      console.error('Error getting streak data:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: '',
        totalCompletions: 0,
        completionDates: [],
      };
    }
  }

  /**
   * Get completion rate percentage for last N days
   */
  async getCompletionRate(days: number): Promise<number> {
    try {
      const history = await this.getHistory();
      const recentHistory = history.slice(0, days);

      if (recentHistory.length === 0) {
        return 0;
      }

      const completedDays = recentHistory.length;
      return Math.round((completedDays / days) * 100);
    } catch (error) {
      console.error('Error calculating completion rate:', error);
      return 0;
    }
  }

  /**
   * Get average completion time in milliseconds
   */
  async getAverageCompletionTime(): Promise<number> {
    try {
      const history = await this.getHistory();

      if (history.length === 0) {
        return 0;
      }

      const totalTime = history.reduce((sum, record) => sum + record.totalTime, 0);
      return Math.round(totalTime / history.length);
    } catch (error) {
      console.error('Error calculating average completion time:', error);
      return 0;
    }
  }

  /**
   * Clean up records older than specified days
   */
  async cleanupOldRecords(daysToKeep: number): Promise<void> {
    try {
      const history = await this.getHistory();
      const cutoffDate = DateUtils.getDateDaysAgo(daysToKeep);

      const filteredHistory = history.filter((r) => r.date >= cutoffDate);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error cleaning up old records:', error);
    }
  }

  /**
   * Get all history records (internal use)
   */
  private async getHistory(): Promise<DailyRecord[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  /**
   * Calculate streak data from history
   */
  private calculateStreakData(history: DailyRecord[]): StreakData {
    if (history.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: '',
        totalCompletions: 0,
        completionDates: [],
      };
    }

    // Extract completion dates (sorted most recent first)
    const completionDates = history.map((r) => r.date);

    // Calculate current streak
    const currentStreak = DateUtils.calculateStreak(completionDates);

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 0; i < completionDates.length - 1; i++) {
      if (DateUtils.isConsecutiveDay(completionDates[i + 1], completionDates[i])) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // If only one record or no consecutive days found
    longestStreak = Math.max(longestStreak, currentStreak, 1);

    return {
      currentStreak,
      longestStreak,
      lastCompletionDate: completionDates[0],
      totalCompletions: history.length,
      completionDates,
    };
  }

  /**
   * Update streak data cache
   */
  private async updateStreakData(history: DailyRecord[]): Promise<void> {
    try {
      const streakData = this.calculateStreakData(history);
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
    } catch (error) {
      console.error('Error updating streak data:', error);
    }
  }

  /**
   * Check if routine was completed today
   */
  async wasCompletedToday(): Promise<boolean> {
    const todayRecord = await this.getTodayRecord();
    return todayRecord !== null;
  }

  /**
   * Get completion statistics for display
   */
  async getStatistics(): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number;
    averageTime: string;
  }> {
    try {
      const streakData = await this.getStreakData();
      const completionRate = await this.getCompletionRate(30); // Last 30 days
      const avgTimeMs = await this.getAverageCompletionTime();

      return {
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        totalCompletions: streakData.totalCompletions,
        completionRate,
        averageTime: DateUtils.formatDuration(avgTimeMs),
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        completionRate: 0,
        averageTime: '0s',
      };
    }
  }
}
