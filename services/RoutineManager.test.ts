import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineManager } from './RoutineManager';
import { RoutineItem } from '../types/RoutineItem';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

describe('RoutineManager', () => {
  let routineManager: RoutineManager;

  beforeEach(() => {
    jest.clearAllMocks();
    routineManager = new RoutineManager();
  });

  describe('Basic Functionality', () => {
    test('getAllItems returns all routine items', () => {
      const items = routineManager.getAllItems();
      expect(items).toHaveLength(5);
      expect(items).toContain(RoutineItem.PUSHUPS);
      expect(items).toContain(RoutineItem.COFFEE_BREAKFAST);
      expect(items).toContain(RoutineItem.WATER);
      expect(items).toContain(RoutineItem.CALENDAR_EMAILS);
      expect(items).toContain(RoutineItem.MUSIC);
    });

    test('isCompleted returns false for uncompleted items', () => {
      expect(routineManager.isCompleted(RoutineItem.PUSHUPS)).toBe(false);
    });

    test('markComplete marks an item as complete', () => {
      routineManager.markComplete(RoutineItem.PUSHUPS);
      expect(routineManager.isCompleted(RoutineItem.PUSHUPS)).toBe(true);
    });

    test('markIncomplete marks an item as incomplete', () => {
      routineManager.markComplete(RoutineItem.PUSHUPS);
      routineManager.markIncomplete(RoutineItem.PUSHUPS);
      expect(routineManager.isCompleted(RoutineItem.PUSHUPS)).toBe(false);
    });

    test('toggleItem toggles completion status', () => {
      expect(routineManager.isCompleted(RoutineItem.PUSHUPS)).toBe(false);
      routineManager.toggleItem(RoutineItem.PUSHUPS);
      expect(routineManager.isCompleted(RoutineItem.PUSHUPS)).toBe(true);
      routineManager.toggleItem(RoutineItem.PUSHUPS);
      expect(routineManager.isCompleted(RoutineItem.PUSHUPS)).toBe(false);
    });

    test('getCompletedCount returns correct count', () => {
      expect(routineManager.getCompletedCount()).toBe(0);
      routineManager.markComplete(RoutineItem.PUSHUPS);
      expect(routineManager.getCompletedCount()).toBe(1);
      routineManager.markComplete(RoutineItem.WATER);
      expect(routineManager.getCompletedCount()).toBe(2);
    });

    test('getTotalCount returns total number of items', () => {
      expect(routineManager.getTotalCount()).toBe(5);
    });

    test('isRoutineComplete returns true when all items complete', () => {
      expect(routineManager.isRoutineComplete()).toBe(false);

      routineManager.markComplete(RoutineItem.PUSHUPS);
      routineManager.markComplete(RoutineItem.COFFEE_BREAKFAST);
      routineManager.markComplete(RoutineItem.WATER);
      routineManager.markComplete(RoutineItem.CALENDAR_EMAILS);
      expect(routineManager.isRoutineComplete()).toBe(false);

      routineManager.markComplete(RoutineItem.MUSIC);
      expect(routineManager.isRoutineComplete()).toBe(true);
    });

    test('resetRoutine clears all completed items', () => {
      routineManager.markComplete(RoutineItem.PUSHUPS);
      routineManager.markComplete(RoutineItem.WATER);
      expect(routineManager.getCompletedCount()).toBe(2);

      routineManager.resetRoutine();
      expect(routineManager.getCompletedCount()).toBe(0);
    });
  });

  describe('Persistence', () => {
    test('loadState loads completion state from AsyncStorage', async () => {
      const mockData = JSON.stringify([RoutineItem.PUSHUPS, RoutineItem.WATER]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockData);

      await routineManager.loadState();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('routineCompletionState');
      expect(routineManager.isCompleted(RoutineItem.PUSHUPS)).toBe(true);
      expect(routineManager.isCompleted(RoutineItem.WATER)).toBe(true);
      expect(routineManager.isCompleted(RoutineItem.COFFEE_BREAKFAST)).toBe(false);
    });

    test('loadState handles no existing data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await routineManager.loadState();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('routineCompletionState');
      expect(routineManager.getCompletedCount()).toBe(0);
    });

    test('loadState handles invalid JSON data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      await routineManager.loadState();

      expect(routineManager.getCompletedCount()).toBe(0);
    });

    test('saveState persists completion state to AsyncStorage', async () => {
      routineManager.markComplete(RoutineItem.PUSHUPS);
      routineManager.markComplete(RoutineItem.WATER);

      await routineManager.saveState();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'routineCompletionState',
        expect.stringContaining(RoutineItem.PUSHUPS)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'routineCompletionState',
        expect.stringContaining(RoutineItem.WATER)
      );
    });

    test('markComplete auto-saves state', async () => {
      await routineManager.markComplete(RoutineItem.PUSHUPS);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'routineCompletionState',
        expect.any(String)
      );
    });

    test('markIncomplete auto-saves state', async () => {
      routineManager.markComplete(RoutineItem.PUSHUPS);
      jest.clearAllMocks();

      await routineManager.markIncomplete(RoutineItem.PUSHUPS);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('toggleItem auto-saves state', async () => {
      await routineManager.toggleItem(RoutineItem.PUSHUPS);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('resetRoutine auto-saves state', async () => {
      routineManager.markComplete(RoutineItem.PUSHUPS);
      jest.clearAllMocks();

      await routineManager.resetRoutine();

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
