import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {
  DURATIONS,
  getTravelProfile,
  saveTravelProfile,
  TRANSPORTS,
  TRAVEL_STYLES,
  type TravelProfile,
} from '../utils/profileStorage';

type ProfileNav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

function Selector({ title, values, selected, onSelect }: {
  title: string;
  values: readonly string[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.options}>
        {values.map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.option, selected === value && styles.optionSelected]}
            onPress={() => onSelect(value)}
          >
            <Text style={[styles.optionText, selected === value && styles.optionTextSelected]}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const [profile, setProfile] = useState<TravelProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getTravelProfile().then(setProfile); }, []);

  if (!profile) {
    return <SafeAreaView style={styles.safe}><ActivityIndicator style={styles.loader} color="#0f8b6d" /></SafeAreaView>;
  }

  const save = async () => {
    if (!profile.travelStyle || !profile.duration || !profile.transport) {
      Alert.alert('취향 선택 필요', '여행 스타일, 소요 시간, 이동 방식을 모두 선택해 주세요.');
      return;
    }
    setSaving(true);
    await saveTravelProfile(profile);
    setSaving(false);
    Alert.alert('프로필 저장 완료', '앞으로 이 취향을 우선해 코스를 추천합니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.eyebrow}>Travel Profile</Text>
          <Text style={styles.title}>내 여행 취향</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={profile.nickname}
            onChangeText={(nickname) => setProfile({ ...profile, nickname })}
            placeholder="닉네임"
            maxLength={20}
          />
        </View>
        <Selector title="여행 스타일" values={TRAVEL_STYLES} selected={profile.travelStyle} onSelect={(travelStyle) => setProfile({ ...profile, travelStyle })} />
        <Selector title="선호 소요 시간" values={DURATIONS} selected={profile.duration} onSelect={(duration) => setProfile({ ...profile, duration })} />
        <Selector title="이동 방식" values={TRANSPORTS} selected={profile.transport} onSelect={(transport) => setProfile({ ...profile, transport })} />
        <View style={styles.info}>
          <Text style={styles.infoTitle}>추천에 어떻게 쓰이나요?</Text>
          <Text style={styles.infoText}>주변 코스와 스마트 코스를 고를 때 선택한 취향과 가까운 코스를 먼저 보여줍니다.</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={save} disabled={saving}>
          <Text style={styles.saveText}>{saving ? '저장 중...' : '취향 저장'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f7f8' },
  loader: { flex: 1 },
  topBar: { backgroundColor: '#13315c', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#fff', fontSize: 24 },
  eyebrow: { color: '#93c5bd', fontSize: 11, fontWeight: '700' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  content: { padding: 18, gap: 12, paddingBottom: 110 },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  sectionTitle: { color: '#13315c', fontSize: 14, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#dce6ec', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: '#13315c' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: '#cddae2', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: '#fff' },
  optionSelected: { backgroundColor: '#0f8b6d', borderColor: '#0f8b6d' },
  optionText: { color: '#526575', fontSize: 13, fontWeight: '600' },
  optionTextSelected: { color: '#fff' },
  info: { backgroundColor: '#e8f4f1', borderLeftWidth: 3, borderLeftColor: '#0f8b6d', padding: 14, borderRadius: 6 },
  infoTitle: { color: '#0b6b55', fontSize: 13, fontWeight: '800', marginBottom: 5 },
  infoText: { color: '#355e55', fontSize: 12, lineHeight: 18 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e3eaee' },
  saveButton: { backgroundColor: '#0f8b6d', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.6 },
});
