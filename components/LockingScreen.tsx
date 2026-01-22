import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  BackHandler,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RoutineManager } from '../services/RoutineManager';
import { LockingService } from '../services/LockingService';
import { HistoryManager } from '../services/HistoryManager';
import RoutineChecklist from './RoutineChecklist';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
} from '../constants/theme';
interface LockingScreenProps {
  visible: boolean;
  routineManager: RoutineManager;
  lockingService: LockingService;
  historyManager: HistoryManager;
  onUnlock: () => void;
}

export default function LockingScreen({
  visible,
  routineManager,
  lockingService,
  historyManager,
  onUnlock,
}: LockingScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canEmergencyUnlock, setCanEmergencyUnlock] = useState(false);
  const [isRoutineComplete, setIsRoutineComplete] = useState(false);

  // Block Android back button
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Block back button while locked
      return true;
    });

    return () => backHandler.remove();
  }, [visible]);

  // Update emergency unlock timer
  useEffect(() => {
    if (!visible) return;

    const updateTimer = async () => {
      const remaining = await lockingService.getTimeUntilEmergencyUnlock();
      setTimeRemaining(remaining);

      const canUnlock = await lockingService.canEmergencyUnlock();
      setCanEmergencyUnlock(canUnlock);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [visible, lockingService]);

  // Check if routine is complete
  useEffect(() => {
    if (!visible) return;

    const checkCompletion = () => {
      const complete = routineManager.isRoutineComplete();
      setIsRoutineComplete(complete);

      if (complete) {
        handleRoutineComplete();
      }
    };

    checkCompletion();
    const interval = setInterval(checkCompletion, 500); // Check frequently

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, routineManager]);

  const handleRoutineComplete = async () => {
    try {
      // Record completion to history
      await routineManager.onRoutineCompleted(historyManager, true);

      // Unlock app
      await lockingService.unlockApp();

      // Notify parent
      setTimeout(() => {
        onUnlock();
      }, 1000); // Small delay to show completion state
    } catch (error) {
      console.error('Error completing routine:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const handleEmergencyUnlock = async () => {
    Alert.alert(
      '⚠️ Emergency Unlock',
      'Are you sure you want to emergency unlock? This will not count as completing your routine and may break your streak.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Emergency Unlock',
          style: 'destructive',
          onPress: async () => {
            try {
              await lockingService.emergencyUnlock();
              onUnlock();
            } catch {
              Alert.alert('Error', 'Emergency unlock is not yet available.');
            }
          },
        },
      ]
    );
  };

  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={() => {
        // Prevent closing
      }}
      presentationStyle="fullScreen"
    >
      <LinearGradient
        colors={isRoutineComplete ? (['#10B981', '#059669'] as const) : Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔒 Morning Routine Locked</Text>
          <Text style={styles.headerSubtitle}>
            {isRoutineComplete
              ? '🎉 Complete! Unlocking...'
              : `Complete your routine to unlock (${routineManager.getCompletedCount()}/${routineManager.getTotalCount()})`}
          </Text>
        </View>

        {/* Routine Checklist (embedded) */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.checklistContainer}>
            <RoutineChecklist routineManager={routineManager} />
          </View>
        </ScrollView>

        {/* Emergency Unlock Section */}
        <View style={styles.footer}>
          {canEmergencyUnlock ? (
            <TouchableOpacity
              style={[styles.emergencyButton, styles.emergencyButtonActive]}
              onPress={handleEmergencyUnlock}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emergencyButtonGradient}
              >
                <Text style={styles.emergencyButtonText}>⚠️ Emergency Unlock</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Emergency unlock available in</Text>
              <Text style={styles.timerText}>{formatTimeRemaining(timeRemaining)}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    color: Colors.neutral.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  checklistContainer: {
    backgroundColor: 'transparent',
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  timerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.neutral.white,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  timerText: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral.white,
    fontVariant: ['tabular-nums'],
  },
  emergencyButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  emergencyButtonActive: {
    opacity: 1,
  },
  emergencyButtonGradient: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.neutral.white,
  },
});
