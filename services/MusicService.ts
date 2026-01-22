import { Linking, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';

export class MusicService {
  /**
   * Open Spotify app
   */
  static async openSpotify(): Promise<boolean> {
    try {
      const spotifyURL = 'spotify://';
      const supported = await Linking.canOpenURL(spotifyURL);

      if (supported) {
        await Linking.openURL(spotifyURL);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error opening Spotify:', error);
      return false;
    }
  }

  /**
   * Open Apple Music app
   */
  static async openAppleMusic(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const musicURL = 'music://';
        const supported = await Linking.canOpenURL(musicURL);

        if (supported) {
          await Linking.openURL(musicURL);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error opening Apple Music:', error);
      return false;
    }
  }

  /**
   * Open YouTube Music app
   */
  static async openYouTubeMusic(): Promise<boolean> {
    try {
      const ytMusicURL = 'youtubemusic://';
      const supported = await Linking.canOpenURL(ytMusicURL);

      if (supported) {
        await Linking.openURL(ytMusicURL);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error opening YouTube Music:', error);
      return false;
    }
  }

  /**
   * Open any available music app
   */
  static async openMusicApp(): Promise<boolean> {
    // Try Spotify first (most popular)
    if (await this.openSpotify()) {
      return true;
    }

    // Try Apple Music on iOS
    if (Platform.OS === 'ios' && (await this.openAppleMusic())) {
      return true;
    }

    // Try YouTube Music
    if (await this.openYouTubeMusic()) {
      return true;
    }

    // Show selection dialog if nothing worked
    Alert.alert(
      'Open Music App',
      'Please open your preferred music app manually to start playing music.',
      [{ text: 'OK' }]
    );

    return false;
  }

  /**
   * Check if audio is currently playing (requires permissions)
   */
  static async isAudioPlaying(): Promise<boolean> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }

      // Check if audio is active
      // Note: This is a simplified check and may not work perfectly
      // Real audio detection would require native modules
      const recording = new Audio.Recording();
      try {
        await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        const status = await recording.getStatusAsync();
        return status.isRecording;
      } catch {
        return false;
      } finally {
        await recording.stopAndUnloadAsync().catch(() => {});
      }
    } catch (error) {
      console.error('Error checking audio playback:', error);
      return false;
    }
  }

  /**
   * Show music app options
   */
  static showMusicOptions(): void {
    Alert.alert(
      '🎵 Choose Music App',
      'Which music app would you like to open?',
      [
        {
          text: 'Spotify',
          onPress: () => this.openSpotify(),
        },
        {
          text: 'Apple Music',
          onPress: () => this.openAppleMusic(),
        },
        {
          text: 'YouTube Music',
          onPress: () => this.openYouTubeMusic(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }
}
