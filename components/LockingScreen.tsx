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
import { RoutineManager } from '../services/RoutineManager';
import { LockingService } from '../services/LockingService';
import { HistoryManager } from '../services/HistoryManager';
import RoutineChecklist from './RoutineChecklist';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  FontFamilies,
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBorder}>
            <Text style={styles.headerTitle}>
              {isRoutineComplete ? 'Unlocked' : 'Locked'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isRoutineComplete
                ? 'All tasks complete'
                : `${routineManager.getCompletedCount()} of ${routineManager.getTotalCount()} tasks complete`}
            </Text>
          </View>
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
              style={styles.emergencyButton}
              onPress={handleEmergencyUnlock}
              activeOpacity={0.8}
            >
              <Text style={styles.emergencyButtonText}>Emergency Override</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Override available in</Text>
              <Text style={styles.timerText}>{formatTimeRemaining(timeRemaining)}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerBorder: {
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    backgroundColor: Colors.terminal.darkGray,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    color: Colors.terminal.cyan,
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
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.terminal.darkGray,
    padding: Spacing.md,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.terminal.cyan,
    marginBottom: Spacing.sm,
  },
  timerText: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontVariant: ['tabular-nums'],
  },
  emergencyButton: {
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.terminal.darkGray,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
  },
});
