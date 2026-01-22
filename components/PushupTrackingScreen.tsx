import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import {
  PushupTracker,
  PushupState,
  PushupPhase,
  type PushupData,
} from '../services/PushupTracker';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  FontFamilies,
} from '../constants/theme';

interface PushupTrackingScreenProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function PushupTrackingScreen({
  visible,
  onClose,
  onComplete,
}: PushupTrackingScreenProps) {
  const [tracker] = useState(() => new PushupTracker({ targetCount: 20 }));
  const [data, setData] = useState<PushupData>(tracker.getData());
  const [sensorsAvailable, setSensorsAvailable] = useState(true);

  useEffect(() => {
    // Check sensor availability when component mounts
    const checkSensors = async () => {
      const availability = await PushupTracker.checkAvailability();
      if (!availability.accelerometer) {
        setSensorsAvailable(false);
        Alert.alert(
          'Sensors Not Available',
          'Accelerometer is required for pushup tracking. This feature requires a physical device.',
          [{ text: 'OK' }]
        );
      }
    };

    if (visible) {
      checkSensors();
    }
  }, [visible]);

  useEffect(() => {
    // Clean up tracker when component unmounts
    return () => {
      tracker.stop();
    };
  }, [tracker]);

  const handleStart = async () => {
    if (!sensorsAvailable) {
      Alert.alert('Sensors Not Available', 'Cannot start tracking without accelerometer support.', [
        { text: 'OK' },
      ]);
      return;
    }

    try {
      const hasPermission = await PushupTracker.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Motion sensor permission is required.', [{ text: 'OK' }]);
        return;
      }

      await tracker.start((updatedData) => {
        setData(updatedData);

        // Auto-complete when target reached
        if (updatedData.state === PushupState.COMPLETED) {
          setTimeout(() => {
            onComplete();
            handleClose();
          }, 1000);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start pushup tracking. Please try again.', [{ text: 'OK' }]);
      console.error('Error starting pushup tracking:', error);
    }
  };

  const handleStop = () => {
    tracker.stop();
    setData(tracker.getData());
  };

  const handleReset = () => {
    tracker.reset();
    setData(tracker.getData());
  };

  const handleClose = () => {
    tracker.stop();
    setData(tracker.getData());
    onClose();
  };

  const getPhaseText = (): string => {
    switch (data.phase) {
      case PushupPhase.NEUTRAL:
        return 'Ready';
      case PushupPhase.DESCENDING:
        return 'Descending';
      case PushupPhase.BOTTOM:
        return 'At bottom';
      case PushupPhase.ASCENDING:
        return 'Ascending';
      default:
        return 'Ready';
    }
  };

  const getInstructions = (): string => {
    if (data.state === PushupState.IDLE) {
      return 'Place phone on your back and start tracking';
    }
    if (data.state === PushupState.COMPLETED) {
      return 'Target complete: 20 pushups';
    }
    return 'Tracking your movement';
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pushup Tracker</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.countContainer}>
            <Text style={styles.countLabel}>Reps Complete</Text>
            <Text style={styles.count}>
              {data.count} / {data.targetCount}
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${(data.count / data.targetCount) * 100}%` }]}
            />
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.status}>{getPhaseText()}</Text>
          </View>

          <Text style={styles.instructions}>{getInstructions()}</Text>

          {!sensorsAvailable && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                Requires physical device with motion sensors
              </Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          {data.state === PushupState.IDLE && (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStart}
              disabled={!sensorsAvailable}
            >
              <Text style={styles.buttonText}>Start Tracking</Text>
            </TouchableOpacity>
          )}

          {data.state === PushupState.TRACKING && (
            <>
              <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            </>
          )}

          {data.state === PushupState.COMPLETED && (
            <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={handleClose}>
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
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.terminal.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: Colors.terminal.gray,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeButtonText: {
    fontSize: 28,
    color: Colors.terminal.cyan,
    fontWeight: FontWeights.normal,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    backgroundColor: Colors.terminal.darkGray,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    width: '100%',
  },
  countLabel: {
    fontSize: FontSizes.base,
    color: Colors.terminal.cyan,
    marginBottom: Spacing.md,
    fontWeight: FontWeights.medium,
  },
  count: {
    fontSize: 64,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontVariant: ['tabular-nums'],
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.terminal.gray,
    borderRadius: 0,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.terminal.green,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    backgroundColor: Colors.terminal.darkGray,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    width: '100%',
  },
  statusLabel: {
    fontSize: FontSizes.sm,
    color: Colors.terminal.cyan,
    marginBottom: Spacing.sm,
    fontWeight: FontWeights.medium,
  },
  status: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
  },
  instructions: {
    fontSize: FontSizes.sm,
    color: Colors.terminal.cyan,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
  },
  warningContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.terminal.darkGray,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
  },
  warningText: {
    fontSize: FontSizes.sm,
    color: Colors.terminal.cyan,
    textAlign: 'center',
  },
  controls: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  startButton: {
    backgroundColor: Colors.terminal.darkGray,
    borderColor: Colors.terminal.green,
  },
  stopButton: {
    backgroundColor: Colors.terminal.darkGray,
    borderColor: Colors.terminal.gray,
  },
  resetButton: {
    backgroundColor: Colors.terminal.darkGray,
    borderColor: Colors.terminal.gray,
  },
  completeButton: {
    backgroundColor: Colors.terminal.darkGray,
    borderColor: Colors.terminal.green,
  },
  buttonText: {
    color: Colors.terminal.green,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
  },
});
