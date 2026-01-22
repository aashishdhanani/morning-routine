import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SettingsManager,
  AppSettings,
  DaySchedule,
  ResetBehavior,
} from '../services/SettingsManager';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
} from '../constants/theme';

interface SettingsScreenProps {
  visible: boolean;
  settingsManager: SettingsManager;
  onClose: () => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsScreen({ visible, settingsManager, onClose }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadSettings = async () => {
    const loadedSettings = await settingsManager.loadSettings();
    setSettings(loadedSettings);
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      await settingsManager.saveSettings(settings);
      setHasChanges(false);
      Alert.alert('Success', 'Settings saved successfully!');
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before closing?',
        [
          { text: 'Discard', style: 'destructive', onPress: onClose },
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: handleSave },
        ]
      );
    } else {
      onClose();
    }
  };

  const updateDaySchedule = (day: number, schedule: Partial<DaySchedule>) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      schedule: {
        ...settings.schedule,
        [day]: {
          ...settings.schedule[day],
          ...schedule,
        },
      },
    };

    setSettings(updatedSettings);
    setHasChanges(true);
  };

  const updateResetBehavior = (behavior: ResetBehavior) => {
    if (!settings) return;

    setSettings({
      ...settings,
      resetBehavior: behavior,
    });
    setHasChanges(true);
  };

  const updateEmergencyDelay = (minutes: number) => {
    if (!settings) return;

    setSettings({
      ...settings,
      emergencyUnlockDelay: Math.max(1, Math.min(30, minutes)),
    });
    setHasChanges(true);
  };

  const toggleLocking = (enabled: boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      lockingEnabled: enabled,
    });
    setHasChanges(true);
  };

  if (!settings) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Global Locking Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locking</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable App Locking</Text>
                <Text style={styles.settingDescription}>
                  Lock app until routine is complete during morning hours
                </Text>
              </View>
              <Switch
                value={settings.lockingEnabled}
                onValueChange={toggleLocking}
                trackColor={{ false: Colors.neutral.gray400, true: Colors.accent.green }}
                thumbColor={Colors.neutral.white}
              />
            </View>
          </View>

          {/* Schedule Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <Text style={styles.sectionDescription}>
              Configure when your routine is active each day
            </Text>

            {DAY_NAMES.map((dayName, index) => {
              const schedule = settings.schedule[index];
              return (
                <View key={index} style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{dayName}</Text>
                    <Switch
                      value={schedule.enabled}
                      onValueChange={(enabled) => updateDaySchedule(index, { enabled })}
                      trackColor={{ false: Colors.neutral.gray400, true: Colors.accent.green }}
                      thumbColor={Colors.neutral.white}
                    />
                  </View>

                  {schedule.enabled && (
                    <View style={styles.dayTimes}>
                      <View style={styles.timeGroup}>
                        <Text style={styles.timeLabel}>Start</Text>
                        <Text style={styles.timeValue}>{schedule.startTime}</Text>
                      </View>
                      <Text style={styles.timeSeparator}>→</Text>
                      <View style={styles.timeGroup}>
                        <Text style={styles.timeLabel}>End</Text>
                        <Text style={styles.timeValue}>{schedule.endTime}</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Reset Behavior */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Reset</Text>
            <Text style={styles.sectionDescription}>When should the routine reset each day?</Text>

            <TouchableOpacity
              style={[
                styles.optionCard,
                settings.resetBehavior === 'midnight' && styles.optionCardSelected,
              ]}
              onPress={() => updateResetBehavior('midnight')}
            >
              <View style={styles.radioButton}>
                {settings.resetBehavior === 'midnight' && <View style={styles.radioButtonInner} />}
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Midnight (00:00)</Text>
                <Text style={styles.optionDescription}>Reset at 12:00 AM every day</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                settings.resetBehavior === 'morning' && styles.optionCardSelected,
              ]}
              onPress={() => updateResetBehavior('morning')}
            >
              <View style={styles.radioButton}>
                {settings.resetBehavior === 'morning' && <View style={styles.radioButtonInner} />}
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Morning Window Start</Text>
                <Text style={styles.optionDescription}>
                  Reset when your morning routine window begins
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Emergency Unlock Delay */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Unlock</Text>
            <Text style={styles.sectionDescription}>
              Time before emergency unlock becomes available
            </Text>

            <View style={styles.sliderCard}>
              <Text style={styles.sliderValue}>{settings.emergencyUnlockDelay} minutes</Text>
              <View style={styles.sliderButtons}>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => updateEmergencyDelay(settings.emergencyUnlockDelay - 1)}
                >
                  <Text style={styles.sliderButtonText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => updateEmergencyDelay(settings.emergencyUnlockDelay + 1)}
                >
                  <Text style={styles.sliderButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FontSizes.xxl,
    color: Colors.neutral.white,
    fontWeight: FontWeights.bold,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral.white,
  },
  saveButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
  },
  saveButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.neutral.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: FontSizes.sm,
    color: Colors.neutral.gray600,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: FontSizes.sm,
    color: Colors.neutral.gray600,
    lineHeight: 18,
  },
  dayCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral.gray900,
  },
  dayTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  timeGroup: {
    flex: 1,
  },
  timeLabel: {
    fontSize: FontSizes.xs,
    color: Colors.neutral.gray600,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.neutral.gray900,
    fontVariant: ['tabular-nums'],
  },
  timeSeparator: {
    fontSize: FontSizes.xl,
    color: Colors.neutral.gray400,
    marginHorizontal: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  optionCardSelected: {
    borderColor: Colors.accent.purple,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.neutral.gray400,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent.purple,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: FontSizes.sm,
    color: Colors.neutral.gray600,
    lineHeight: 18,
  },
  sliderCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  sliderValue: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sliderButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent.purple,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  sliderButtonText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.neutral.white,
  },
});
