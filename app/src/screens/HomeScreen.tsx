import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import mockCourses from '../data/mockCourses';
import type { Course } from '../types/course';

// CourseCard를 거치지 않고 HomeScreen에서 직접 렌더링
// — score 계산 오류가 있어도 카드가 반드시 뜨도록 분리
function InlineCourseCard({ course, rank }: { course: Course; rank: number }) {
  const ACCENT: Record<string, string> = {
    야경: '#0f766e',
    카페: '#166534',
    예술: '#047857',
    로컬: '#15803d',
    시장: '#0f766e',
    자연: '#065f46',
    음식: '#b45309',
    역사: '#1d4ed8',
  };
  const accent = ACCENT[course.theme] ?? '#0f8b6d';

  return (
    <View style={cardStyles.card}>
      {/* 색상 헤더 */}
      <View style={[cardStyles.header, { backgroundColor: accent }]}>
        <View style={cardStyles.rankBadge}>
          <Text style={cardStyles.rankText}>TOP {rank}</Text>
        </View>
        <View style={cardStyles.themeBadge}>
          <Text style={cardStyles.themeText}>{course.theme}</Text>
        </View>
        <Text style={cardStyles.headerTitle} numberOfLines={1}>
          {course.title}
        </Text>
      </View>

      {/* 본문 */}
      <View style={cardStyles.body}>
        <Text style={cardStyles.title} numberOfLines={1}>
          {course.title}
        </Text>
        <Text style={cardStyles.meta}>
          {course.area} · {course.theme} · {course.distance}
        </Text>

        <View style={cardStyles.divider} />

        <View style={cardStyles.metrics}>
          <View style={cardStyles.metric}>
            <Text style={cardStyles.metricValue}>{course.completionRate}%</Text>
            <Text style={cardStyles.metricLabel}>완주율</Text>
          </View>
          <View style={cardStyles.metricSep} />
          <View style={cardStyles.metric}>
            <Text style={cardStyles.metricValue}>{course.averageRating}</Text>
            <Text style={cardStyles.metricLabel}>만족도</Text>
          </View>
          <View style={cardStyles.metricSep} />
          <View style={cardStyles.metric}>
            <Text style={cardStyles.metricValue}>{course.performers}명</Text>
            <Text style={cardStyles.metricLabel}>수행자</Text>
          </View>
          <View style={cardStyles.metricSep} />
          <View style={cardStyles.metric}>
            <Text style={cardStyles.metricValue}>{course.spotCount}곳</Text>
            <Text style={cardStyles.metricLabel}>지점 수</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function HomeScreen() {
  // 안전한 배열 확보
  const allCourses: Course[] = Array.isArray(mockCourses) ? mockCourses : [];
  // score 계산 없이 단순 slice — 원인 격리용
  const displayCourses = allCourses.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 디버그 바 ── */}
        <View style={styles.debugBar}>
          <Text style={styles.debugText}>
            [debug] isArray={String(Array.isArray(mockCourses))}
            {'  '}mockCourses.length={allCourses.length}
            {'  '}display={displayCourses.length}
          </Text>
        </View>

        {/* ── 히어로 ── */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Participatory Tourism Ranking</Text>
          <Text style={styles.brand}>TRIPICK</Text>
          <Text style={styles.description}>
            실제 수행 데이터를 기반으로 검증된 전주 여행 코스를 랭킹화합니다.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{allCourses.length}</Text>
              <Text style={styles.heroStatLabel}>검증 코스</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {allCourses.reduce((s, c) => s + c.performers, 0)}
              </Text>
              <Text style={styles.heroStatLabel}>총 수행자</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {allCourses.length > 0
                  ? (
                      allCourses.reduce((s, c) => s + c.averageRating, 0) /
                      allCourses.length
                    ).toFixed(1)
                  : '-'}
              </Text>
              <Text style={styles.heroStatLabel}>평균 만족도</Text>
            </View>
          </View>
        </View>

        {/* ── Score 공식 카드 ── */}
        <View style={styles.formulaCard}>
          <Text style={styles.formulaTitle}>TRIPICK Score 산정식</Text>
          <Text style={styles.formulaText}>
            완주율 × 50% + 만족도 × 30% + 수행자 수 × 20%
          </Text>
          <Text style={styles.formulaNote}>
            실제로 코스를 걸어 완주한 수행자들의 데이터로만 점수를 산출합니다.
          </Text>
        </View>

        {/* ── 랭킹 섹션 ── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>Verified Ranking</Text>
            <Text style={styles.sectionTitle}>검증된 코스 TOP 5</Text>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>
              {displayCourses.length}개 코스
            </Text>
          </View>
        </View>

        {displayCourses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>사용 가능한 데이터 없음</Text>
            <Text style={styles.emptyHint}>
              mockCourses 길이: {allCourses.length}
            </Text>
          </View>
        ) : (
          displayCourses.map((course, index) => (
            <InlineCourseCard key={course.id} course={course} rank={index + 1} />
          ))
        )}

        <Text style={styles.bottomNote}>
          더 많은 코스 보기 및 직접 수행 기록은 준비 중입니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── 카드 스타일 ──────────────────────────────────
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  rankBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 8,
  },
  rankText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  themeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 8,
  },
  themeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#13315c',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#5c6b7a',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#dce6ec',
    marginBottom: 12,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#13315c',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#8a9db0',
  },
  metricSep: {
    width: 1,
    height: 28,
    backgroundColor: '#dce6ec',
  },
});

// ── 페이지 스타일 ─────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3f6f8',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  debugBar: {
    backgroundColor: '#fef9c3',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  debugText: {
    fontSize: 10,
    color: '#713f12',
  },

  hero: {
    backgroundColor: '#13315c',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#4fb286',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  brand: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 10,
  },
  description: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    color: '#4fb286',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 8,
  },

  formulaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0f8b6d',
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  formulaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f8b6d',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  formulaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#13315c',
    marginBottom: 6,
  },
  formulaNote: {
    fontSize: 11,
    color: '#5c6b7a',
    lineHeight: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionEyebrow: {
    fontSize: 10,
    color: '#0f8b6d',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#13315c',
  },
  sectionBadge: {
    backgroundColor: '#e8f5f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 11,
    color: '#0f8b6d',
    fontWeight: '600',
  },

  emptyBox: {
    backgroundColor: '#fff4e6',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c2410c',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 11,
    color: '#92400e',
  },

  bottomNote: {
    textAlign: 'center',
    color: '#8a9db0',
    fontSize: 12,
    marginTop: 8,
  },
});
