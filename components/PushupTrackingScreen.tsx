import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import {
  PushupTracker,
  PushupState,
  PushupPhase,
  type PushupData,
} from '../services/PushupTracker';

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
        return 'Going down...';
      case PushupPhase.BOTTOM:
        return 'At bottom';
      case PushupPhase.ASCENDING:
        return 'Coming up...';
      default:
        return 'Ready';
    }
  };

  const getInstructions = (): string => {
    if (data.state === PushupState.IDLE) {
      return 'Place your phone on your back and start tracking when ready.';
    }
    if (data.state === PushupState.COMPLETED) {
      return 'Great job! You completed 20 pushups!';
    }
    return 'Keep going! The phone will track your movement.';
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pushup Tracking</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.countContainer}>
            <Text style={styles.countLabel}>Pushups</Text>
            <Text style={styles.count}>
              {data.count} / {data.targetCount}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${(data.count / data.targetCount) * 100}%` }]}
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
                ⚠️ This feature requires a physical device with motion sensors
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  countLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  count: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 40,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 6,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  status: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  warningContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
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
  startButton: {
    backgroundColor: '#4caf50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  resetButton: {
    backgroundColor: '#ff9800',
  },
  completeButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
