import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TripickScoreResult } from '../../types/course';

interface Props {
  result: TripickScoreResult;
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(1, value / max);
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: '#e8f0ec',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

export function ScoreCard({ result }: Props) {
  const { totalScore, performerScore, ratingScore } = result;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>TRIPICK Score</Text>
        <Text style={styles.score}>{totalScore}</Text>
      </View>
      <Text style={styles.formula}>완주율 × 50% + 만족도 × 30% + 수행자 수 × 20%</Text>

      <View style={styles.items}>
        <View style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemLabel}>수행자 점수</Text>
            <Text style={styles.itemValue}>{performerScore}</Text>
          </View>
          <ScoreBar value={performerScore} color="#0f8b6d" />
        </View>
        <View style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemLabel}>만족도 점수</Text>
            <Text style={styles.itemValue}>{ratingScore}</Text>
          </View>
          <ScoreBar value={ratingScore} color="#059669" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#0f8b6d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f8b6d',
    letterSpacing: 0.5,
  },
  score: {
    fontSize: 28,
    fontWeight: '800',
    color: '#13315c',
  },
  formula: {
    fontSize: 11,
    color: '#5c6b7a',
    marginBottom: 16,
  },
  items: {
    gap: 12,
  },
  item: {
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemLabel: {
    fontSize: 12,
    color: '#5c6b7a',
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#13315c',
  },
});
