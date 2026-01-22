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
        return 'READY';
      case PushupPhase.DESCENDING:
        return 'DESCENDING...';
      case PushupPhase.BOTTOM:
        return 'AT_BOTTOM';
      case PushupPhase.ASCENDING:
        return 'ASCENDING...';
      default:
        return 'READY';
    }
  };

  const getInstructions = (): string => {
    if (data.state === PushupState.IDLE) {
      return '> Place phone on your back and start tracking';
    }
    if (data.state === PushupState.COMPLETED) {
      return '> TARGET_COMPLETE: 20 pushups';
    }
    return '> TRACKING: Phone monitoring movement';
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>$ PUSHUP_TRACKER</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>[X]</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.countContainer}>
            <Text style={styles.countLabel}>$ REPS_COMPLETE:</Text>
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
            <Text style={styles.statusLabel}>$ STATUS:</Text>
            <Text style={styles.status}>{getPhaseText()}</Text>
          </View>

          <Text style={styles.instructions}>{getInstructions()}</Text>

          {!sensorsAvailable && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                [!] REQUIRES: Physical device with motion sensors
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
              <Text style={styles.buttonText}>START_TRACKING</Text>
            </TouchableOpacity>
          )}

          {data.state === PushupState.TRACKING && (
            <>
              <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
                <Text style={styles.buttonText}>STOP</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
                <Text style={styles.buttonText}>RESET</Text>
              </TouchableOpacity>
            </>
          )}

          {data.state === PushupState.COMPLETED && (
            <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={handleClose}>
              <Text style={styles.buttonText}>DONE</Text>
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
    borderBottomColor: Colors.terminal.green,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
  },
  closeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.terminal.red,
    borderRadius: BorderRadius.sm,
  },
  closeButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.terminal.red,
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.bold,
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
    borderWidth: 2,
    borderColor: Colors.terminal.green,
    backgroundColor: Colors.terminal.darkGray,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    width: '100%',
  },
  countLabel: {
    fontSize: FontSizes.base,
    color: Colors.terminal.cyan,
    marginBottom: Spacing.md,
    fontFamily: FontFamilies.mono,
  },
  count: {
    fontSize: 64,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
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
    color: Colors.terminal.amber,
    marginBottom: Spacing.sm,
    fontFamily: FontFamilies.mono,
  },
  status: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
  },
  instructions: {
    fontSize: FontSizes.sm,
    color: Colors.terminal.cyan,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
    fontFamily: FontFamilies.mono,
  },
  warningContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.terminal.darkGray,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.terminal.amber,
  },
  warningText: {
    fontSize: FontSizes.sm,
    color: Colors.terminal.amber,
    textAlign: 'center',
    fontFamily: FontFamilies.mono,
  },
  controls: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    borderWidth: 2,
  },
  startButton: {
    backgroundColor: 'rgba(0, 215, 135, 0.1)',
    borderColor: Colors.terminal.green,
  },
  stopButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: Colors.terminal.red,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 180, 84, 0.1)',
    borderColor: Colors.terminal.amber,
  },
  completeButton: {
    backgroundColor: 'rgba(0, 215, 135, 0.1)',
    borderColor: Colors.terminal.green,
  },
  buttonText: {
    color: Colors.terminal.green,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    fontFamily: FontFamilies.mono,
  },
});
