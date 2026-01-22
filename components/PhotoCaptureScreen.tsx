import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PhotoVerification, type PhotoRecord } from '../services/PhotoVerification';

interface PhotoCaptureScreenProps {
  visible: boolean;
  routineItem: string;
  onClose: () => void;
  onPhotoTaken: () => void;
}

export default function PhotoCaptureScreen({
  visible,
  routineItem,
  onClose,
  onPhotoTaken,
}: PhotoCaptureScreenProps) {
  const [photoService] = useState(() => new PhotoVerification());
  const [currentPhoto, setCurrentPhoto] = useState<PhotoRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasTodayPhoto, setHasTodayPhoto] = useState(false);

  useEffect(() => {
    if (visible) {
      loadExistingPhoto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, routineItem]);

  const loadExistingPhoto = async () => {
    if (!photoService.isAvailable()) {
      console.warn('Photo service not available');
      return;
    }
    try {
      setIsLoading(true);
      const mostRecent = await photoService.getMostRecentPhoto(routineItem);
      const hasToday = await photoService.hasPhotoForToday(routineItem);

      setCurrentPhoto(mostRecent);
      setHasTodayPhoto(hasToday);
    } catch (error) {
      console.error('Error loading existing photo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    if (!photoService.isAvailable()) {
      Alert.alert('Not Available', 'Photo features are not available in this environment.', [
        { text: 'OK' },
      ]);
      return;
    }
    try {
      setIsLoading(true);

      const hasPermission = await photoService.requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.', [
          { text: 'OK' },
        ]);
        return;
      }

      const photo = await photoService.takePhoto(routineItem);

      if (photo) {
        setCurrentPhoto(photo);
        setHasTodayPhoto(true);
        onPhotoTaken();

        Alert.alert('Success', 'Photo captured successfully!', [{ text: 'OK' }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.', [{ text: 'OK' }]);
      console.error('Error taking photo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickPhoto = async () => {
    if (!photoService.isAvailable()) {
      Alert.alert('Not Available', 'Photo features are not available in this environment.', [
        { text: 'OK' },
      ]);
      return;
    }
    try {
      setIsLoading(true);

      const hasPermission = await photoService.requestMediaLibraryPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to select photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const photo = await photoService.pickPhoto(routineItem);

      if (photo) {
        setCurrentPhoto(photo);
        setHasTodayPhoto(true);
        onPhotoTaken();

        Alert.alert('Success', 'Photo selected successfully!', [{ text: 'OK' }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.', [{ text: 'OK' }]);
      console.error('Error picking photo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentPhoto) return;

    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoading(true);
            await photoService.deletePhoto(currentPhoto);
            setCurrentPhoto(null);
            setHasTodayPhoto(false);
            await loadExistingPhoto();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete photo.', [{ text: 'OK' }]);
            console.error('Error deleting photo:', error);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{routineItem}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4caf50" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {currentPhoto ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: currentPhoto.uri }} style={styles.photoPreview} />
                  <Text style={styles.photoTimestamp}>
                    {formatTimestamp(currentPhoto.timestamp)}
                  </Text>
                  {hasTodayPhoto && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>✓ Verified Today</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noPhotoContainer}>
                  <Text style={styles.noPhotoIcon}>📷</Text>
                  <Text style={styles.noPhotoText}>No photo taken yet</Text>
                  <Text style={styles.instructionText}>
                    Take a photo to verify this routine item
                  </Text>
                </View>
              )}

              <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>Instructions:</Text>
                <Text style={styles.instructionText}>
                  • Take a clear photo showing {routineItem.toLowerCase()}
                </Text>
                <Text style={styles.instructionText}>
                  • Photo will be stored locally on your device
                </Text>
                <Text style={styles.instructionText}>• You can retake the photo anytime</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.cameraButton]}
            onPress={handleTakePhoto}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>📷 Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.galleryButton]}
            onPress={handlePickPhoto}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>

          {currentPhoto && (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDeletePhoto}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>🗑️ Delete Photo</Text>
            </TouchableOpacity>
          )}

          {hasTodayPhoto && (
            <TouchableOpacity style={[styles.button, styles.doneButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  photoContainer: {
    marginBottom: 24,
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  photoTimestamp: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  todayBadge: {
    marginTop: 12,
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  todayBadgeText: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 14,
  },
  noPhotoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  noPhotoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  noPhotoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructions: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
  },
  controls: {
    padding: 20,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#4caf50',
  },
  galleryButton: {
    backgroundColor: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  doneButton: {
    backgroundColor: '#9c27b0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
