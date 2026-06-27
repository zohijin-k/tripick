import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TrustScoreResult } from '../../types/course';

interface Props {
  result: TrustScoreResult;
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const color = pct >= 0.7 ? '#059669' : pct >= 0.4 ? '#d97706' : '#ef4444';
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    height: 5,
    backgroundColor: '#e8f0ec',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

export function TrustCard({ result }: Props) {
  const { score, items } = result;
  const trustLevel = score >= 75 ? '높음' : score >= 50 ? '보통' : '낮음';
  const trustColor = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#ef4444';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Trust Score</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{score}</Text>
          <View style={[styles.levelBadge, { borderColor: trustColor }]}>
            <Text style={[styles.levelText, { color: trustColor }]}>{trustLevel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.items}>
        {items.map((item) => (
          <View key={item.label} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemScore}>
                {item.value}
                <Text style={styles.itemMax}>/{item.max}</Text>
              </Text>
            </View>
            <MiniBar value={item.value} max={item.max} />
            <Text style={styles.itemDesc}>{item.description}</Text>
          </View>
        ))}
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
    borderLeftColor: '#1d4ed8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontSize: 28,
    fontWeight: '800',
    color: '#13315c',
  },
  levelBadge: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#e8f0f8',
    marginBottom: 14,
  },
  items: {
    gap: 12,
  },
  item: {},
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  itemScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#13315c',
  },
  itemMax: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8a9db0',
  },
  itemDesc: {
    fontSize: 10,
    color: '#8a9db0',
    marginTop: 4,
  },
});
