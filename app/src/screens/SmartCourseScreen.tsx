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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { Course, Spot } from '../types/course';
import mockCourses from '../data/mockCourses';
import { generateRecommendationReasons } from '../utils/recommendation';
import { saveUserCourse } from '../utils/courseStorage';

// ─── Navigation type ──────────────────────────────────────────────────────────

type SmartNavProp = NativeStackNavigationProp<RootStackParamList, 'SmartCourse'>;

// ─── Preference options ───────────────────────────────────────────────────────

const STYLES = ['감성', '역사', '야경', '먹거리', '자연', '로컬'] as const;
const DURATIONS = ['짧은 코스', '반나절', '하루'] as const;
const TRANSPORTS = ['도보', '대중교통', '자전거'] as const;

type StyleOption = typeof STYLES[number];
type DurationOption = typeof DURATIONS[number];
type TransportOption = typeof TRANSPORTS[number];

// ─── Style → theme mapping ────────────────────────────────────────────────────

const STYLE_THEMES: Record<StyleOption, string[]> = {
  감성: ['카페', '예술'],
  역사: ['로컬'],
  야경: ['야경'],
  먹거리: ['시장'],
  자연: ['자연'],
  로컬: ['로컬'],
};

const DURATION_COUNT: Record<DurationOption, number> = {
  '짧은 코스': 3,
  반나절: 5,
  하루: 7,
};

const ACCENT_FOR_STYLE: Record<StyleOption, string> = {
  감성: '#166534',
  역사: '#1d4ed8',
  야경: '#0f766e',
  먹거리: '#b45309',
  자연: '#065f46',
  로컬: '#15803d',
};

const STYLE_EMOJI: Record<StyleOption, string> = {
  감성: '🎨',
  역사: '🏯',
  야경: '🌙',
  먹거리: '🍜',
  자연: '🌿',
  로컬: '🗺️',
};

const TRANSPORT_EMOJI: Record<TransportOption, string> = {
  도보: '🚶',
  대중교통: '🚌',
  자전거: '🚲',
};

// ─── Course builder ────────────────────────────────────────────────────────────

function buildCourse(
  style: StyleOption,
  duration: DurationOption,
  transport: TransportOption,
): Course | null {
  const targetCount = DURATION_COUNT[duration];
  const matchingThemes = STYLE_THEMES[style];

  // Collect unique spots across all mockCourses (keyed by name)
  const spotMap = new Map<string, { spot: Spot; theme: string }>();
  for (const course of mockCourses) {
    for (const spot of course.spots) {
      if (!spotMap.has(spot.name)) {
        spotMap.set(spot.name, { spot, theme: course.theme });
      }
    }
  }

  const allEntries = [...spotMap.values()];
  if (allEntries.length === 0) return null;

  // Style-matching spots first, then fill from rest
  const matched = allEntries
    .filter((e) => matchingThemes.includes(e.theme))
    .map((e) => e.spot);
  const unmatched = allEntries
    .filter((e) => !matchingThemes.includes(e.theme))
    .map((e) => e.spot);

  const candidates = [...matched, ...unmatched];
  const ts = Date.now();

  const selected: Spot[] = candidates.slice(0, targetCount).map((spot, i) => ({
    ...spot,
    id: `smart-${ts}-${i}`,
    visited: false,
  }));

  const distKm = (selected.length * 0.6).toFixed(1);
  const reasons = generateRecommendationReasons(selected, { style, duration, transport });

  return {
    id: `smart-${ts}`,
    title: `${style} ${duration} 전주 코스`,
    area: '전주',
    theme: style,
    distance: `${distKm}km`,
    spotCount: selected.length,
    completionRate: 0,
    averageRating: 0,
    performers: 0,
    transport,
    spots: selected,
    recommendationReasons: reasons,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return <Text style={secStyles.label}>{children}</Text>;
}

const secStyles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#13315c',
    letterSpacing: 0.3,
    marginBottom: 10,
    marginTop: 4,
  },
});

