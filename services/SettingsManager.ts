import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateUtils } from './DateUtils';

const SETTINGS_KEY = 'appSettings';

export interface DaySchedule {
  enabled: boolean; // Is routine active this day?
  startTime: string; // "07:00" in 24-hour format
  endTime: string; // "10:00" in 24-hour format
}

export type ResetBehavior = 'midnight' | 'morning' | 'custom';

export interface AppSettings {
  schedule: {
    [day: number]: DaySchedule; // 0=Sunday, 1=Monday, ..., 6=Saturday
  };
  resetBehavior: ResetBehavior;
  customResetTime?: string; // "HH:MM" if resetBehavior='custom'
  lockingEnabled: boolean;
  emergencyUnlockDelay: number; // Minutes (default 10)
}

export class SettingsManager {
  /**
   * Load settings from AsyncStorage
   * Returns default settings if none exist
   */
  async loadSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        const settings: AppSettings = JSON.parse(data);
        return settings;
      }
      return SettingsManager.getDefaultSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      return SettingsManager.getDefaultSettings();
    }
  }

  /**
   * Save settings to AsyncStorage
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Get schedule for today
   * Returns null if routine is disabled for today
   */
  async getScheduleForToday(): Promise<DaySchedule | null> {
    const settings = await this.loadSettings();
    const today = new Date();
    const dayOfWeek = DateUtils.getDayOfWeek(today);
    const schedule = settings.schedule[dayOfWeek];

    if (!schedule || !schedule.enabled) {
      return null;
    }

    return schedule;
  }

  /**
   * Check if routine is active right now
   * Returns true if:
   * 1. Locking is enabled
   * 2. Today's routine is enabled
   * 3. Current time is within today's time window
   */
  async isRoutineActiveNow(): Promise<boolean> {
    const settings = await this.loadSettings();

    if (!settings.lockingEnabled) {
      return false;
    }

    const schedule = await this.getScheduleForToday();
    if (!schedule) {
      return false;
    }

    const now = new Date();
    return DateUtils.isWithinTimeWindow(now, schedule.startTime, schedule.endTime);
  }

  /**
   * Get the reset time for today based on reset behavior
   * Returns timestamp when routine should reset
   */
  async getResetTimeForToday(): Promise<number> {
    const settings = await this.loadSettings();
    const today = new Date();

    switch (settings.resetBehavior) {
      case 'midnight':
        // Reset at midnight (00:00)
        return DateUtils.getStartOfDayTimestamp(today);

      case 'morning':
        // Reset at morning window start time
        const schedule = await this.getScheduleForToday();
        if (schedule) {
          const [hour, minute] = schedule.startTime.split(':').map(Number);
          const resetTime = new Date(today);
          resetTime.setHours(hour, minute, 0, 0);
          return resetTime.getTime();
        }
        // Fallback to midnight if no schedule
        return DateUtils.getStartOfDayTimestamp(today);

      case 'custom':
        // Reset at custom time
        if (settings.customResetTime) {
          const [hour, minute] = settings.customResetTime.split(':').map(Number);
          const resetTime = new Date(today);
          resetTime.setHours(hour, minute, 0, 0);
          return resetTime.getTime();
        }
        // Fallback to midnight if no custom time
        return DateUtils.getStartOfDayTimestamp(today);

      default:
        return DateUtils.getStartOfDayTimestamp(today);
    }
  }

  /**
   * Get default settings
   * Monday-Friday: 7:00 AM - 10:00 AM
   * Saturday-Sunday: 8:00 AM - 11:00 AM
   */
  static getDefaultSettings(): AppSettings {
    return {
      schedule: {
        0: { enabled: true, startTime: '08:00', endTime: '11:00' }, // Sunday
        1: { enabled: true, startTime: '07:00', endTime: '10:00' }, // Monday
        2: { enabled: true, startTime: '07:00', endTime: '10:00' }, // Tuesday
        3: { enabled: true, startTime: '07:00', endTime: '10:00' }, // Wednesday
        4: { enabled: true, startTime: '07:00', endTime: '10:00' }, // Thursday
        5: { enabled: true, startTime: '07:00', endTime: '10:00' }, // Friday
        6: { enabled: true, startTime: '08:00', endTime: '11:00' }, // Saturday
      },
      resetBehavior: 'midnight',
      lockingEnabled: true,
      emergencyUnlockDelay: 10, // 10 minutes
    };
  }

  /**
   * Update a specific day's schedule
   */
  async updateDaySchedule(dayOfWeek: number, schedule: DaySchedule): Promise<void> {
    const settings = await this.loadSettings();
    settings.schedule[dayOfWeek] = schedule;
    await this.saveSettings(settings);
  }

  /**
   * Toggle locking feature on/off
   */
  async setLockingEnabled(enabled: boolean): Promise<void> {
    const settings = await this.loadSettings();
    settings.lockingEnabled = enabled;
    await this.saveSettings(settings);
  }

  /**
   * Update reset behavior
   */
  async setResetBehavior(behavior: ResetBehavior, customTime?: string): Promise<void> {
    const settings = await this.loadSettings();
    settings.resetBehavior = behavior;
    if (behavior === 'custom' && customTime) {
      settings.customResetTime = customTime;
    }
    await this.saveSettings(settings);
  }

  /**
   * Update emergency unlock delay
   */
  async setEmergencyUnlockDelay(minutes: number): Promise<void> {
    const settings = await this.loadSettings();
    settings.emergencyUnlockDelay = Math.max(1, Math.min(30, minutes)); // Clamp 1-30
    await this.saveSettings(settings);
  }
}
