import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import type { Spot } from '../../types/course';
import type { LatLng } from '../../utils/distance';

interface Props {
  spots: Spot[];
  visitedSpotIds?: string[];
  activeSpotId?: string | null;
  userLocation?: LatLng | null;
  height?: number;
}

export function CourseMapPreview({
  spots,
  visitedSpotIds = [],
  activeSpotId = null,
  userLocation = null,
  height = 220,
}: Props) {
  const validSpots = useMemo(
    () => spots.filter((spot): spot is Spot & { lat: number; lng: number } =>
      Number.isFinite(spot.lat) && Number.isFinite(spot.lng)),
    [spots],
  );

  const region = useMemo(() => {
    const points = [
      ...validSpots.map((spot) => ({ latitude: spot.lat, longitude: spot.lng })),
      ...(userLocation ? [{ latitude: userLocation.lat, longitude: userLocation.lng }] : []),
    ];
    if (points.length === 0) return null;
    const latitudes = points.map((point) => point.latitude);
    const longitudes = points.map((point) => point.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.008),
      longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.008),
    };
  }, [userLocation, validSpots]);

  if (!region) {
    return (
      <View style={styles.card}>
        <View style={[styles.empty, { height }]}>
          <Text style={styles.emptyTitle}>표시할 위치 정보가 없습니다</Text>
          <Text style={styles.emptyText}>좌표가 있는 관광지만 지도에 표시됩니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>실시간 코스 지도</Text>
        <Text style={styles.badge}>{validSpots.length}개 지점</Text>
      </View>
      <MapView
        style={{ height, width: '100%' }}
        initialRegion={region}
        showsBuildings
        showsPointsOfInterest
        showsUserLocation={Boolean(userLocation)}
        showsMyLocationButton={Boolean(userLocation)}
        toolbarEnabled={false}
      >
        <Polyline
          coordinates={validSpots.map((spot) => ({ latitude: spot.lat, longitude: spot.lng }))}
          strokeColor="#0f8b6d"
          strokeWidth={4}
        />
        {validSpots.map((spot, index) => {
          const visited = visitedSpotIds.includes(spot.id);
          const active = spot.id === activeSpotId && !visited;
          return (
            <Marker
              key={spot.id}
              coordinate={{ latitude: spot.lat, longitude: spot.lng }}
              title={`${index + 1}. ${spot.name}`}
              description={spot.address}
              pinColor={visited ? '#059669' : active ? '#f59e0b' : '#13315c'}
            />
          );
        })}
      </MapView>
      <View style={styles.legend}>
        <Text style={styles.legendText}>● 예정</Text>
        <Text style={[styles.legendText, { color: '#f59e0b' }]}>● 현재 목적지</Text>
        <Text style={[styles.legendText, { color: '#059669' }]}>● 방문 완료</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: '#13315c', fontSize: 14, fontWeight: '800' },
  badge: { color: '#0f7660', backgroundColor: '#e5f4f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: '700' },
  empty: { backgroundColor: '#edf3f6', alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  emptyTitle: { color: '#526575', fontSize: 14, fontWeight: '700' },
  emptyText: { color: '#8394a0', fontSize: 11, marginTop: 5 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 10 },
  legendText: { color: '#13315c', fontSize: 10, fontWeight: '700' },
});
