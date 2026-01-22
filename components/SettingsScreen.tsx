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
import {
  SettingsManager,
  AppSettings,
  DaySchedule,
  ResetBehavior,
} from '../services/SettingsManager';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  FontFamilies,
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>[X]</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>$ CONFIG</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Global Locking Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>$ LOCKING_CONFIG:</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>ENABLE_LOCK</Text>
                <Text style={styles.settingDescription}>
                  {'>'} Lock system until tasks complete
                </Text>
              </View>
              <Switch
                value={settings.lockingEnabled}
                onValueChange={toggleLocking}
                trackColor={{ false: Colors.terminal.gray, true: Colors.terminal.green }}
                thumbColor={Colors.terminal.brightGreen}
              />
            </View>
          </View>

          {/* Schedule Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>$ SCHEDULE_CONFIG:</Text>
            <Text style={styles.sectionDescription}>
              {'>'} Set active hours per day
            </Text>

            {DAY_NAMES.map((dayName, index) => {
              const schedule = settings.schedule[index];
              return (
                <View key={index} style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{dayName.toUpperCase()}</Text>
                    <Switch
                      value={schedule.enabled}
                      onValueChange={(enabled) => updateDaySchedule(index, { enabled })}
                      trackColor={{ false: Colors.terminal.gray, true: Colors.terminal.green }}
                      thumbColor={Colors.terminal.brightGreen}
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
            <Text style={styles.sectionTitle}>$ RESET_TIME:</Text>
            <Text style={styles.sectionDescription}>{'>'} When to reset tasks</Text>

            <TouchableOpacity
              style={[
                styles.optionCard,
                settings.resetBehavior === 'midnight' && styles.optionCardSelected,
              ]}
              onPress={() => updateResetBehavior('midnight')}
            >
              <Text style={styles.radioButton}>
                {settings.resetBehavior === 'midnight' ? '[●]' : '[ ]'}
              </Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>MIDNIGHT (00:00)</Text>
                <Text style={styles.optionDescription}>{'>'} Reset at 12:00 AM daily</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                settings.resetBehavior === 'morning' && styles.optionCardSelected,
              ]}
              onPress={() => updateResetBehavior('morning')}
            >
              <Text style={styles.radioButton}>
                {settings.resetBehavior === 'morning' ? '[●]' : '[ ]'}
              </Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>MORNING_START</Text>
                <Text style={styles.optionDescription}>
                  {'>'} Reset when window begins
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Emergency Unlock Delay */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>$ OVERRIDE_DELAY:</Text>
            <Text style={styles.sectionDescription}>
              {'>'} Time before emergency override
            </Text>

            <View style={styles.sliderCard}>
              <Text style={styles.sliderValue}>{settings.emergencyUnlockDelay} MIN</Text>
              <View style={styles.sliderButtons}>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => updateEmergencyDelay(settings.emergencyUnlockDelay - 1)}
                >
                  <Text style={styles.sliderButtonText}>[-]</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => updateEmergencyDelay(settings.emergencyUnlockDelay + 1)}
                >
                  <Text style={styles.sliderButtonText}>[+]</Text>
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
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.terminal.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: Colors.terminal.green,
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
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
  },
  saveButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.terminal.green,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(0, 215, 135, 0.1)',
  },
  saveButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
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
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.cyan,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: FontSizes.sm,
    color: Colors.terminal.amber,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.terminal.darkGray,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: FontSizes.xs,
    color: Colors.terminal.cyan,
    fontFamily: FontFamilies.mono,
    lineHeight: 16,
  },
  dayCard: {
    backgroundColor: Colors.terminal.darkGray,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
  },
  dayTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.terminal.gray,
  },
  timeGroup: {
    flex: 1,
  },
  timeLabel: {
    fontSize: FontSizes.xs,
    color: Colors.terminal.cyan,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.xs,
  },
  timeValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
    fontVariant: ['tabular-nums'],
  },
  timeSeparator: {
    fontSize: FontSizes.lg,
    color: Colors.terminal.amber,
    fontFamily: FontFamilies.mono,
    marginHorizontal: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.terminal.darkGray,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
  },
  optionCardSelected: {
    borderColor: Colors.terminal.green,
    backgroundColor: 'rgba(0, 215, 135, 0.05)',
  },
  radioButton: {
    fontSize: FontSizes.base,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: FontSizes.xs,
    color: Colors.terminal.cyan,
    fontFamily: FontFamilies.mono,
    lineHeight: 16,
  },
  sliderCard: {
    backgroundColor: Colors.terminal.darkGray,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.md,
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sliderButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.terminal.green,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(0, 215, 135, 0.1)',
  },
  sliderButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
  },
});
