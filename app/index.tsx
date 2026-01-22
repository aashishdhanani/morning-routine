import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import RoutineChecklist from '../components/RoutineChecklist';
import { RoutineManager } from '../services/RoutineManager';
import { Colors, Gradients, FontSizes, FontWeights, Spacing } from '../constants/theme';

export default function HomeScreen() {
  const routineManager = useMemo(() => new RoutineManager(), []);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.greeting}>{greeting} ✨</Text>
        <Text style={styles.title}>Morning Routine</Text>
        <Text style={styles.subtitle}>Let's start your day right</Text>
      </LinearGradient>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <RoutineChecklist routineManager={routineManager} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
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
  scrollView: {
    flex: 1,
  },
});
