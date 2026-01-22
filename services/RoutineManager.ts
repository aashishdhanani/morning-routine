import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineItem } from '../types/RoutineItem';
import { AppSettings } from './SettingsManager';
import { HistoryManager } from './HistoryManager';

const STORAGE_KEY = 'routineCompletionState';
const LAST_RESET_KEY = 'lastResetTimestamp';
const START_TIME_KEY = 'routineStartTime';

export class RoutineManager {
  private completedItems: Set<RoutineItem> = new Set();
  private routineStartTime: number | null = null;

  getAllItems(): RoutineItem[] {
    return Object.values(RoutineItem);
  }

  isCompleted(item: RoutineItem): boolean {
    return this.completedItems.has(item);
  }

  async markComplete(item: RoutineItem): Promise<void> {
    // Track start time on first item
    if (this.completedItems.size === 0 && !this.routineStartTime) {
      this.routineStartTime = Date.now();
      await this.saveStartTime();
    }

    this.completedItems.add(item);
    await this.saveState();
  }

  async markIncomplete(item: RoutineItem): Promise<void> {
    this.completedItems.delete(item);
    await this.saveState();
  }

  async toggleItem(item: RoutineItem): Promise<void> {
    if (this.isCompleted(item)) {
      await this.markIncomplete(item);
    } else {
      await this.markComplete(item);
    }
  }

  isRoutineComplete(): boolean {
    return this.completedItems.size === this.getAllItems().length;
  }

  getCompletedCount(): number {
    return this.completedItems.size;
  }

  getTotalCount(): number {
    return this.getAllItems().length;
  }

  async loadState(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const items: RoutineItem[] = JSON.parse(data);
        this.completedItems = new Set(items);
      }

      // Load start time
      const startTimeData = await AsyncStorage.getItem(START_TIME_KEY);
      if (startTimeData) {
        this.routineStartTime = JSON.parse(startTimeData);
      }
    } catch (error) {
      console.error('Error loading routine state:', error);
      this.completedItems = new Set();
      this.routineStartTime = null;
    }
  }

  async saveState(): Promise<void> {
    try {
      const items = Array.from(this.completedItems);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving routine state:', error);
    }
  }

  /**
   * Check if routine needs to be reset based on settings
   * Returns true if reset was performed
   */
  async checkAndResetIfNeeded(settings: AppSettings, resetTime: number): Promise<boolean> {
    try {
      // Get last reset timestamp
      const lastResetData = await AsyncStorage.getItem(LAST_RESET_KEY);
      const lastReset = lastResetData ? JSON.parse(lastResetData) : 0;

      // Check if we've passed the reset time and haven't reset yet
      const now = Date.now();
      if (now >= resetTime && lastReset < resetTime) {
        await this.resetRoutine();
        await AsyncStorage.setItem(LAST_RESET_KEY, JSON.stringify(now));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking reset:', error);
      return false;
    }
  }

  /**
   * Called when routine is completed
   * Records completion to history
   */
  async onRoutineCompleted(historyManager: HistoryManager, wasLocked: boolean): Promise<void> {
    try {
      if (!this.routineStartTime) {
        this.routineStartTime = Date.now(); // Fallback
      }

      const endTime = Date.now();
      const completedItems = Array.from(this.completedItems);

      await historyManager.recordCompletion(
        completedItems,
        this.routineStartTime,
        endTime,
        wasLocked
      );
    } catch (error) {
      console.error('Error recording completion:', error);
    }
  }

  /**
   * Get routine start time
   */
  getStartTime(): number | null {
    return this.routineStartTime;
  }

  /**
   * Save start time to storage
   */
  private async saveStartTime(): Promise<void> {
    try {
      if (this.routineStartTime) {
        await AsyncStorage.setItem(START_TIME_KEY, JSON.stringify(this.routineStartTime));
      }
    } catch (error) {
      console.error('Error saving start time:', error);
    }
  }

  /**
   * Reset routine and clear start time
   */
  async resetRoutine(): Promise<void> {
    this.completedItems.clear();
    this.routineStartTime = null;
    await this.saveState();
    await AsyncStorage.removeItem(START_TIME_KEY);
  }
}
