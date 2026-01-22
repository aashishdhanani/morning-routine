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
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [showTimePicker, setShowTimePicker] = useState<{
    day: number;
    type: 'start' | 'end';
  } | null>(null);

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

  const parseTimeString = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(null);
    }

    if (event.type === 'dismissed' || !selectedDate || !showTimePicker) {
      if (Platform.OS === 'android') {
        setShowTimePicker(null);
      }
      return;
    }

    const timeStr = formatTimeString(selectedDate);
    const { day, type } = showTimePicker;

    updateDaySchedule(day, {
      [type === 'start' ? 'startTime' : 'endTime']: timeStr,
    });

    if (Platform.OS === 'ios') {
      // On iOS, keep picker open until user taps outside
    } else {
      setShowTimePicker(null);
    }
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
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Global Locking Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locking</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Lock</Text>
                <Text style={styles.settingDescription}>
                  Lock system until tasks complete
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
            <Text style={styles.sectionTitle}>Schedule</Text>
            <Text style={styles.sectionDescription}>
              Set active hours per day
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
                      <TouchableOpacity
                        style={styles.timeGroup}
                        onPress={() => setShowTimePicker({ day: index, type: 'start' })}
                      >
                        <Text style={styles.timeLabel}>Start</Text>
                        <Text style={styles.timeValue}>{schedule.startTime}</Text>
                      </TouchableOpacity>
                      <Text style={styles.timeSeparator}>→</Text>
                      <TouchableOpacity
                        style={styles.timeGroup}
                        onPress={() => setShowTimePicker({ day: index, type: 'end' })}
                      >
                        <Text style={styles.timeLabel}>End</Text>
                        <Text style={styles.timeValue}>{schedule.endTime}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Reset Behavior */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reset Time</Text>
            <Text style={styles.sectionDescription}>When to reset tasks</Text>

            <TouchableOpacity
              style={[
                styles.optionCard,
                settings.resetBehavior === 'midnight' && styles.optionCardSelected,
              ]}
              onPress={() => updateResetBehavior('midnight')}
            >
              <View style={styles.radioButton}>
                {settings.resetBehavior === 'midnight' && <View style={styles.radioDot} />}
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Midnight</Text>
                <Text style={styles.optionDescription}>Reset at 12:00 AM daily</Text>
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
                {settings.resetBehavior === 'morning' && <View style={styles.radioDot} />}
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Morning Start</Text>
                <Text style={styles.optionDescription}>
                  Reset when window begins
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Emergency Unlock Delay */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Override Delay</Text>
            <Text style={styles.sectionDescription}>
              Time before emergency override
            </Text>

            <View style={styles.sliderCard}>
              <Text style={styles.sliderValue}>{settings.emergencyUnlockDelay} min</Text>
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

        {/* Time Picker */}
        {showTimePicker && settings && (
          <>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.pickerOverlay}
                activeOpacity={1}
                onPress={() => setShowTimePicker(null)}
              >
                <View style={styles.pickerContainer}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>
                      {showTimePicker.type === 'start' ? 'Start Time' : 'End Time'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowTimePicker(null)}
                      style={styles.pickerDoneButton}
                    >
                      <Text style={styles.pickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={parseTimeString(
                      settings.schedule[showTimePicker.day][
                        showTimePicker.type === 'start' ? 'startTime' : 'endTime'
                      ]
                    )}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    textColor={Colors.terminal.green}
                  />
                </View>
              </TouchableOpacity>
            )}
            {Platform.OS === 'android' && (
              <DateTimePicker
                value={parseTimeString(
                  settings.schedule[showTimePicker.day][
                    showTimePicker.type === 'start' ? 'startTime' : 'endTime'
                  ]
                )}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </>
        )}
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
    borderBottomColor: Colors.terminal.gray,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeButtonText: {
    fontSize: 28,
    color: Colors.terminal.cyan,
    fontWeight: FontWeights.normal,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
  },
  saveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  saveButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
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
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: FontSizes.sm,
    color: Colors.terminal.cyan,
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
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: FontSizes.xs,
    color: Colors.terminal.cyan,
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
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
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
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    backgroundColor: Colors.terminal.black,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  timeLabel: {
    fontSize: FontSizes.xs,
    color: Colors.terminal.cyan,
    marginBottom: Spacing.xs,
  },
  timeValue: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
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
    backgroundColor: Colors.terminal.darkGray,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.terminal.gray,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.terminal.green,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: FontSizes.xs,
    color: Colors.terminal.cyan,
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
    marginBottom: Spacing.md,
    fontVariant: ['tabular-nums'],
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  sliderButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.terminal.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    fontSize: 24,
    fontWeight: FontWeights.normal,
    color: Colors.terminal.green,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: Colors.terminal.darkGray,
    borderTopWidth: 1,
    borderTopColor: Colors.terminal.gray,
    paddingBottom: 40,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.terminal.gray,
  },
  pickerTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
  },
  pickerDoneButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pickerDoneText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.terminal.green,
  },
});
