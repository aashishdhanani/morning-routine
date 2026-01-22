import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HistoryManager } from '../services/HistoryManager';
import { DateUtils } from '../services/DateUtils';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
  FontFamilies,
} from '../constants/theme';

interface HistoryCardProps {
  historyManager: HistoryManager;
}

export default function HistoryCard({ historyManager }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [statistics, setStatistics] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    completionRate: 0,
    averageTime: '0s',
  });
  const [last30Days, setLast30Days] = useState<string[]>([]);

  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStatistics = async () => {
    const stats = await historyManager.getStatistics();
    setStatistics(stats);

    // Load completion dates for calendar
    const records = await historyManager.getLast30Days();
    const dates = records.map((r) => r.date);
    setLast30Days(dates);
  };

  const renderCalendarGrid = () => {
    const today = DateUtils.getTodayISO();
    const days = [];

    for (let i = 29; i >= 0; i--) {
      const date = DateUtils.getDateDaysAgo(i);
      const isCompleted = last30Days.includes(date);
      const isToday = date === today;

      days.push(
        <View
          key={date}
          style={[
            styles.calendarDay,
            isCompleted && styles.calendarDayCompleted,
            isToday && styles.calendarDayToday,
          ]}
        >
          {isCompleted && <View style={styles.calendarDayDot} />}
        </View>
      );
    }

    return <View style={styles.calendarGrid}>{days}</View>;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Collapsed View: Streak Badge */}
        <View style={styles.header}>
          <Text style={styles.streakInfo}>
            [🔥 STREAK: {statistics.currentStreak} DAYS]
          </Text>
          <Text style={styles.expandHint}>
            {expanded ? '[-]' : '[+]'}
          </Text>
        </View>

        {/* Expanded View: Calendar & Stats */}
        {expanded && (
          <View style={styles.expandedContent}>
            {/* Calendar */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>$ LAST_30_DAYS:</Text>
              {renderCalendarGrid()}
              <View style={styles.calendarLegend}>
                <Text style={styles.legendText}>[■] COMPLETE  [ ] INCOMPLETE</Text>
              </View>
            </View>

            {/* Statistics Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>LONGEST_STREAK:</Text>
                <Text style={styles.statValue}>{statistics.longestStreak}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TOTAL_RUNS:</Text>
                <Text style={styles.statValue}>{statistics.totalCompletions}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>SUCCESS_RATE:</Text>
                <Text style={styles.statValue}>{statistics.completionRate}%</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>AVG_TIME:</Text>
                <Text style={styles.statValue}>{statistics.averageTime}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.terminal.green,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.terminal.darkGray,
    padding: Spacing.md,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakInfo: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.amber,
    fontFamily: FontFamilies.mono,
    flex: 1,
  },
  expandHint: {
    fontSize: FontSizes.base,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
  },
  expandedContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.terminal.gray,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    color: Colors.terminal.cyan,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.sm,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  calendarDay: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    backgroundColor: Colors.terminal.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayCompleted: {
    backgroundColor: Colors.terminal.green,
    borderColor: Colors.terminal.brightGreen,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: Colors.terminal.amber,
  },
  calendarDayDot: {
    width: 6,
    height: 6,
    backgroundColor: Colors.terminal.black,
  },
  calendarLegend: {
    marginTop: Spacing.xs,
  },
  legendText: {
    fontSize: FontSizes.xs,
    color: Colors.terminal.cyan,
    fontFamily: FontFamilies.mono,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: Colors.terminal.gray,
    backgroundColor: Colors.terminal.black,
    padding: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    color: Colors.terminal.cyan,
    fontFamily: FontFamilies.mono,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.terminal.green,
    fontFamily: FontFamilies.mono,
  },
});
