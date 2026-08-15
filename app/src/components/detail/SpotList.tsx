import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Spot } from '../../types/course';

interface Props {
  spots: Spot[];
  accentColor: string;
}

function SpotItem({ spot, index, accentColor }: { spot: Spot; index: number; accentColor: string }) {
  return (
    <View style={styles.item}>
      <View style={[styles.numberBadge, { backgroundColor: accentColor }]}>
        <Text style={styles.numberText}>{index + 1}</Text>
      </View>
      <View style={styles.itemContent}>
        <View style={styles.nameRow}>
          <Text style={styles.spotName}>{spot.name}</Text>
          {spot.isHidden && (
            <View style={styles.hiddenBadge}>
              <Text style={styles.hiddenBadgeText}>숨은 스팟</Text>
            </View>
          )}
        </View>
        {spot.address ? (
          <Text style={styles.spotAddress} numberOfLines={1}>{spot.address}</Text>
        ) : null}
        {spot.rating != null && (spot.ratingCount ?? 0) > 0 ? (
          <Text style={styles.spotRating}>
            ★ {spot.rating.toFixed(1)} · 검증된 방문자 {spot.ratingCount}명
          </Text>
        ) : null}
      </View>
      <View style={[styles.visitIcon, spot.visited && styles.visitIconDone]}>
        <Text style={[styles.visitIconText, spot.visited && styles.visitIconTextDone]}>
          {spot.visited ? '✓' : '○'}
        </Text>
      </View>
    </View>
  );
}

export function SpotList({ spots, accentColor }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>방문 장소</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{spots.length}곳</Text>
        </View>
      </View>

      <View style={styles.list}>
        {spots.map((spot, i) => (
          <React.Fragment key={spot.id}>
            {i > 0 && <View style={styles.connector} />}
            <SpotItem spot={spot} index={i} accentColor={accentColor} />
          </React.Fragment>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#13315c',
  },
  countBadge: {
    backgroundColor: '#e8f5f1',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    color: '#0f8b6d',
    fontWeight: '600',
  },
  list: {},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connector: {
    width: 2,
    height: 16,
    backgroundColor: '#dce6ec',
    marginLeft: 15,
  },
  numberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numberText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  itemContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spotName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#13315c',
    flexShrink: 1,
  },
  hiddenBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hiddenBadgeText: {
    fontSize: 9,
    color: '#b45309',
    fontWeight: '800',
  },
  spotRating: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '700',
    marginTop: 3,
  },
  spotAddress: {
    fontSize: 11,
    color: '#8a9db0',
    marginTop: 2,
  },
  visitIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#dce6ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitIconDone: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  visitIconText: {
    fontSize: 12,
    color: '#8a9db0',
  },
  visitIconTextDone: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
