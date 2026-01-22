import { Linking, Alert, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

export class CalendarEmailService {
  /**
   * Request calendar permissions
   */
  static async requestCalendarPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  }

  /**
   * Open the device's calendar app
   */
  static async openCalendar(): Promise<boolean> {
    try {
      // On iOS, we can use the calendar URL scheme
      if (Platform.OS === 'ios') {
        const supported = await Linking.canOpenURL('calshow://');
        if (supported) {
          await Linking.openURL('calshow://');
          return true;
        }
      }

      // Fallback to opening calendar settings
      await Linking.openSettings();
      return true;
    } catch (error) {
      console.error('Error opening calendar:', error);
      Alert.alert(
        'Cannot Open Calendar',
        'Please open your calendar app manually to review your schedule.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  /**
   * Open the device's mail app
   */
  static async openMail(): Promise<boolean> {
    try {
      // Try to open default mail app
      const mailURL = Platform.OS === 'ios' ? 'message://' : 'mailto:';
      const supported = await Linking.canOpenURL(mailURL);

      if (supported) {
        await Linking.openURL(mailURL);
        return true;
      }

      // Fallback
      Alert.alert('Cannot Open Mail', 'Please open your mail app manually to check your emails.', [
        { text: 'OK' },
      ]);
      return false;
    } catch (error) {
      console.error('Error opening mail:', error);
      Alert.alert('Cannot Open Mail', 'Please open your mail app manually to check your emails.', [
        { text: 'OK' },
      ]);
      return false;
    }
  }

  /**
   * Check if calendar access is available
   */
  static async isCalendarAvailable(): Promise<boolean> {
    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      return status === 'granted' || status === 'undetermined';
    } catch (error) {
      console.error('Error checking calendar availability:', error);
      return false;
    }
  }

  /**
   * Get today's events count (requires permissions)
   */
  static async getTodayEventsCount(): Promise<number> {
    try {
      const hasPermission = await this.requestCalendarPermissions();
      if (!hasPermission) {
        return 0;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      if (calendars.length === 0) {
        return 0;
      }

      // Get events for today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const events = await Calendar.getEventsAsync(
        calendars.map((cal) => cal.id),
        startOfDay,
        endOfDay
      );

      return events.length;
    } catch (error) {
      console.error('Error getting today events:', error);
      return 0;
    }
  }
}
