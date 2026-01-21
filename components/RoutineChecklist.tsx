import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RoutineManager } from '../services/RoutineManager';
import { RoutineItem, ROUTINE_ITEM_INFO } from '../types/RoutineItem';
import PushupTrackingScreen from './PushupTrackingScreen';
import PhotoCaptureScreen from './PhotoCaptureScreen';

interface RoutineChecklistProps {
  routineManager: RoutineManager;
}

export default function RoutineChecklist({ routineManager }: RoutineChecklistProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPushupTracker, setShowPushupTracker] = useState(false);
  const [photoItem, setPhotoItem] = useState<RoutineItem | null>(null);
  const items = routineManager.getAllItems();

  useEffect(() => {
    const loadRoutineState = async () => {
      await routineManager.loadState();
      setIsLoading(false);
      setRefreshKey((prev) => prev + 1); // Force re-render after load
    };
    loadRoutineState();
  }, [routineManager]);

  const handleItemPress = async (item: RoutineItem) => {
    // If it's pushups, show the tracking screen
    if (item === RoutineItem.PUSHUPS) {
      setShowPushupTracker(true);
      return;
    }

    // If it's coffee/breakfast or water, show photo capture
    if (item === RoutineItem.COFFEE_BREAKFAST || item === RoutineItem.WATER) {
      setPhotoItem(item);
      return;
    }

    // For other items, just toggle
    await routineManager.toggleItem(item);
    setRefreshKey((prev) => prev + 1); // Force re-render
  };

  const handlePushupComplete = async () => {
    await routineManager.markComplete(RoutineItem.PUSHUPS);
    setRefreshKey((prev) => prev + 1);
  };

  const handlePhotoTaken = async () => {
    if (photoItem) {
      await routineManager.markComplete(photoItem);
      setRefreshKey((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading routine...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isCompleted = routineManager.isCompleted(item);
        const info = ROUTINE_ITEM_INFO[item];

        return (
          <TouchableOpacity
            key={item}
            style={[styles.item, isCompleted && styles.itemCompleted]}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                  {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.itemTitle, isCompleted && styles.itemTitleCompleted]}>
                  {item}
                </Text>
                <Text style={styles.itemDescription}>{info.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {routineManager.getCompletedCount()} of {routineManager.getTotalCount()} completed
        </Text>
        {routineManager.isRoutineComplete() && (
          <Text style={styles.completeText}>🎉 Routine Complete!</Text>
        )}
      </View>

      <PushupTrackingScreen
        visible={showPushupTracker}
        onClose={() => setShowPushupTracker(false)}
        onComplete={handlePushupComplete}
      />

      {photoItem && (
        <PhotoCaptureScreen
          visible={photoItem !== null}
          routineItem={photoItem}
          onClose={() => setPhotoItem(null)}
          onPhotoTaken={handlePhotoTaken}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  item: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  itemCompleted: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  completeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
