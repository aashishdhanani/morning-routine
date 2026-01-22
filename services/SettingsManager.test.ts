import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsManager, AppSettings, DaySchedule } from './SettingsManager';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('SettingsManager', () => {
  let settingsManager: SettingsManager;

  beforeEach(() => {
    settingsManager = new SettingsManager();
    jest.clearAllMocks();
  });

  describe('getDefaultSettings', () => {
    it('should return default settings with all days enabled', () => {
      const defaults = SettingsManager.getDefaultSettings();

      expect(defaults.lockingEnabled).toBe(true);
      expect(defaults.resetBehavior).toBe('midnight');
      expect(defaults.emergencyUnlockDelay).toBe(10);

      // Check all days are enabled
      for (let day = 0; day <= 6; day++) {
        expect(defaults.schedule[day].enabled).toBe(true);
      }
    });

    it('should set weekday times to 7-10am', () => {
      const defaults = SettingsManager.getDefaultSettings();

      for (let day = 1; day <= 5; day++) {
        // Monday-Friday
        expect(defaults.schedule[day].startTime).toBe('07:00');
        expect(defaults.schedule[day].endTime).toBe('10:00');
      }
    });

    it('should set weekend times to 8-11am', () => {
      const defaults = SettingsManager.getDefaultSettings();

      expect(defaults.schedule[0].startTime).toBe('08:00'); // Sunday
      expect(defaults.schedule[0].endTime).toBe('11:00');
      expect(defaults.schedule[6].startTime).toBe('08:00'); // Saturday
      expect(defaults.schedule[6].endTime).toBe('11:00');
    });
  });

  describe('loadSettings', () => {
    it('should load settings from AsyncStorage', async () => {
      const mockSettings: AppSettings = {
        schedule: {
          0: { enabled: false, startTime: '08:00', endTime: '10:00' },
          1: { enabled: true, startTime: '07:00', endTime: '09:00' },
          2: { enabled: true, startTime: '07:00', endTime: '09:00' },
          3: { enabled: true, startTime: '07:00', endTime: '09:00' },
          4: { enabled: true, startTime: '07:00', endTime: '09:00' },
          5: { enabled: true, startTime: '07:00', endTime: '09:00' },
          6: { enabled: false, startTime: '08:00', endTime: '10:00' },
        },
        resetBehavior: 'morning',
        lockingEnabled: true,
        emergencyUnlockDelay: 15,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const settings = await settingsManager.loadSettings();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('appSettings');
      expect(settings).toEqual(mockSettings);
    });

    it('should return default settings if nothing stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const settings = await settingsManager.loadSettings();

      expect(settings).toEqual(SettingsManager.getDefaultSettings());
    });

    it('should return default settings on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const settings = await settingsManager.loadSettings();

      expect(settings).toEqual(SettingsManager.getDefaultSettings());
    });
  });

  describe('saveSettings', () => {
    it('should save settings to AsyncStorage', async () => {
      const settings = SettingsManager.getDefaultSettings();
      settings.lockingEnabled = false;

      await settingsManager.saveSettings(settings);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('appSettings', JSON.stringify(settings));
    });

    it('should handle save errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const settings = SettingsManager.getDefaultSettings();

      await expect(settingsManager.saveSettings(settings)).resolves.not.toThrow();
    });
  });

  describe('getScheduleForToday', () => {
    it('should return schedule for current day', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const schedule = await settingsManager.getScheduleForToday();

      expect(schedule).not.toBeNull();
      expect(schedule).toHaveProperty('enabled');
      expect(schedule).toHaveProperty('startTime');
      expect(schedule).toHaveProperty('endTime');
    });

    it('should return null if today is disabled', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      const today = new Date().getDay();
      mockSettings.schedule[today].enabled = false;

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const schedule = await settingsManager.getScheduleForToday();

      expect(schedule).toBeNull();
    });
  });

  describe('isRoutineActiveNow', () => {
    beforeEach(() => {
      // Mock the current time to 8:30 AM
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 0, 21, 8, 30, 0)); // Jan 21, 2025, 8:30 AM
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true when within time window', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const isActive = await settingsManager.isRoutineActiveNow();

      expect(isActive).toBe(true);
    });

    it('should return false when locking is disabled', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      mockSettings.lockingEnabled = false;

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const isActive = await settingsManager.isRoutineActiveNow();

      expect(isActive).toBe(false);
    });

    it('should return false when today is disabled', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      const today = new Date().getDay();
      mockSettings.schedule[today].enabled = false;

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const isActive = await settingsManager.isRoutineActiveNow();

      expect(isActive).toBe(false);
    });

    it('should return false when outside time window', async () => {
      // Set time to 6:00 AM (before window)
      jest.setSystemTime(new Date(2025, 0, 21, 6, 0, 0));

      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const isActive = await settingsManager.isRoutineActiveNow();

      expect(isActive).toBe(false);
    });
  });

  describe('getResetTimeForToday', () => {
    it('should return midnight for midnight reset behavior', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      mockSettings.resetBehavior = 'midnight';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const resetTime = await settingsManager.getResetTimeForToday();
      const date = new Date(resetTime);

      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });

    it('should return morning start time for morning reset behavior', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      mockSettings.resetBehavior = 'morning';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const resetTime = await settingsManager.getResetTimeForToday();
      const date = new Date(resetTime);

      // Weekday should be 7:00 AM
      const today = new Date().getDay();
      if (today >= 1 && today <= 5) {
        expect(date.getHours()).toBe(7);
        expect(date.getMinutes()).toBe(0);
      }
    });

    it('should return custom time for custom reset behavior', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      mockSettings.resetBehavior = 'custom';
      mockSettings.customResetTime = '06:30';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const resetTime = await settingsManager.getResetTimeForToday();
      const date = new Date(resetTime);

      expect(date.getHours()).toBe(6);
      expect(date.getMinutes()).toBe(30);
    });
  });

  describe('updateDaySchedule', () => {
    it('should update specific day schedule', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      const newSchedule: DaySchedule = {
        enabled: false,
        startTime: '06:00',
        endTime: '09:00',
      };

      await settingsManager.updateDaySchedule(1, newSchedule); // Monday

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedSettings: AppSettings = JSON.parse(savedData);

      expect(savedSettings.schedule[1]).toEqual(newSchedule);
    });
  });

  describe('setLockingEnabled', () => {
    it('should update locking enabled state', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      await settingsManager.setLockingEnabled(false);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedSettings: AppSettings = JSON.parse(savedData);

      expect(savedSettings.lockingEnabled).toBe(false);
    });
  });

  describe('setResetBehavior', () => {
    it('should update reset behavior', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      await settingsManager.setResetBehavior('morning');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedSettings: AppSettings = JSON.parse(savedData);

      expect(savedSettings.resetBehavior).toBe('morning');
    });

    it('should set custom time when behavior is custom', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      await settingsManager.setResetBehavior('custom', '06:00');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedSettings: AppSettings = JSON.parse(savedData);

      expect(savedSettings.resetBehavior).toBe('custom');
      expect(savedSettings.customResetTime).toBe('06:00');
    });
  });

  describe('setEmergencyUnlockDelay', () => {
    it('should update emergency unlock delay', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      await settingsManager.setEmergencyUnlockDelay(15);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedSettings: AppSettings = JSON.parse(savedData);

      expect(savedSettings.emergencyUnlockDelay).toBe(15);
    });

    it('should clamp delay to minimum 1 minute', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      await settingsManager.setEmergencyUnlockDelay(0);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedSettings: AppSettings = JSON.parse(savedData);

      expect(savedSettings.emergencyUnlockDelay).toBe(1);
    });

    it('should clamp delay to maximum 30 minutes', async () => {
      const mockSettings = SettingsManager.getDefaultSettings();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSettings));

      await settingsManager.setEmergencyUnlockDelay(50);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedSettings: AppSettings = JSON.parse(savedData);

      expect(savedSettings.emergencyUnlockDelay).toBe(30);
    });
  });
});
