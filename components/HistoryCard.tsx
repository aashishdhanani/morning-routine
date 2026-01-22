import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HistoryManager } from '../services/HistoryManager';
import { DateUtils } from '../services/DateUtils';
import {
  Colors,
  Gradients,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
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
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Collapsed View: Streak Badge */}
        <View style={styles.header}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNumber}>{statistics.currentStreak}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.streakLabel}>Day Streak</Text>
            <Text style={styles.expandHint}>
              {expanded ? '▼ Tap to collapse' : '▶ Tap for details'}
            </Text>
          </View>
        </View>

        {/* Expanded View: Calendar & Stats */}
        {expanded && (
          <View style={styles.expandedContent}>
            {/* Calendar */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Last 30 Days</Text>
              {renderCalendarGrid()}
              <View style={styles.calendarLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotCompleted]} />
                  <Text style={styles.legendText}>Completed</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotToday]} />
                  <Text style={styles.legendText}>Today</Text>
                </View>
              </View>
            </View>

            {/* Statistics Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{statistics.longestStreak}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{statistics.totalCompletions}</Text>
                <Text style={styles.statLabel}>Total Completions</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{statistics.completionRate}%</Text>
                <Text style={styles.statLabel}>30-Day Rate</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{statistics.averageTime}</Text>
                <Text style={styles.statLabel}>Avg Time</Text>
              </View>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  gradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  streakEmoji: {
    fontSize: 28,
    marginBottom: -4,
  },
  streakNumber: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral.white,
  },
  headerText: {
    flex: 1,
  },
  streakLabel: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.neutral.white,
    marginBottom: Spacing.xs,
  },
  expandHint: {
    fontSize: FontSizes.sm,
    color: Colors.neutral.white,
    opacity: 0.7,
  },
  expandedContent: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.neutral.white,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  calendarDay: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  calendarDayDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent.green,
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  legendDotCompleted: {
    backgroundColor: Colors.accent.green,
  },
  legendDotToday: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  legendText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral.white,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.neutral.white,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    color: Colors.neutral.white,
    opacity: 0.8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
