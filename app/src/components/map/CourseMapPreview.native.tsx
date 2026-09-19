import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Spot } from '../../types/course';
import { normalizeCoordinates } from '../../utils/mapProjection';

interface Props {
  spots: Spot[];
  visitedSpotIds?: string[];
  activeSpotId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  height?: number;
}

type PercentValue = `${number}%`;

export function CourseMapPreview({
  spots,
  visitedSpotIds = [],
  activeSpotId = null,
  userLocation = null,
  height = 220,
}: Props) {
  const { spotPoints, userPoint } = useMemo(
    () => normalizeCoordinates(spots, userLocation),
    [spots, userLocation],
  );

  if (spotPoints.length === 0) {
    return (
      <View style={styles.card}>
        <View style={[styles.frame, styles.empty, { height }]}>
          <Text style={styles.emptyTitle}>표시할 위치 정보가 없습니다</Text>
          <Text style={styles.emptyText}>좌표가 있는 관광지만 경로에 표시됩니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>코스 경로 미리보기</Text>
        <Text style={styles.badge}>{spotPoints.length}개 지점</Text>
      </View>
      <View style={[styles.frame, { height }]}>
        {[20, 40, 60, 80].map((value) => (
          <React.Fragment key={value}>
            <View style={[styles.horizontal, { top: `${value}%` as PercentValue }]} />
            <View style={[styles.vertical, { left: `${value}%` as PercentValue }]} />
          </React.Fragment>
        ))}
        {spotPoints.map((point, index) => {
          const visited = visitedSpotIds.includes(point.id);
          const active = point.id === activeSpotId && !visited;
          return (
            <View
              key={point.id}
              style={[
                styles.markerWrap,
                { left: `${point.x}%` as PercentValue, top: `${point.y}%` as PercentValue },
              ]}
            >
              <View style={[styles.marker, visited && styles.visited, active && styles.active]}>
                <Text style={styles.markerText}>{visited ? '✓' : index + 1}</Text>
              </View>
            </View>
          );
        })}
        {userPoint && (
          <View
            style={[
              styles.userMarker,
              { left: `${userPoint.x}%` as PercentValue, top: `${userPoint.y}%` as PercentValue },
            ]}
          >
            <Text style={styles.userText}>내 위치</Text>
          </View>
        )}
        <Text style={styles.note}>장소의 상대 위치를 보여주는 미리보기입니다.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: '#13315c', fontSize: 14, fontWeight: '800' },
  badge: { color: '#0f7660', backgroundColor: '#e5f4f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: '700' },
  frame: { position: 'relative', overflow: 'hidden', borderRadius: 6, backgroundColor: '#eef6fb', borderWidth: 1, borderColor: '#d7e6f1' },
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#526575', fontSize: 14, fontWeight: '700' },
  emptyText: { color: '#8394a0', fontSize: 11, marginTop: 5 },
  horizontal: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#d5e4ee' },
  vertical: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#d5e4ee' },
  markerWrap: { position: 'absolute', marginLeft: -15, marginTop: -15 },
  marker: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#13315c', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  visited: { backgroundColor: '#0f8b6d' },
  active: { backgroundColor: '#f59e0b' },
  markerText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  userMarker: { position: 'absolute', marginLeft: -22, marginTop: -10, backgroundColor: '#1d4ed8', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  userText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  note: { position: 'absolute', right: 8, bottom: 7, color: '#648197', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, fontSize: 9 },
});
