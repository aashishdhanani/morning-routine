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
import { Colors, Gradients, FontSizes, FontWeights, Spacing } from '../constants/theme';

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
    currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  if (!isInitialized) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>{greeting} ✨</Text>
            <Text style={styles.title}>Morning Routine</Text>
            <Text style={styles.subtitle}>Let's start your day right</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
    backgroundColor: Colors.background.secondary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.lg,
    color: Colors.neutral.gray600,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
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
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    color: Colors.neutral.white,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    color: Colors.neutral.white,
    opacity: 0.8,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
});
