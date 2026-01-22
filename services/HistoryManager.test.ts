import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryManager, DailyRecord, StreakData } from './HistoryManager';
import { RoutineItem } from '../types/RoutineItem';
import { DateUtils } from './DateUtils';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('HistoryManager', () => {
  let historyManager: HistoryManager;

  beforeEach(() => {
    historyManager = new HistoryManager();
    jest.clearAllMocks();
  });

  describe('recordCompletion', () => {
    it('should record a new completion', async () => {
      const items = [RoutineItem.PUSHUPS, RoutineItem.WATER];
      const startTime = Date.now() - 300000; // 5 minutes ago
      const endTime = Date.now();

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await historyManager.recordCompletion(items, startTime, endTime, true);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'dailyCompletionHistory',
        expect.any(String)
      );

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const history: DailyRecord[] = JSON.parse(savedData);

      expect(history).toHaveLength(1);
      expect(history[0].date).toBe(DateUtils.getTodayISO());
      expect(history[0].completedItems).toEqual(items);
      expect(history[0].wasLocked).toBe(true);
      expect(history[0].totalTime).toBe(endTime - startTime);
    });

    it('should replace existing record for today', async () => {
      const today = DateUtils.getTodayISO();
      const existingRecord: DailyRecord = {
        date: today,
        completedItems: [RoutineItem.PUSHUPS],
        startedAt: Date.now() - 600000,
        completedAt: Date.now() - 300000,
        totalTime: 300000,
        wasLocked: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([existingRecord]));

      const items = [RoutineItem.PUSHUPS, RoutineItem.WATER, RoutineItem.COFFEE_BREAKFAST];
      const startTime = Date.now() - 400000;
      const endTime = Date.now();

      await historyManager.recordCompletion(items, startTime, endTime, true);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const history: DailyRecord[] = JSON.parse(savedData);

      expect(history).toHaveLength(1);
      expect(history[0].completedItems).toEqual(items);
      expect(history[0].wasLocked).toBe(true);
    });

    it('should keep only last 90 days of records', async () => {
      // Create 95 days of records
      const records: DailyRecord[] = [];
      for (let i = 0; i < 95; i++) {
        records.push({
          date: DateUtils.getDateDaysAgo(i),
          completedItems: [RoutineItem.PUSHUPS],
          startedAt: Date.now(),
          completedAt: Date.now(),
          totalTime: 300000,
          wasLocked: false,
        });
      }

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(records));

      const items = [RoutineItem.PUSHUPS];
      await historyManager.recordCompletion(items, Date.now(), Date.now(), false);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const history: DailyRecord[] = JSON.parse(savedData);

      expect(history).toHaveLength(90);
    });
  });

  describe('getTodayRecord', () => {
    it('should return today record if exists', async () => {
      const today = DateUtils.getTodayISO();
      const todayRecord: DailyRecord = {
        date: today,
        completedItems: [RoutineItem.PUSHUPS],
        startedAt: Date.now(),
        completedAt: Date.now(),
        totalTime: 300000,
        wasLocked: true,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([todayRecord]));

      const record = await historyManager.getTodayRecord();

      expect(record).not.toBeNull();
      expect(record?.date).toBe(today);
    });

    it('should return null if no record for today', async () => {
      const yesterday = DateUtils.getDateDaysAgo(1);
      const yesterdayRecord: DailyRecord = {
        date: yesterday,
        completedItems: [RoutineItem.PUSHUPS],
        startedAt: Date.now(),
        completedAt: Date.now(),
        totalTime: 300000,
        wasLocked: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([yesterdayRecord]));

      const record = await historyManager.getTodayRecord();

      expect(record).toBeNull();
    });
  });

  describe('getLast30Days', () => {
    it('should return last 30 days of records', async () => {
      const records: DailyRecord[] = [];
      for (let i = 0; i < 50; i++) {
        records.push({
          date: DateUtils.getDateDaysAgo(i),
          completedItems: [RoutineItem.PUSHUPS],
          startedAt: Date.now(),
          completedAt: Date.now(),
          totalTime: 300000,
          wasLocked: false,
        });
      }

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(records));

      const last30 = await historyManager.getLast30Days();

      expect(last30).toHaveLength(30);
    });
  });

  describe('getStreakData', () => {
    it('should return cached streak data if available', async () => {
      const streakData: StreakData = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletionDate: DateUtils.getTodayISO(),
        totalCompletions: 20,
        completionDates: [],
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'streakData') {
          return Promise.resolve(JSON.stringify(streakData));
        }
        return Promise.resolve(null);
      });

      const data = await historyManager.getStreakData();

      expect(data.currentStreak).toBe(5);
      expect(data.longestStreak).toBe(10);
    });

    it('should calculate streak data if not cached', async () => {
      const today = DateUtils.getTodayISO();
      const yesterday = DateUtils.getDateDaysAgo(1);
      const records: DailyRecord[] = [
        {
          date: today,
          completedItems: [RoutineItem.PUSHUPS],
          startedAt: Date.now(),
          completedAt: Date.now(),
          totalTime: 300000,
          wasLocked: false,
        },
        {
          date: yesterday,
          completedItems: [RoutineItem.PUSHUPS],
          startedAt: Date.now(),
          completedAt: Date.now(),
          totalTime: 300000,
          wasLocked: false,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'dailyCompletionHistory') {
          return Promise.resolve(JSON.stringify(records));
        }
        return Promise.resolve(null);
      });

      const data = await historyManager.getStreakData();

      expect(data.currentStreak).toBe(2);
      expect(data.totalCompletions).toBe(2);
    });

    it('should return zero values for empty history', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const data = await historyManager.getStreakData();

      expect(data.currentStreak).toBe(0);
      expect(data.longestStreak).toBe(0);
      expect(data.totalCompletions).toBe(0);
    });
  });

  describe('getCompletionRate', () => {
    it('should calculate completion rate correctly', async () => {
      // Create records for 7 out of last 10 days
      const records: DailyRecord[] = [];
      for (let i = 0; i < 7; i++) {
        records.push({
          date: DateUtils.getDateDaysAgo(i),
          completedItems: [RoutineItem.PUSHUPS],
          startedAt: Date.now(),
          completedAt: Date.now(),
          totalTime: 300000,
          wasLocked: false,
        });
      }

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(records));

      const rate = await historyManager.getCompletionRate(10);

      expect(rate).toBe(70); // 7 out of 10 = 70%
    });

    it('should return 0 for empty history', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const rate = await historyManager.getCompletionRate(30);

      expect(rate).toBe(0);
    });
  });

  describe('getAverageCompletionTime', () => {
    it('should calculate average completion time', async () => {
      const records: DailyRecord[] = [
        {
          date: DateUtils.getTodayISO(),
          completedItems: [RoutineItem.PUSHUPS],
          startedAt: Date.now(),
          completedAt: Date.now(),
          totalTime: 300000, // 5 minutes
          wasLocked: false,
        },
        {
          date: DateUtils.getDateDaysAgo(1),
          completedItems: [RoutineItem.PUSHUPS],
          startedAt: Date.now(),
          completedAt: Date.now(),
          totalTime: 600000, // 10 minutes
          wasLocked: false,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(records));

      const avgTime = await historyManager.getAverageCompletionTime();

      expect(avgTime).toBe(450000); // Average of 300000 and 600000
    });

    it('should return 0 for empty history', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const avgTime = await historyManager.getAverageCompletionTime();

      expect(avgTime).toBe(0);
    });
  });

  describe('wasCompletedToday', () => {
    it('should return true if completed today', async () => {
      const today = DateUtils.getTodayISO();
      const record: DailyRecord = {
        date: today,
        completedItems: [RoutineItem.PUSHUPS],
        startedAt: Date.now(),
        completedAt: Date.now(),
        totalTime: 300000,
        wasLocked: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([record]));

      const wasCompleted = await historyManager.wasCompletedToday();

      expect(wasCompleted).toBe(true);
    });

    it('should return false if not completed today', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const wasCompleted = await historyManager.wasCompletedToday();

      expect(wasCompleted).toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('should return formatted statistics', async () => {
      const today = DateUtils.getTodayISO();
      const records: DailyRecord[] = [
        {
          date: today,
          completedItems: [RoutineItem.PUSHUPS],
          startedAt: Date.now(),
          completedAt: Date.now(),
          totalTime: 300000,
          wasLocked: false,
        },
      ];

      const streakData: StreakData = {
        currentStreak: 1,
        longestStreak: 1,
        lastCompletionDate: today,
        totalCompletions: 1,
        completionDates: [today],
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'dailyCompletionHistory') {
          return Promise.resolve(JSON.stringify(records));
        }
        if (key === 'streakData') {
          return Promise.resolve(JSON.stringify(streakData));
        }
        return Promise.resolve(null);
      });

      const stats = await historyManager.getStatistics();

      expect(stats.currentStreak).toBe(1);
      expect(stats.longestStreak).toBe(1);
      expect(stats.totalCompletions).toBe(1);
      expect(stats.averageTime).toMatch(/5m/);
    });
  });

  describe('cleanupOldRecords', () => {
    it('should remove records older than specified days', async () => {
      const records: DailyRecord[] = [];
      for (let i = 0; i < 100; i++) {
        records.push({
          date: DateUtils.getDateDaysAgo(i),
          completedItems: [RoutineItem.PUSHUPS],
          startedAt: Date.now(),
          completedAt: Date.now(),
          totalTime: 300000,
          wasLocked: false,
        });
      }

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(records));

      await historyManager.cleanupOldRecords(30);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const cleanedHistory: DailyRecord[] = JSON.parse(savedData);

      // Should keep records from today to 30 days ago (31 records total: day 0 through day 30)
      expect(cleanedHistory.length).toBeLessThanOrEqual(31);
      expect(cleanedHistory.every((r) => r.date >= DateUtils.getDateDaysAgo(30))).toBe(true);
    });
  });
});
