import React, { useState, useCallback } from 'react';
import {
  Alert,
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
import type { RootStackParamList } from '../navigation/types';
import type { Spot } from '../types/course';
import mockCourses from '../data/mockCourses';

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

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={progressStyles.track}>
      <View
        style={[
          progressStyles.fill,
          { width: `${Math.min(100, pct)}%` as unknown as number, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: '#dce6ec',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

// ── Progress header card ──────────────────────────────────────────────────────

interface ProgressCardProps {
  title: string;
  theme: string;
  visited: number;
  total: number;
  progressPct: number;
  currentSpot: Spot | null;
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
  accent,
  isCompleted,
}: ProgressCardProps) {
  return (
    <View style={[pcStyles.card, { borderTopColor: accent }]}>
      <View style={pcStyles.titleRow}>
        <View style={[pcStyles.themeBadge, { backgroundColor: accent + '1a', borderColor: accent }]}>
          <Text style={[pcStyles.themeText, { color: accent }]}>{theme}</Text>
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
          <Text style={[pcStyles.statBig, isCompleted ? { color: '#059669' } : { color: '#13315c' }]}>
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
  themeBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  themeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#13315c',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statBig: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  statSub: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8a9db0',
  },
  statLabel: {
    fontSize: 10,
    color: '#8a9db0',
    marginTop: 2,
  },
  statDiv: {
    width: 1,
    height: 36,
    backgroundColor: '#dce6ec',
  },
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
  nextDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextLabel: {
    fontSize: 11,
    color: '#5c6b7a',
    fontWeight: '600',
  },
  nextName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
});

// ── Spot row ──────────────────────────────────────────────────────────────────

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
    <View style={spotStyles.row}>
      {/* Left connector + number */}
      <View style={spotStyles.leftCol}>
        {isVisited ? (
          <View style={spotStyles.iconVisited}>
            <Text style={spotStyles.iconVisitedText}>✓</Text>
          </View>
        ) : isCurrent ? (
          <View style={[spotStyles.iconCurrent, { borderColor: accent }]}>
            <View style={[spotStyles.iconCurrentDot, { backgroundColor: accent }]} />
          </View>
        ) : (
          <View style={spotStyles.iconUpcoming}>
            <Text style={spotStyles.iconUpcomingText}>{index + 1}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={spotStyles.content}>
        <View style={spotStyles.nameRow}>
          <Text
            style={[
              spotStyles.name,
              isVisited && spotStyles.nameVisited,
              isCurrent && { color: accent, fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {spot.name}
          </Text>
          {isCurrent && (
            <View style={[spotStyles.currentBadge, { backgroundColor: accent }]}>
              <Text style={spotStyles.currentBadgeText}>현재</Text>
            </View>
          )}
          {isVisited && (
            <Text style={spotStyles.visitedLabel}>방문 완료</Text>
          )}
        </View>
        {spot.address ? (
          <Text style={spotStyles.address} numberOfLines={1}>{spot.address}</Text>
        ) : null}
      </View>
    </View>
  );
}

const spotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  leftCol: {
    width: 32,
    alignItems: 'center',
  },
  iconVisited: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconVisitedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  iconCurrent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCurrentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  iconUpcoming: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f0f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUpcomingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8a9db0',
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#13315c',
  },
  nameVisited: {
    color: '#8a9db0',
    textDecorationLine: 'line-through',
  },
  currentBadge: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  visitedLabel: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  address: {
    fontSize: 11,
    color: '#8a9db0',
    marginTop: 2,
  },
});

// ── GPS permission card ───────────────────────────────────────────────────────

function GpsCard({
  permission,
  onRequest,
}: {
  permission: LocationPermission;
  onRequest: () => void;
}) {
  return (
    <View style={gpsStyles.card}>
      <View style={gpsStyles.header}>
        <Text style={gpsStyles.icon}>📡</Text>
        <Text style={gpsStyles.title}>GPS 체크인</Text>
        {permission === 'granted' && (
          <View style={gpsStyles.activeBadge}>
            <Text style={gpsStyles.activeBadgeText}>준비됨</Text>
          </View>
        )}
      </View>

      {permission === 'undetermined' && (
        <>
          <Text style={gpsStyles.desc}>
            위치 권한을 허용하면 현재 위치 기반 자동 체크인이 가능합니다.
          </Text>
          <TouchableOpacity style={gpsStyles.btn} onPress={onRequest}>
            <Text style={gpsStyles.btnText}>위치 권한 허용</Text>
          </TouchableOpacity>
        </>
      )}

      {permission === 'granted' && (
        <Text style={gpsStyles.grantedNote}>
          {/* TODO Phase 4: expo-location으로 실시간 좌표 수신 후
              calculateDistance(userLat, userLng, spot.lat, spot.lng)
              결과가 CHECK_IN_RADIUS(50m) 이내일 때 자동 체크인 실행 */}
          Phase 4에서 실시간 GPS 거리 계산이 연동됩니다.
        </Text>
      )}

      {permission === 'denied' && (
        <Text style={gpsStyles.deniedNote}>
          위치 권한이 거부되었습니다. 설정 앱에서 위치 접근을 허용해 주세요.
        </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#13315c',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  desc: {
    fontSize: 12,
    color: '#5c6b7a',
    lineHeight: 18,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#13315c',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  grantedNote: {
    fontSize: 11,
    color: '#059669',
    lineHeight: 17,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 10,
  },
  deniedNote: {
    fontSize: 12,
    color: '#ef4444',
    lineHeight: 18,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 10,
  },
});

// ── Completion card ───────────────────────────────────────────────────────────

function CompletionCard({
  title,
  total,
}: {
  title: string;
  total: number;
}) {
  return (
    <View style={complStyles.card}>
      <Text style={complStyles.emoji}>🎉</Text>
      <Text style={complStyles.heading}>코스 완료!</Text>
      <Text style={complStyles.sub}>
        {title}의 {total}개 장소를 모두 방문했습니다.
      </Text>
      <Text style={complStyles.note}>
        리뷰 작성 기능은 다음 업데이트에서 제공됩니다.
      </Text>
    </View>
  );
}

const complStyles = StyleSheet.create({
  card: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: '#065f46',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  note: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function TraceScreen() {
  const navigation = useNavigation<TraceNavProp>();
  const route = useRoute<TraceRouteProp>();
  const { courseId } = route.params;

  // ── State ──
  // TODO Phase 4: persist to AsyncStorage
  // useEffect(() => {
  //   AsyncStorage.setItem(`trace_${courseId}`, JSON.stringify(visitedSpotIds));
  // }, [visitedSpotIds, courseId]);
  const [visitedSpotIds, setVisitedSpotIds] = useState<string[]>([]);
  const [locationPermission, setLocationPermission] =
    useState<LocationPermission>('undetermined');

  const course = mockCourses.find((c) => c.id === courseId);

  // ── Derived state ──
  const allSpots = course?.spots ?? [];
  const totalCount = allSpots.length;
  const visitedCount = visitedSpotIds.length;
  const progressPct =
    totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;
  const currentSpot = allSpots.find((s) => !visitedSpotIds.includes(s.id)) ?? null;
  const isCompleted = totalCount > 0 && visitedCount === totalCount;
  const accent = THEME_ACCENT[course?.theme ?? ''] ?? '#0f8b6d';

  // ── Handlers ──
  const handleCheckIn = useCallback(() => {
    if (!currentSpot) return;
    // TODO Phase 4: gate this behind GPS proximity check
    // const dist = calculateDistance(userLocation, { lat: currentSpot.lat, lng: currentSpot.lng });
    // if (dist > CHECK_IN_RADIUS_METERS) { Alert.alert('아직 도착하지 않았습니다'); return; }
    setVisitedSpotIds((prev) => [...prev, currentSpot.id]);
  }, [currentSpot]);

  const handleRequestLocation = useCallback(() => {
    // TODO Phase 4: replace body with expo-location call
    // import * as Location from 'expo-location';
    // const { status } = await Location.requestForegroundPermissionsAsync();
    // setLocationPermission(status === 'granted' ? 'granted' : 'denied');
    Alert.alert(
      'GPS 연동 준비 중',
      'Phase 4에서 expo-location을 통해 실제 위치 권한을 요청합니다.',
      [
        { text: '확인', onPress: () => setLocationPermission('granted') },
        { text: '취소', style: 'cancel' },
      ],
    );
  }, []);

  // ── Not found guard (hooks must run before this) ──
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
        <Text style={styles.topBarTitle} numberOfLines={1}>
          코스 수행 중
        </Text>
        <View style={styles.topBarRight}>
          <Text style={styles.topBarProgress}>
            {visitedCount}/{totalCount}
          </Text>
        </View>
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress card */}
        <ProgressCard
          title={course.title}
          theme={course.theme}
          visited={visitedCount}
          total={totalCount}
          progressPct={progressPct}
          currentSpot={currentSpot}
          accent={accent}
          isCompleted={isCompleted}
        />

        {/* Spot list card */}
        <View style={styles.spotCard}>
          <Text style={styles.spotCardTitle}>장소 목록</Text>
          <View style={styles.spotList}>
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
                  <SpotRow
                    spot={spot}
                    index={i}
                    status={status}
                    accent={accent}
                  />
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* GPS card */}
        <GpsCard permission={locationPermission} onRequest={handleRequestLocation} />

        {/* Completion card */}
        {isCompleted && (
          <CompletionCard title={course.title} total={totalCount} />
        )}

        {/* Bottom spacer for fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Fixed bottom button ── */}
      {isCompleted ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.doneButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.checkInButton,
              { backgroundColor: currentSpot ? accent : '#94a3b8' },
            ]}
            onPress={handleCheckIn}
            disabled={!currentSpot}
            activeOpacity={0.85}
          >
            <Text style={styles.checkInButtonLabel}>수동 체크인</Text>
            <Text style={styles.checkInButtonSpot} numberOfLines={1}>
              {currentSpot ? `📍 ${currentSpot.name}` : '모든 지점 완료'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3f6f8',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
  },
  topBarTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  topBarRight: {},
  topBarProgress: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
  },

  // Body
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },

  // Spot list card
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
  spotCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#13315c',
    marginBottom: 4,
  },
  spotList: {},
  connector: {
    width: 2,
    height: 14,
    marginLeft: 15,
    borderRadius: 1,
  },
  connectorVisited: {
    backgroundColor: '#059669',
  },
  connectorPending: {
    backgroundColor: '#dce6ec',
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8f0ec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  checkInButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkInButtonLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  checkInButtonSpot: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  doneButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#059669',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 16,
    color: '#5c6b7a',
  },
  backLink: {
    fontSize: 14,
    color: '#0f8b6d',
    fontWeight: '600',
  },
});
