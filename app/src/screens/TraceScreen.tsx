import React, { useState, useCallback, useMemo } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import type { RootStackParamList } from '../navigation/types';
import type { Spot } from '../types/course';
import mockCourses from '../data/mockCourses';
import {
  calculateDistanceMeters,
  isWithinRadius,
  formatDistanceM,
} from '../utils/distance';
import type { LatLng } from '../utils/distance';

// ─── Navigation types ────────────────────────────────────────────────────────

type TraceNavProp = NativeStackNavigationProp<RootStackParamList, 'Trace'>;
type TraceRouteProp = RouteProp<RootStackParamList, 'Trace'>;

// ─── Constants ───────────────────────────────────────────────────────────────

const THEME_ACCENT: Record<string, string> = {
  야경: '#0f766e',
  카페: '#166534',
  예술: '#047857',
  로컬: '#15803d',
  시장: '#0f766e',
  자연: '#065f46',
  음식: '#b45309',
  역사: '#1d4ed8',
};

const GPS_RADIUS_M = 50;

type LocationPermission = 'undetermined' | 'granted' | 'denied';
type SpotStatus = 'visited' | 'current' | 'upcoming';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSpotStatus(
  spotId: string,
  visitedIds: string[],
  currentSpotId: string | null,
): SpotStatus {
  if (visitedIds.includes(spotId)) return 'visited';
  if (spotId === currentSpotId) return 'current';
  return 'upcoming';
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={pbStyles.track}>
      <View
        style={[
          pbStyles.fill,
          {
            width: `${Math.min(100, pct)}%` as unknown as number,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const pbStyles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: '#dce6ec',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
});

// ─── ProgressCard ─────────────────────────────────────────────────────────────

interface ProgressCardProps {
  title: string;
  theme: string;
  visited: number;
  total: number;
  progressPct: number;
  currentSpot: Spot | null;
  distanceM: number | null;
  accent: string;
  isCompleted: boolean;
}

function ProgressCard({
  title,
  theme,
  visited,
  total,
  progressPct,
  currentSpot,
  distanceM,
  accent,
  isCompleted,
}: ProgressCardProps) {
  return (
    <View style={[pcStyles.card, { borderTopColor: accent }]}>
      <View style={pcStyles.titleRow}>
        <View style={[pcStyles.badge, { backgroundColor: accent + '1a', borderColor: accent }]}>
          <Text style={[pcStyles.badgeText, { color: accent }]}>{theme}</Text>
        </View>
        <Text style={pcStyles.title} numberOfLines={1}>{title}</Text>
      </View>

      <View style={pcStyles.statsRow}>
        <View style={pcStyles.stat}>
          <Text style={[pcStyles.statBig, { color: accent }]}>
            {visited}
            <Text style={pcStyles.statSub}>/{total}</Text>
          </Text>
          <Text style={pcStyles.statLabel}>진행</Text>
        </View>
        <View style={pcStyles.statDiv} />
        <View style={pcStyles.stat}>
          <Text style={[pcStyles.statBig, { color: accent }]}>{progressPct}%</Text>
          <Text style={pcStyles.statLabel}>완주율</Text>
        </View>
        <View style={pcStyles.statDiv} />
        <View style={pcStyles.stat}>
          <Text
            style={[
              pcStyles.statBig,
              isCompleted ? { color: '#059669' } : { color: '#13315c' },
            ]}
          >
            {isCompleted ? '완료' : `${total - visited}곳`}
          </Text>
          <Text style={pcStyles.statLabel}>남은 지점</Text>
        </View>
      </View>

      <ProgressBar pct={progressPct} color={accent} />

      {!isCompleted && currentSpot && (
        <View style={pcStyles.nextRow}>
          <View style={[pcStyles.nextDot, { backgroundColor: accent }]} />
          <Text style={pcStyles.nextLabel}>다음 목적지</Text>
          <Text style={[pcStyles.nextName, { color: accent }]} numberOfLines={1}>
            {currentSpot.name}
          </Text>
          {distanceM !== null && (
            <View style={pcStyles.distanceBadge}>
              <Text style={pcStyles.distanceText}>{formatDistanceM(distanceM)}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const pcStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderTopWidth: 4,
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: '#13315c' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statBig: { fontSize: 22, fontWeight: '800', lineHeight: 28 },
  statSub: { fontSize: 14, fontWeight: '500', color: '#8a9db0' },
  statLabel: { fontSize: 10, color: '#8a9db0', marginTop: 2 },
  statDiv: { width: 1, height: 36, backgroundColor: '#dce6ec' },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#f3f6f8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  nextDot: { width: 8, height: 8, borderRadius: 4 },
  nextLabel: { fontSize: 11, color: '#5c6b7a', fontWeight: '600' },
  nextName: { flex: 1, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  distanceBadge: {
    backgroundColor: '#13315c',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  distanceText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
});

// ─── SpotRow ─────────────────────────────────────────────────────────────────

function SpotRow({
  spot,
  index,
  status,
  accent,
}: {
  spot: Spot;
  index: number;
  status: SpotStatus;
  accent: string;
}) {
  const isVisited = status === 'visited';
  const isCurrent = status === 'current';

  return (
    <View style={srStyles.row}>
      <View style={srStyles.leftCol}>
        {isVisited ? (
          <View style={srStyles.iconVisited}>
            <Text style={srStyles.iconVisitedText}>✓</Text>
          </View>
        ) : isCurrent ? (
          <View style={[srStyles.iconCurrent, { borderColor: accent }]}>
            <View style={[srStyles.iconCurrentDot, { backgroundColor: accent }]} />
          </View>
        ) : (
          <View style={srStyles.iconUpcoming}>
            <Text style={srStyles.iconUpcomingText}>{index + 1}</Text>
          </View>
        )}
      </View>

      <View style={srStyles.content}>
        <View style={srStyles.nameRow}>
          <Text
            style={[
              srStyles.name,
              isVisited && srStyles.nameVisited,
              isCurrent && { color: accent, fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {spot.name}
          </Text>
          {isCurrent && (
            <View style={[srStyles.badge, { backgroundColor: accent }]}>
              <Text style={srStyles.badgeText}>현재</Text>
            </View>
          )}
          {isVisited && (
            <Text style={srStyles.visitedLabel}>방문 완료</Text>
          )}
        </View>
        {spot.address ? (
          <Text style={srStyles.address} numberOfLines={1}>{spot.address}</Text>
        ) : null}
      </View>
    </View>
  );
}

const srStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  leftCol: { width: 32, alignItems: 'center' },
  iconVisited: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center',
  },
  iconVisitedText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  iconCurrent: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center',
  },
  iconCurrentDot: { width: 10, height: 10, borderRadius: 5 },
  iconUpcoming: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#e8f0f8', alignItems: 'center', justifyContent: 'center',
  },
  iconUpcomingText: { fontSize: 12, fontWeight: '700', color: '#8a9db0' },
  content: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flex: 1, fontSize: 14, fontWeight: '600', color: '#13315c' },
  nameVisited: { color: '#8a9db0', textDecorationLine: 'line-through' },
  badge: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  visitedLabel: { fontSize: 10, color: '#059669', fontWeight: '600' },
  address: { fontSize: 11, color: '#8a9db0', marginTop: 2 },
});

// ─── GpsCard ─────────────────────────────────────────────────────────────────

interface GpsCardProps {
  permission: LocationPermission;
  userLocation: LatLng | null;
  distanceM: number | null;
  canCheckIn: boolean;
  hasSpotCoords: boolean;
  isLoading: boolean;
  accent: string;
  onRequestPermission: () => void;
  onGetLocation: () => void;
}

function GpsCard({
  permission,
  userLocation,
  distanceM,
  canCheckIn,
  hasSpotCoords,
  isLoading,
  accent,
  onRequestPermission,
  onGetLocation,
}: GpsCardProps) {
  return (
    <View style={gpsStyles.card}>
      {/* Header */}
      <View style={gpsStyles.header}>
        <Text style={gpsStyles.headerIcon}>📡</Text>
        <Text style={gpsStyles.headerTitle}>GPS 체크인</Text>
        <View
          style={[
            gpsStyles.permBadge,
            permission === 'granted' && gpsStyles.permBadgeGranted,
            permission === 'denied' && gpsStyles.permBadgeDenied,
          ]}
        >
          <Text
            style={[
              gpsStyles.permBadgeText,
              permission === 'granted' && gpsStyles.permBadgeTextGranted,
              permission === 'denied' && gpsStyles.permBadgeTextDenied,
            ]}
          >
            {permission === 'undetermined' && '권한 필요'}
            {permission === 'granted' && '권한 허용됨'}
            {permission === 'denied' && '권한 거부됨'}
          </Text>
        </View>
      </View>

      {/* Undetermined — ask for permission */}
      {permission === 'undetermined' && (
        <>
          <Text style={gpsStyles.desc}>
            위치 권한을 허용하면 현재 위치 기반으로 목적지 도착 여부를 확인하고 자동으로 체크인할 수 있습니다.
          </Text>
          <TouchableOpacity style={[gpsStyles.btn, { backgroundColor: accent }]} onPress={onRequestPermission}>
            <Text style={gpsStyles.btnText}>위치 권한 허용하기</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Denied */}
      {permission === 'denied' && (
        <View style={gpsStyles.deniedBox}>
          <Text style={gpsStyles.deniedText}>
            위치 권한이 거부되었습니다. 기기 설정 앱에서 TRIPICK의 위치 접근을 허용해 주세요.
          </Text>
        </View>
      )}

      {/* Granted — show location controls and distance */}
      {permission === 'granted' && (
        <>
          {/* Current coords (small) */}
          {userLocation ? (
            <View style={gpsStyles.coordsRow}>
              <Text style={gpsStyles.coordsLabel}>현재 위치</Text>
              <Text style={gpsStyles.coordsValue}>
                {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
              </Text>
            </View>
          ) : (
            <Text style={gpsStyles.noLocationHint}>
              아래 버튼으로 현재 위치를 가져오세요.
            </Text>
          )}

          {/* Get location button */}
          <TouchableOpacity
            style={[gpsStyles.btn, { backgroundColor: '#13315c' }, isLoading && gpsStyles.btnDisabled]}
            onPress={onGetLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={gpsStyles.btnText}>
                {userLocation ? '위치 갱신' : '현재 위치 가져오기'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Distance / check-in eligibility */}
          {userLocation && (
            <View style={[gpsStyles.distanceBox, canCheckIn ? gpsStyles.distanceBoxOk : gpsStyles.distanceBoxFar]}>
              {!hasSpotCoords ? (
                <Text style={gpsStyles.distanceNote}>이 장소는 GPS 좌표가 없어 수동 체크인만 가능합니다.</Text>
              ) : distanceM !== null ? (
                <>
                  <Text style={[gpsStyles.distanceValue, canCheckIn ? gpsStyles.distanceValueOk : gpsStyles.distanceValueFar]}>
                    목적지까지 {formatDistanceM(distanceM)}
                  </Text>
                  <Text style={[gpsStyles.distanceStatus, canCheckIn ? gpsStyles.distanceStatusOk : gpsStyles.distanceStatusFar]}>
                    {canCheckIn
                      ? '✓ GPS 체크인 가능'
                      : `목적지 ${GPS_RADIUS_M}m 이내에서 체크인 가능`}
                  </Text>
                </>
              ) : null}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const gpsStyles = StyleSheet.create({
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  headerIcon: { fontSize: 18 },
  headerTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#13315c' },
  permBadge: {
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: '#f1f5f9',
  },
  permBadgeGranted: { backgroundColor: '#dcfce7' },
  permBadgeDenied: { backgroundColor: '#fee2e2' },
  permBadgeText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  permBadgeTextGranted: { color: '#059669' },
  permBadgeTextDenied: { color: '#ef4444' },
  desc: { fontSize: 12, color: '#5c6b7a', lineHeight: 18, marginBottom: 12 },
  btn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  deniedBox: {
    backgroundColor: '#fef2f2', borderRadius: 8, padding: 12,
  },
  deniedText: { fontSize: 12, color: '#ef4444', lineHeight: 18 },
  coordsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10,
  },
  coordsLabel: { fontSize: 11, color: '#8a9db0', fontWeight: '600' },
  coordsValue: { fontSize: 11, color: '#334155', fontFamily: 'monospace' } as never,
  noLocationHint: { fontSize: 12, color: '#8a9db0', marginBottom: 10 },
  distanceBox: {
    borderRadius: 10, padding: 12, marginTop: 4,
    backgroundColor: '#f8fafc',
  },
  distanceBoxOk: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  distanceBoxFar: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a' },
  distanceValue: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  distanceValueOk: { color: '#059669' },
  distanceValueFar: { color: '#b45309' },
  distanceStatus: { fontSize: 12, fontWeight: '600' },
  distanceStatusOk: { color: '#059669' },
  distanceStatusFar: { color: '#92400e' },
  distanceNote: { fontSize: 12, color: '#5c6b7a' },
});

// ─── CompletionCard ───────────────────────────────────────────────────────────

function CompletionCard({ title, total }: { title: string; total: number }) {
  return (
    <View style={ccStyles.card}>
      <Text style={ccStyles.emoji}>🎉</Text>
      <Text style={ccStyles.heading}>코스 완료!</Text>
      <Text style={ccStyles.sub}>{title}의 {total}개 장소를 모두 방문했습니다.</Text>
      <Text style={ccStyles.note}>리뷰 작성 기능은 다음 업데이트에서 제공됩니다.</Text>
    </View>
  );
}

const ccStyles = StyleSheet.create({
  card: {
    backgroundColor: '#f0fdf4', borderRadius: 16, padding: 24, marginBottom: 12,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#bbf7d0',
  },
  emoji: { fontSize: 40, marginBottom: 8 },
  heading: { fontSize: 22, fontWeight: '800', color: '#059669', marginBottom: 6 },
  sub: { fontSize: 14, color: '#065f46', textAlign: 'center', lineHeight: 20, marginBottom: 10 },
  note: { fontSize: 11, color: '#6b7280', textAlign: 'center' },
});

// ─── TraceScreen ─────────────────────────────────────────────────────────────

export function TraceScreen() {
  const navigation = useNavigation<TraceNavProp>();
  const route = useRoute<TraceRouteProp>();
  const { courseId } = route.params;

  // ── State ─────────────────────────────────────────────────────────────────
  // Persist hint: swap useState for AsyncStorage-backed state in a future phase
  // key: `trace_${courseId}`, value: JSON.stringify(visitedSpotIds)
  const [visitedSpotIds, setVisitedSpotIds] = useState<string[]>([]);
  const [locationPermission, setLocationPermission] = useState<LocationPermission>('undetermined');
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // ── Course lookup ──────────────────────────────────────────────────────────
  const course = useMemo(
    () => mockCourses.find((c) => c.id === courseId) ?? null,
    [courseId],
  );

  // ── Derived state ──────────────────────────────────────────────────────────
  const allSpots = course?.spots ?? [];
  const totalCount = allSpots.length;
  const visitedCount = visitedSpotIds.length;
  const progressPct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;
  const currentSpot = useMemo(
    () => allSpots.find((s) => !visitedSpotIds.includes(s.id)) ?? null,
    [allSpots, visitedSpotIds],
  );
  const isCompleted = totalCount > 0 && visitedCount === totalCount;
  const accent = THEME_ACCENT[course?.theme ?? ''] ?? '#0f8b6d';

  const hasSpotCoords =
    currentSpot?.lat != null && currentSpot?.lng != null;

  const distanceToCurrentSpot = useMemo<number | null>(() => {
    if (!userLocation || !currentSpot?.lat || !currentSpot?.lng) return null;
    return calculateDistanceMeters(
      userLocation.lat, userLocation.lng,
      currentSpot.lat, currentSpot.lng,
    );
  }, [userLocation, currentSpot]);

  const canGpsCheckIn = useMemo(() => {
    if (!userLocation || !currentSpot) return false;
    return isWithinRadius(userLocation, currentSpot, GPS_RADIUS_M);
  }, [userLocation, currentSpot]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRequestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    setLocationPermission(granted ? 'granted' : 'denied');
    if (!granted) {
      Alert.alert(
        '위치 권한 필요',
        '설정 앱에서 TRIPICK의 위치 접근을 허용해 주세요.',
      );
    }
  }, []);

  const handleGetLocation = useCallback(async () => {
    if (locationPermission !== 'granted') {
      Alert.alert('위치 권한 없음', '먼저 위치 권한을 허용해 주세요.');
      return;
    }
    setLocationLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    } catch {
      Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다. 다시 시도해 주세요.');
    } finally {
      setLocationLoading(false);
    }
  }, [locationPermission]);

  const handleGpsCheckIn = useCallback(() => {
    if (!currentSpot) return;

    if (!hasSpotCoords) {
      Alert.alert(
        'GPS 정보 없음',
        '이 장소는 GPS 좌표가 없어 수동 체크인만 가능합니다.',
      );
      return;
    }

    if (!userLocation) {
      Alert.alert('위치 없음', '먼저 현재 위치를 가져와 주세요.');
      return;
    }

    if (!canGpsCheckIn) {
      Alert.alert(
        '목적지 근처에서 체크인 가능',
        `현재 목적지까지 ${distanceToCurrentSpot !== null ? formatDistanceM(distanceToCurrentSpot) : '?'} 떨어져 있습니다.\n${GPS_RADIUS_M}m 이내에서 체크인하세요.`,
      );
      return;
    }

    setVisitedSpotIds((prev) => [...prev, currentSpot.id]);
  }, [currentSpot, hasSpotCoords, userLocation, canGpsCheckIn, distanceToCurrentSpot]);

  const handleManualCheckIn = useCallback(() => {
    if (!currentSpot) return;
    setVisitedSpotIds((prev) => [...prev, currentSpot.id]);
  }, [currentSpot]);

  // ── Not-found guard (all hooks must be above this) ─────────────────────────
  if (!course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>코스를 찾을 수 없습니다.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { backgroundColor: accent }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>코스 수행 중</Text>
        <Text style={styles.topBarProgress}>{visitedCount}/{totalCount}</Text>
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProgressCard
          title={course.title}
          theme={course.theme}
          visited={visitedCount}
          total={totalCount}
          progressPct={progressPct}
          currentSpot={currentSpot}
          distanceM={distanceToCurrentSpot}
          accent={accent}
          isCompleted={isCompleted}
        />

        {/* Spot list */}
        <View style={styles.spotCard}>
          <Text style={styles.spotCardTitle}>장소 목록</Text>
          {allSpots.map((spot, i) => {
            const status = getSpotStatus(spot.id, visitedSpotIds, currentSpot?.id ?? null);
            return (
              <React.Fragment key={spot.id}>
                {i > 0 && (
                  <View
                    style={[
                      styles.connector,
                      visitedSpotIds.includes(allSpots[i - 1].id)
                        ? styles.connectorVisited
                        : styles.connectorPending,
                    ]}
                  />
                )}
                <SpotRow spot={spot} index={i} status={status} accent={accent} />
              </React.Fragment>
            );
          })}
        </View>

        {/* GPS card */}
        <GpsCard
          permission={locationPermission}
          userLocation={userLocation}
          distanceM={distanceToCurrentSpot}
          canCheckIn={canGpsCheckIn}
          hasSpotCoords={hasSpotCoords}
          isLoading={locationLoading}
          accent={accent}
          onRequestPermission={handleRequestPermission}
          onGetLocation={handleGetLocation}
        />

        {isCompleted && (
          <CompletionCard title={course.title} total={totalCount} />
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Fixed bottom bar ── */}
      {isCompleted ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.doneBtnText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomBar}>
          {/* GPS check-in — primary */}
          <TouchableOpacity
            style={[
              styles.gpsBtn,
              canGpsCheckIn
                ? { backgroundColor: accent }
                : { backgroundColor: '#94a3b8' },
            ]}
            onPress={handleGpsCheckIn}
            disabled={!currentSpot}
            activeOpacity={0.85}
          >
            <Text style={styles.gpsBtnLabel}>GPS 체크인</Text>
            <Text style={styles.gpsBtnSpot} numberOfLines={1}>
              {currentSpot
                ? `📍 ${currentSpot.name}`
                : '모든 지점 완료'}
            </Text>
          </TouchableOpacity>

          {/* Manual check-in — dev/demo */}
          <TouchableOpacity
            style={styles.manualBtn}
            onPress={handleManualCheckIn}
            disabled={!currentSpot}
            activeOpacity={0.75}
          >
            <Text style={styles.manualBtnText}>
              수동 체크인 (개발·시연용)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f6f8' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#ffffff', fontSize: 22, fontWeight: '600' },
  topBarTitle: { flex: 1, color: '#ffffff', fontSize: 16, fontWeight: '700' },
  topBarProgress: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700' },

  scroll: { flex: 1 },
  content: { padding: 16 },

  spotCard: {
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
  spotCardTitle: { fontSize: 14, fontWeight: '700', color: '#13315c', marginBottom: 4 },
  connector: { width: 2, height: 14, marginLeft: 15, borderRadius: 1 },
  connectorVisited: { backgroundColor: '#059669' },
  connectorPending: { backgroundColor: '#dce6ec' },

  bottomSpacer: { height: 120 },

  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8f0ec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },

  // GPS check-in button
  gpsBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  gpsBtnLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gpsBtnSpot: { color: '#ffffff', fontSize: 16, fontWeight: '800' },

  // Manual check-in button
  manualBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  manualBtnText: { fontSize: 13, color: '#64748b', fontWeight: '600' },

  // Done
  doneBtn: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', backgroundColor: '#059669',
  },
  doneBtnText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },

  // Not found
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: '#5c6b7a' },
  backLink: { fontSize: 14, color: '#0f8b6d', fontWeight: '600' },
});
