import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RoutineManager } from '../services/RoutineManager';
import { RoutineItem, ROUTINE_ITEM_INFO } from '../types/RoutineItem';
import PushupTrackingScreen from './PushupTrackingScreen';
import PhotoCaptureScreen from './PhotoCaptureScreen';
import { CalendarEmailService } from '../services/CalendarEmailService';
import { MusicService } from '../services/MusicService';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
} from '../constants/theme';

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

    // If it's calendar/emails, open calendar and mail apps
    if (item === RoutineItem.CALENDAR_EMAILS) {
      Alert.alert(
        '📅 Calendar & Emails',
        'Open your calendar and email apps to review your schedule?',
        [
          {
            text: 'Open Calendar',
            onPress: async () => {
              await CalendarEmailService.openCalendar();
              // Mark as complete after opening
              await routineManager.markComplete(item);
              setRefreshKey((prev) => prev + 1);
            },
          },
          {
            text: 'Open Mail',
            onPress: async () => {
              await CalendarEmailService.openMail();
              // Mark as complete after opening
              await routineManager.markComplete(item);
              setRefreshKey((prev) => prev + 1);
            },
          },
          {
            text: 'Mark as Done',
            style: 'default',
            onPress: async () => {
              await routineManager.markComplete(item);
              setRefreshKey((prev) => prev + 1);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    // If it's music, show music app options
    if (item === RoutineItem.MUSIC) {
      Alert.alert('🎵 Music', 'Open your music app to start playing music?', [
        {
          text: 'Open Music App',
          onPress: async () => {
            await MusicService.openMusicApp();
            // Mark as complete after opening
            await routineManager.markComplete(item);
            setRefreshKey((prev) => prev + 1);
          },
        },
        {
          text: 'Mark as Done',
          style: 'default',
          onPress: async () => {
            await routineManager.markComplete(item);
            setRefreshKey((prev) => prev + 1);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
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

  const getItemGradient = (item: RoutineItem): readonly [string, string, ...string[]] => {
    switch (item) {
      case RoutineItem.PUSHUPS:
        return ['#EC4899', '#EF4444'] as const;
      case RoutineItem.COFFEE_BREAKFAST:
        return ['#F59E0B', '#EF4444'] as const;
      case RoutineItem.WATER:
        return ['#06B6D4', '#3B82F6'] as const;
      case RoutineItem.CALENDAR_EMAILS:
        return ['#8B5CF6', '#6366F1'] as const;
      case RoutineItem.MUSIC:
        return ['#A855F7', '#EC4899'] as const;
      default:
        return Gradients.primary;
    }
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isCompleted = routineManager.isCompleted(item);
        const info = ROUTINE_ITEM_INFO[item];
        const icon = getItemIcon(item);
        const gradient = getItemGradient(item);

        return (
          <TouchableOpacity
            key={item}
            style={[styles.item, isCompleted && styles.itemCompleted]}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isCompleted ? (['#10B981', '#059669'] as const) : gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.itemGradient}
            >
              <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                  <Text style={styles.itemIcon}>{icon}</Text>
                  {isCompleted && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkBadgeText}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.itemTitle, isCompleted && styles.itemTitleCompleted]}>
                    {item}
                  </Text>
                  <Text style={styles.itemDescription}>{info.description}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}

      <LinearGradient
        colors={
          routineManager.isRoutineComplete() ? (['#10B981', '#059669'] as const) : Gradients.primary
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.progressContainer}
      >
        <View style={styles.progressContent}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressCount}>
            {routineManager.getCompletedCount()} / {routineManager.getTotalCount()}
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
            <Text style={styles.completeText}>🎉 Amazing! All Done!</Text>
          )}
        </View>
      </LinearGradient>

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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  item: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  itemCompleted: {
    opacity: 0.9,
  },
  itemGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    position: 'relative',
  },
  itemIcon: {
    fontSize: 32,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  checkBadgeText: {
    fontSize: 14,
    color: Colors.accent.green,
    fontWeight: FontWeights.bold,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.neutral.white,
    marginBottom: Spacing.xs,
  },
  itemTitleCompleted: {
    opacity: 0.9,
  },
  itemDescription: {
    fontSize: FontSizes.sm,
    color: Colors.neutral.white,
    opacity: 0.85,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  progressContent: {
    padding: Spacing.lg,
  },
  progressLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral.white,
    opacity: 0.9,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressCount: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral.white,
    marginBottom: Spacing.md,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.full,
  },
  completeText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.neutral.white,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSizes.base,
    color: Colors.neutral.gray500,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
