import React from 'react';
import {
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
import { DetailHeader } from '../components/detail/DetailHeader';
import { ScoreCard } from '../components/detail/ScoreCard';
import { TrustCard } from '../components/detail/TrustCard';
import { SpotList } from '../components/detail/SpotList';
import { calculateTripickScore } from '../utils/score';
import { calculateTrustScore } from '../utils/trustScore';
import mockCourses from '../data/mockCourses';

type DetailNavProp = NativeStackNavigationProp<RootStackParamList, 'CourseDetail'>;
type DetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;

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

export function CourseDetailScreen() {
  const navigation = useNavigation<DetailNavProp>();
  const route = useRoute<DetailRouteProp>();
  const { courseId } = route.params;
  const course = mockCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>코스를 찾을 수 없습니다.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.notFoundBack}>← 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const accent = THEME_ACCENT[course.theme] ?? '#0f8b6d';
  const tripickScore = calculateTripickScore(course);
  const trustScore = calculateTrustScore(course);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DetailHeader course={course} onBack={() => navigation.goBack()} />

        <View style={styles.body}>
          <ScoreCard result={tripickScore} />
          <TrustCard result={trustScore} />

          {course.recommendationReasons && course.recommendationReasons.length > 0 && (
            <View style={styles.reasonsCard}>
              <Text style={styles.reasonsTitle}>추천 이유</Text>
              {course.recommendationReasons.map((reason, i) => (
                <View key={i} style={styles.reasonRow}>
                  <Text style={[styles.reasonDot, { color: accent }]}>•</Text>
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          )}

          <SpotList spots={course.spots} accentColor={accent} />
        </View>

        {/* bottom padding for the fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed start button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: accent }]}
          onPress={() => navigation.navigate('Trace', { courseId: course.id })}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>코스 시작하기</Text>
          <Text style={styles.startButtonSub}>{course.spotCount}개 장소 · {course.distance}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3f6f8',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 0,
  },
  body: {
    padding: 16,
  },
  reasonsCard: {
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
    borderLeftColor: '#f59e0b',
  },
  reasonsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  reasonDot: {
    fontSize: 14,
    lineHeight: 20,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
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
  startButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  startButtonSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
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
  notFoundBack: {
    fontSize: 14,
    color: '#0f8b6d',
    fontWeight: '600',
  },
});
