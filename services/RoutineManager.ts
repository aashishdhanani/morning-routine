import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineItem } from '../types/RoutineItem';

const STORAGE_KEY = 'routineCompletionState';

export class RoutineManager {
  private completedItems: Set<RoutineItem> = new Set();

  getAllItems(): RoutineItem[] {
    return Object.values(RoutineItem);
  }

  isCompleted(item: RoutineItem): boolean {
    return this.completedItems.has(item);
  }

  async markComplete(item: RoutineItem): Promise<void> {
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

  async resetRoutine(): Promise<void> {
    this.completedItems.clear();
    await this.saveState();
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
    } catch (error) {
      console.error('Error loading routine state:', error);
      this.completedItems = new Set();
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
}
