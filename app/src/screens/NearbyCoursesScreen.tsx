import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { CourseMapPreview } from '../components/map/CourseMapPreview';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NearbyCourses'>;
type ScreenRoute = RouteProp<RootStackParamList, 'NearbyCourses'>;
const PAGE_WIDTH = Dimensions.get('window').width;

export function NearbyCoursesScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<ScreenRoute>();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headingBlock}>
          <Text style={styles.eyebrow}>Nearby Picks</Text>
          <Text style={styles.heading}>{params.placeName} 주변 추천</Text>
        </View>
        <Text style={styles.count}>{params.courses.length}개</Text>
      </View>

      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pages}>
        {params.courses.map((course, index) => (
          <ScrollView key={course.id} style={{ width: PAGE_WIDTH }} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.indexRow}>
                <Text style={styles.index}>{index + 1} / {params.courses.length}</Text>
                <View style={styles.themeBadge}><Text style={styles.themeText}>{course.theme}</Text></View>
              </View>
              <Text style={styles.title}>{course.title}</Text>
              <Text style={styles.meta}>{course.spotCount}개 장소 · {course.distance} · {course.transport ?? '도보'}</Text>
              {course.distanceMeters != null && (
                <Text style={styles.distance}>현재 위치에서 가장 가까운 지점까지 {Math.round(course.distanceMeters)}m</Text>
              )}
            </View>

            <CourseMapPreview spots={course.spots} height={260} />

            <View style={styles.spots}>
              <Text style={styles.sectionTitle}>코스 지점</Text>
              {course.spots.map((spot, spotIndex) => (
                <View key={spot.id} style={styles.spotRow}>
                  <View style={styles.spotNumber}><Text style={styles.spotNumberText}>{spotIndex + 1}</Text></View>
                  <View style={styles.spotBody}>
                    <Text style={styles.spotName}>{spot.name}</Text>
                    {spot.address ? <Text style={styles.address} numberOfLines={1}>{spot.address}</Text> : null}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('Trace', { courseId: course.id })}>
              <Text style={styles.startText}>이 코스 수행하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailButton} onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}>
              <Text style={styles.detailText}>상세 정보 보기</Text>
            </TouchableOpacity>
          </ScrollView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef3f5' },
  topBar: { backgroundColor: '#13315c', paddingTop: 48, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 24 },
  headingBlock: { flex: 1 },
  eyebrow: { color: '#8fd1c1', fontSize: 10, fontWeight: '800' },
  heading: { color: '#fff', fontSize: 18, fontWeight: '800' },
  count: { color: '#cce4de', fontSize: 12, fontWeight: '700' },
  pages: { alignItems: 'stretch' },
  page: { padding: 16, paddingBottom: 42 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 18, marginBottom: 12, borderTopWidth: 4, borderTopColor: '#0f8b6d' },
  indexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  index: { color: '#78909c', fontSize: 11, fontWeight: '700' },
  themeBadge: { backgroundColor: '#e2f3ef', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  themeText: { color: '#0f7660', fontSize: 11, fontWeight: '800' },
  title: { color: '#13315c', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  meta: { color: '#526575', fontSize: 13 },
  distance: { color: '#0f8b6d', fontSize: 12, fontWeight: '700', marginTop: 8 },
  spots: { backgroundColor: '#fff', borderRadius: 8, padding: 18, marginBottom: 12 },
  sectionTitle: { color: '#13315c', fontSize: 14, fontWeight: '800', marginBottom: 12 },
  spotRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  spotNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#13315c', alignItems: 'center', justifyContent: 'center' },
  spotNumberText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  spotBody: { flex: 1 },
  spotName: { color: '#17324d', fontSize: 14, fontWeight: '700' },
  address: { color: '#8092a0', fontSize: 11, marginTop: 2 },
  startButton: { backgroundColor: '#0f8b6d', borderRadius: 8, paddingVertical: 15, alignItems: 'center' },
  startText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  detailButton: { paddingVertical: 14, alignItems: 'center' },
  detailText: { color: '#466174', fontSize: 13, fontWeight: '700' },
});
