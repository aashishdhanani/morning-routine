import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsManager } from './SettingsManager';
import { RoutineManager } from './RoutineManager';

const LOCK_STATE_KEY = 'lockingState';

export interface LockState {
  isLocked: boolean;
  lockedAt: number; // Timestamp when lock started
  reason: string; // "morning_routine" | "emergency_unlocked"
  emergencyUnlockAvailable: boolean;
  routineStartTime: number;
}

export class LockingService {
  private settingsManager: SettingsManager;
  private routineManager: RoutineManager;

  constructor(settingsManager: SettingsManager, routineManager: RoutineManager) {
    this.settingsManager = settingsManager;
    this.routineManager = routineManager;
  }

  /**
   * Check if app should lock now
   * Returns true if:
   * 1. Locking is enabled in settings
   * 2. Current time is within morning window
   * 3. Routine is not yet completed today
   */
  async shouldLockNow(): Promise<boolean> {
    try {
      // Check if locking is enabled and within time window
      const isActive = await this.settingsManager.isRoutineActiveNow();
      if (!isActive) {
        return false;
      }

      // Check if routine is already completed
      const isComplete = this.routineManager.isRoutineComplete();
      if (isComplete) {
        return false;
      }

      // Check if already locked (don't re-lock)
      const lockState = await this.getLockState();
      if (lockState && lockState.isLocked) {
        return true; // Already locked
      }

      return true;
    } catch (error) {
      console.error('Error checking if should lock:', error);
      return false;
    }
  }

  /**
   * Lock the app
   */
  async lockApp(): Promise<void> {
    try {
      const lockState: LockState = {
        isLocked: true,
        lockedAt: Date.now(),
        reason: 'morning_routine',
        emergencyUnlockAvailable: false,
        routineStartTime: Date.now(),
      };

      await AsyncStorage.setItem(LOCK_STATE_KEY, JSON.stringify(lockState));
    } catch (error) {
      console.error('Error locking app:', error);
    }
  }

  /**
   * Unlock the app and clear lock state
   */
  async unlockApp(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCK_STATE_KEY);
    } catch (error) {
      console.error('Error unlocking app:', error);
    }
  }

  /**
   * Check if emergency unlock is available
   * Emergency unlock becomes available after configured delay
   */
  async canEmergencyUnlock(): Promise<boolean> {
    try {
      const lockState = await this.getLockState();
      if (!lockState || !lockState.isLocked) {
        return false;
      }

      const settings = await this.settingsManager.loadSettings();
      const delayMs = settings.emergencyUnlockDelay * 60 * 1000; // Convert minutes to ms

      const elapsed = Date.now() - lockState.lockedAt;
      return elapsed >= delayMs;
    } catch (error) {
      console.error('Error checking emergency unlock:', error);
      return false;
    }
  }

  /**
   * Perform emergency unlock
   * This breaks the streak and records the failure
   */
  async emergencyUnlock(): Promise<void> {
    try {
      if (!(await this.canEmergencyUnlock())) {
        throw new Error('Emergency unlock not yet available');
      }

      await this.unlockApp();
    } catch (error) {
      console.error('Error performing emergency unlock:', error);
      throw error;
    }
  }

  /**
   * Get current lock state
   */
  async getLockState(): Promise<LockState | null> {
    try {
      const data = await AsyncStorage.getItem(LOCK_STATE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting lock state:', error);
      return null;
    }
  }

  /**
   * Get time remaining until emergency unlock becomes available
   * Returns milliseconds remaining, or 0 if already available
   */
  async getTimeUntilEmergencyUnlock(): Promise<number> {
    try {
      const lockState = await this.getLockState();
      if (!lockState || !lockState.isLocked) {
        return 0;
      }

      const settings = await this.settingsManager.loadSettings();
      const delayMs = settings.emergencyUnlockDelay * 60 * 1000;

      const elapsed = Date.now() - lockState.lockedAt;
      const remaining = delayMs - elapsed;

      return Math.max(0, remaining);
    } catch (error) {
      console.error('Error getting time until emergency unlock:', error);
      return 0;
    }
  }

  /**
   * Update lock state to mark emergency unlock as available
   * Called by UI timer when delay has passed
   */
  async markEmergencyUnlockAvailable(): Promise<void> {
    try {
      const lockState = await this.getLockState();
      if (!lockState) {
        return;
      }

      lockState.emergencyUnlockAvailable = true;
      await AsyncStorage.setItem(LOCK_STATE_KEY, JSON.stringify(lockState));
    } catch (error) {
      console.error('Error marking emergency unlock available:', error);
    }
  }

  /**
   * Check if currently locked
   */
  async isLocked(): Promise<boolean> {
    const lockState = await this.getLockState();
    return lockState?.isLocked ?? false;
  }
}
