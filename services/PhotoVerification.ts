import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PhotoRecord {
  uri: string;
  timestamp: number;
  routineItem: string;
}

const STORAGE_KEY = 'photoVerificationRecords';

export class PhotoVerification {
  private photosDirectory: string;

  constructor() {
    try {
      this.photosDirectory = FileSystem.documentDirectory
        ? `${FileSystem.documentDirectory}routine-photos/`
        : '';
    } catch (error) {
      console.warn('FileSystem not available:', error);
      this.photosDirectory = '';
    }
  }

  /**
   * Check if FileSystem is available
   */
  isAvailable(): boolean {
    return this.photosDirectory !== '' && FileSystem.documentDirectory !== undefined;
  }

  /**
   * Initialize the photos directory
   */
  async initialize(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('FileSystem not available - photo features are disabled');
    }
    const dirInfo = await FileSystem.getInfoAsync(this.photosDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.photosDirectory, { intermediates: true });
    }
  }

  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(routineItem: string): Promise<PhotoRecord | null> {
    try {
      await this.initialize();

      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      // Save the photo to our directory
      const timestamp = Date.now();
      const filename = `${routineItem.replace(/\s+/g, '_')}_${timestamp}.jpg`;
      const destinationUri = `${this.photosDirectory}${filename}`;

      // Copy the file
      await FileSystem.copyAsync({
        from: result.assets[0].uri,
        to: destinationUri,
      });

      const record: PhotoRecord = {
        uri: destinationUri,
        timestamp,
        routineItem,
      };

      await this.savePhotoRecord(record);

      return record;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  /**
   * Pick a photo from the gallery
   */
  async pickPhoto(routineItem: string): Promise<PhotoRecord | null> {
    try {
      await this.initialize();

      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      // Save the photo to our directory
      const timestamp = Date.now();
      const filename = `${routineItem.replace(/\s+/g, '_')}_${timestamp}.jpg`;
      const destinationUri = `${this.photosDirectory}${filename}`;

      // Copy the file
      await FileSystem.copyAsync({
        from: result.assets[0].uri,
        to: destinationUri,
      });

      const record: PhotoRecord = {
        uri: destinationUri,
        timestamp,
        routineItem,
      };

      await this.savePhotoRecord(record);

      return record;
    } catch (error) {
      console.error('Error picking photo:', error);
      throw error;
    }
  }

  /**
   * Save photo record to AsyncStorage
   */
  private async savePhotoRecord(record: PhotoRecord): Promise<void> {
    try {
      const records = await this.getAllPhotoRecords();
      records.push(record);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving photo record:', error);
      throw error;
    }
  }

  /**
   * Get all photo records
   */
  async getAllPhotoRecords(): Promise<PhotoRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting photo records:', error);
      return [];
    }
  }

  /**
   * Get photo records for a specific routine item
   */
  async getPhotoRecordsForItem(routineItem: string): Promise<PhotoRecord[]> {
    const allRecords = await this.getAllPhotoRecords();
    return allRecords.filter((record) => record.routineItem === routineItem);
  }

  /**
   * Get the most recent photo for a routine item
   */
  async getMostRecentPhoto(routineItem: string): Promise<PhotoRecord | null> {
    const records = await this.getPhotoRecordsForItem(routineItem);
    if (records.length === 0) {
      return null;
    }

    // Sort by timestamp descending and return the most recent
    records.sort((a, b) => b.timestamp - a.timestamp);
    return records[0];
  }

  /**
   * Check if a photo exists for a routine item (taken today)
   */
  async hasPhotoForToday(routineItem: string): Promise<boolean> {
    const records = await this.getPhotoRecordsForItem(routineItem);
    if (records.length === 0) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    return records.some((record) => record.timestamp >= todayTimestamp);
  }

  /**
   * Delete a photo record and its file
   */
  async deletePhoto(record: PhotoRecord): Promise<void> {
    try {
      // Delete the file
      const fileInfo = await FileSystem.getInfoAsync(record.uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(record.uri);
      }

      // Remove from records
      const records = await this.getAllPhotoRecords();
      const updatedRecords = records.filter((r) => r.uri !== record.uri);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  /**
   * Delete all photos for a routine item
   */
  async deletePhotosForItem(routineItem: string): Promise<void> {
    const records = await this.getPhotoRecordsForItem(routineItem);
    for (const record of records) {
      await this.deletePhoto(record);
    }
  }

  /**
   * Delete old photos (older than specified days)
   */
  async deleteOldPhotos(daysOld: number = 7): Promise<number> {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    const records = await this.getAllPhotoRecords();
    const oldRecords = records.filter((record) => record.timestamp < cutoffTime);

    for (const record of oldRecords) {
      await this.deletePhoto(record);
    }

    return oldRecords.length;
  }

  /**
   * Get total storage used by photos (in bytes)
   */
  async getStorageUsed(): Promise<number> {
    try {
      const records = await this.getAllPhotoRecords();
      let totalSize = 0;

      for (const record of records) {
        const info = await FileSystem.getInfoAsync(record.uri);
        if (info.exists && info.size !== undefined) {
          totalSize += info.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating storage used:', error);
      return 0;
    }
  }

  /**
   * Check if camera is available
   */
  static async isCameraAvailable(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      return status === 'granted' || status === 'undetermined';
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }
}