// Option chip (reusable for all 3 selectors)
function OptionChip({
  label,
  emoji,
  selected,
  accent,
  onPress,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        chipStyles.chip,
        selected && { backgroundColor: accent, borderColor: accent },
      ]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      {emoji ? <Text style={chipStyles.emoji}>{emoji}</Text> : null}
      <Text style={[chipStyles.label, selected && chipStyles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#dce6ec',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  emoji: { fontSize: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#5c6b7a' },
  labelSelected: { color: '#ffffff', fontWeight: '700' },
});

// Preview card shown after course generation
function PreviewCard({ course, accent }: { course: Course; accent: string }) {
  return (
    <View style={[pvStyles.card, { borderTopColor: accent }]}>
      <View style={pvStyles.header}>
        <View style={[pvStyles.badge, { backgroundColor: accent + '20', borderColor: accent }]}>
          <Text style={[pvStyles.badgeText, { color: accent }]}>{course.theme}</Text>
        </View>
        <Text style={pvStyles.title}>{course.title}</Text>
      </View>

      <View style={pvStyles.metaRow}>
        <Text style={pvStyles.meta}>📍 {course.spotCount}개 장소</Text>
        <Text style={pvStyles.metaDot}>·</Text>
        <Text style={pvStyles.meta}>🚶 {course.transport ?? '도보'}</Text>
        <Text style={pvStyles.metaDot}>·</Text>
        <Text style={pvStyles.meta}>📏 {course.distance}</Text>
      </View>

      {/* Spot list */}
      <View style={pvStyles.spotsBox}>
        {course.spots.map((spot, i) => (
          <View key={spot.id} style={pvStyles.spotRow}>
            <View style={[pvStyles.spotNum, { backgroundColor: accent }]}>
              <Text style={pvStyles.spotNumText}>{i + 1}</Text>
            </View>
            <Text style={pvStyles.spotName} numberOfLines={1}>{spot.name}</Text>
          </View>
        ))}
      </View>

      {/* Recommendation reasons */}
      {course.recommendationReasons && course.recommendationReasons.length > 0 && (
        <View style={pvStyles.reasonsBox}>
          <Text style={pvStyles.reasonsTitle}>추천 이유</Text>
          {course.recommendationReasons.map((r, i) => (
            <View key={i} style={pvStyles.reasonRow}>
              <Text style={[pvStyles.reasonDot, { color: accent }]}>•</Text>
              <Text style={pvStyles.reasonText}>{r}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const pvStyles = StyleSheet.create({
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  badge: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  title: { flex: 1, fontSize: 15, fontWeight: '800', color: '#13315c' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  meta: { fontSize: 12, color: '#5c6b7a', fontWeight: '500' },
  metaDot: { fontSize: 12, color: '#dce6ec' },
  spotsBox: { gap: 8, marginBottom: 14 },
  spotRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  spotNum: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  spotNumText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  spotName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#13315c' },
  reasonsBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  reasonsTitle: { fontSize: 11, fontWeight: '700', color: '#92400e', marginBottom: 8 },
  reasonRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  reasonDot: { fontSize: 13, lineHeight: 19 },
  reasonText: { flex: 1, fontSize: 12, color: '#334155', lineHeight: 19 },
});

// ─── SmartCourseScreen ────────────────────────────────────────────────────────

export function SmartCourseScreen() {
  const navigation = useNavigation<SmartNavProp>();

  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<TransportOption | null>(null);
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const allSelected = selectedStyle && selectedDuration && selectedTransport;
  const accent = selectedStyle ? (ACCENT_FOR_STYLE[selectedStyle] ?? '#0f8b6d') : '#0f8b6d';

  const handleGenerate = useCallback(() => {
    if (!selectedStyle || !selectedDuration || !selectedTransport) return;
    const course = buildCourse(selectedStyle, selectedDuration, selectedTransport);
    if (!course) {
      Alert.alert('코스 생성 실패', '선택한 조건에 맞는 관광지를 찾지 못했습니다.');
      return;
    }
    setGeneratedCourse(course);
  }, [selectedStyle, selectedDuration, selectedTransport]);

  const handleStyleSelect = useCallback((s: StyleOption) => {
    setSelectedStyle(s);
    setGeneratedCourse(null); // reset preview when preference changes
  }, []);

  const handleDurationSelect = useCallback((d: DurationOption) => {
    setSelectedDuration(d);
    setGeneratedCourse(null);
  }, []);

  const handleTransportSelect = useCallback((t: TransportOption) => {
    setSelectedTransport(t);
    setGeneratedCourse(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!generatedCourse || isSaving) return;
    setIsSaving(true);
    try {
      await saveUserCourse(generatedCourse);
      Alert.alert('저장 완료 ✓', '내 코스 목록에 추가되었습니다.', [
        { text: '홈으로', onPress: () => navigation.navigate('Home') },
        {
          text: '상세 보기',
          onPress: () =>
            navigation.replace('CourseDetail', { courseId: generatedCourse.id }),
        },
      ]);
    } catch {
      Alert.alert('저장 실패', '코스를 저장하는 데 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  }, [generatedCourse, isSaving, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.topBarEyebrow}>Smart Course Builder</Text>
          <Text style={styles.topBarTitle}>스마트 코스 만들기</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 여행 스타일 ── */}
        <View style={styles.sectionCard}>
          <SectionLabel>🎭  여행 스타일</SectionLabel>
          <View style={styles.chipGrid}>
            {STYLES.map((s) => (
              <OptionChip
                key={s}
                label={s}
                emoji={STYLE_EMOJI[s]}
                selected={selectedStyle === s}
                accent={ACCENT_FOR_STYLE[s]}
                onPress={() => handleStyleSelect(s)}
              />
            ))}
          </View>
        </View>

        {/* ── 소요 시간 ── */}
        <View style={styles.sectionCard}>
          <SectionLabel>⏱  소요 시간</SectionLabel>
          <View style={styles.chipRow}>
            {DURATIONS.map((d) => (
              <OptionChip
                key={d}
                label={d}
                selected={selectedDuration === d}
                accent="#13315c"
                onPress={() => handleDurationSelect(d)}
              />
            ))}
          </View>
        </View>

        {/* ── 이동 방식 ── */}
        <View style={styles.sectionCard}>
          <SectionLabel>🚗  이동 방식</SectionLabel>
          <View style={styles.chipRow}>
            {TRANSPORTS.map((t) => (
              <OptionChip
                key={t}
                label={t}
                emoji={TRANSPORT_EMOJI[t]}
                selected={selectedTransport === t}
                accent="#0f8b6d"
                onPress={() => handleTransportSelect(t)}
              />
            ))}
          </View>
        </View>

        {/* ── Generate button ── */}
        <TouchableOpacity
          style={[
            styles.generateBtn,
            allSelected ? { backgroundColor: accent } : styles.generateBtnDisabled,
          ]}
          onPress={handleGenerate}
          disabled={!allSelected}
          activeOpacity={0.85}
        >
          <Text style={styles.generateBtnText}>
            {allSelected ? '✦  코스 생성하기' : '위 항목을 모두 선택하세요'}
          </Text>
        </TouchableOpacity>

        {/* ── Info card when nothing generated yet ── */}
        {!generatedCourse && (
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              여행 스타일, 소요 시간, 이동 방식을 선택하면{'\n'}
              전주 관광지를 조합한 맞춤 코스를 자동으로 생성합니다.
            </Text>
          </View>
        )}

        {/* ── Preview card ── */}
        {generatedCourse && (
          <>
            <View style={styles.previewHeader}>
              <Text style={styles.previewLabel}>생성된 코스 미리보기</Text>
              <TouchableOpacity onPress={handleGenerate}>
                <Text style={styles.previewRegen}>다시 생성 ↺</Text>
              </TouchableOpacity>
            </View>
            <PreviewCard course={generatedCourse} accent={accent} />
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed save button */}
      {generatedCourse && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: accent }, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {isSaving ? '저장 중…' : '이 코스 저장하기'}
            </Text>
            <Text style={styles.saveBtnSub}>내 코스 목록에 추가됩니다</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f6f8' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#13315c',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#ffffff', fontSize: 22, fontWeight: '600' },
  topBarEyebrow: { color: '#4fb286', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  topBarTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },

  scroll: { flex: 1 },
  content: { padding: 16 },

  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },

  generateBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  generateBtnDisabled: { backgroundColor: '#cbd5e1' },
  generateBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },

  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoIcon: { fontSize: 28 },
  infoText: { fontSize: 13, color: '#1e40af', textAlign: 'center', lineHeight: 20 },

  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewLabel: { fontSize: 13, fontWeight: '700', color: '#13315c' },
  previewRegen: { fontSize: 12, color: '#0f8b6d', fontWeight: '600' },

  bottomSpacer: { height: 100 },

  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8f0ec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  saveBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
});
