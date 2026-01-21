import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useMemo } from 'react';
import RoutineChecklist from '../components/RoutineChecklist';
import { RoutineManager } from '../services/RoutineManager';

export default function HomeScreen() {
  const routineManager = useMemo(() => new RoutineManager(), []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Morning Routine</Text>
      <ScrollView style={styles.scrollView}>
        <RoutineChecklist routineManager={routineManager} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
});
