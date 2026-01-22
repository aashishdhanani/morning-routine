import { View, Text, StyleSheet, ScrollView, TouchableOpacity, AppState } from 'react-native';
import { useMemo, useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import RoutineChecklist from '../components/RoutineChecklist';
import LockingScreen from '../components/LockingScreen';
import SettingsScreen from '../components/SettingsScreen';
import { RoutineManager } from '../services/RoutineManager';
import { SettingsManager } from '../services/SettingsManager';
import { HistoryManager } from '../services/HistoryManager';
import { LockingService } from '../services/LockingService';
import {
  Colors,
  Gradients,
  FontSizes,
  FontWeights,
  Spacing,
  FontFamilies,
  BorderRadius,
} from '../constants/theme';

export default function HomeScreen() {
  const routineManager = useMemo(() => new RoutineManager(), []);
  const settingsManager = useMemo(() => new SettingsManager(), []);
  const historyManager = useMemo(() => new HistoryManager(), []);
  const lockingService = useMemo(
    () => new LockingService(settingsManager, routineManager),
    [settingsManager, routineManager]
  );

  const [isLocked, setIsLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const appState = useRef(AppState.currentState);

  // Initialize managers and check locking on mount
  useEffect(() => {
    const initialize = async () => {
      await routineManager.loadState();

      // Check if reset is needed
      const settings = await settingsManager.loadSettings();
      const resetTime = await settingsManager.getResetTimeForToday();
      await routineManager.checkAndResetIfNeeded(settings, resetTime);

      // Check if should lock now
      await checkLockingState();

      setIsInitialized(true);
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        await checkLockingState();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkLockingState = async () => {
    // Check if already locked
    const currentlyLocked = await lockingService.isLocked();
    if (currentlyLocked) {
      setIsLocked(true);
      return;
    }

    // Check if should lock now
    const shouldLock = await lockingService.shouldLockNow();
    if (shouldLock) {
      await lockingService.lockApp();
      setIsLocked(true);
    }
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'GOOD_MORNING' : currentHour < 18 ? 'GOOD_AFTERNOON' : 'GOOD_EVENING';

  if (!isInitialized) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>$ INITIALIZING...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.terminalBorder}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>{'>'} {greeting}</Text>
              <Text style={styles.title}>$ MORNING_ROUTINE</Text>
              <Text style={styles.subtitle}>{'>'} RUN DAILY_TASKS.SH</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
              <Text style={styles.settingsIcon}>[⚙]</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <RoutineChecklist routineManager={routineManager} historyManager={historyManager} />
      </ScrollView>

      {/* Locking Screen */}
      <LockingScreen
        visible={isLocked}
        routineManager={routineManager}
        lockingService={lockingService}
        historyManager={historyManager}
        onUnlock={handleUnlock}
      />

      {/* Settings Screen */}
      <SettingsScreen
        visible={showSettings}
        settingsManager={settingsManager}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.lg,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background.primary,
  },
  terminalBorder: {
    borderWidth: 2,
    borderColor: Colors.terminal.green,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    backgroundColor: Colors.terminal.darkGray,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    color: Colors.terminal.cyan,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    color: Colors.terminal.amber,
    fontFamily: FontFamilies.mono,
  },
  settingsButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.terminal.green,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(0, 215, 135, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  settingsIcon: {
    fontSize: 16,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
  },
  scrollView: {
    flex: 1,
  },
});
