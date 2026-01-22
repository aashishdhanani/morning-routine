import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RoutineManager } from '../services/RoutineManager';
import { RoutineItem, ROUTINE_ITEM_INFO } from '../types/RoutineItem';
import { HistoryManager } from '../services/HistoryManager';
import PushupTrackingScreen from './PushupTrackingScreen';
// Temporarily disabled due to expo-file-system compatibility issues in Expo Go
// import PhotoCaptureScreen from './PhotoCaptureScreen';
import HistoryCard from './HistoryCard';
// CalendarEmailService and MusicService removed - calendar and music are now simple checkboxes
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
  FontFamilies,
} from '../constants/theme';

interface RoutineChecklistProps {
  routineManager: RoutineManager;
  historyManager?: HistoryManager;
}

export default function RoutineChecklist({
  routineManager,
  historyManager,
}: RoutineChecklistProps) {
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

    // Calendar, emails, and music are now simple yes/no checkboxes
    // No special behavior - just toggle completion like other items

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

  const getItemIcon = (item: RoutineItem): string => {
    switch (item) {
      case RoutineItem.PUSHUPS:
        return '💪';
      case RoutineItem.COFFEE_BREAKFAST:
        return '☕';
      case RoutineItem.WATER:
        return '💧';
      case RoutineItem.CALENDAR_EMAILS:
        return '📅';
      case RoutineItem.MUSIC:
        return '🎵';
      default:
        return '✅';
    }
  };


  return (
    <View style={styles.container}>
      {/* History Card with Streak */}
      {historyManager && <HistoryCard historyManager={historyManager} />}

      {items.map((item, index) => {
        const isCompleted = routineManager.isCompleted(item);
        const info = ROUTINE_ITEM_INFO[item];
        const icon = getItemIcon(item);

        return (
          <TouchableOpacity
            key={item}
            style={[
              styles.item,
              isCompleted && styles.itemCompleted,
            ]}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.itemContent}>
              <Text style={styles.checkbox}>{isCompleted ? '[✓]' : '[ ]'}</Text>
              <View style={styles.textContainer}>
                <Text style={[styles.itemTitle, isCompleted && styles.itemTitleCompleted]}>
                  {icon} {item.toUpperCase().replace(/ /g, '_')}
                </Text>
                <Text style={styles.itemDescription}>{'>'} {info.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={styles.progressContainer}>
        <View style={styles.progressContent}>
          <Text style={styles.progressLabel}>
            $ PROGRESS: {routineManager.getCompletedCount()}/{routineManager.getTotalCount()} TASKS_COMPLETE
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${(routineManager.getCompletedCount() / routineManager.getTotalCount()) * 100}%`,
                },
              ]}
            />
          </View>
          {routineManager.isRoutineComplete() && (
            <Text style={styles.completeText}>{'>'} STATUS: ALL_SYSTEMS_OPERATIONAL</Text>
          )}
        </View>
      </View>

      <PushupTrackingScreen
        visible={showPushupTracker}
        onClose={() => setShowPushupTracker(false)}
        onComplete={handlePushupComplete}
      />

      {/* Temporarily disabled due to expo-file-system compatibility issues in Expo Go */}
      {/* {photoItem && (
        <PhotoCaptureScreen
          visible={photoItem !== null}
          routineItem={photoItem}
          onClose={() => setPhotoItem(null)}
          onPhotoTaken={handlePhotoTaken}
        />
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  item: {
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.terminal.darkGray,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  itemCompleted: {
    borderColor: Colors.terminal.green,
    backgroundColor: 'rgba(0, 215, 135, 0.05)',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    fontSize: FontSizes.lg,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.xs,
  },
  itemTitleCompleted: {
    color: Colors.terminal.brightGreen,
  },
  itemDescription: {
    fontSize: FontSizes.sm,
    color: Colors.terminal.cyan,
    fontFamily: FontFamilies.mono,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.terminal.green,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.terminal.darkGray,
  },
  progressContent: {
    padding: Spacing.md,
  },
  progressLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    color: Colors.terminal.amber,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.md,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.terminal.gray,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.terminal.green,
  },
  completeText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    color: Colors.terminal.brightGreen,
    fontFamily: FontFamilies.mono,
    marginTop: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mono,
    color: Colors.neutral.gray500,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
