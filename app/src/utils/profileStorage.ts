import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProfile, updateProfile } from '../api/backendApi';

export const TRAVEL_STYLES = ['감성', '역사', '야경', '먹거리', '자연', '로컬'] as const;
export const DURATIONS = ['짧은 코스', '반나절', '하루'] as const;
export const TRANSPORTS = ['도보', '대중교통', '자전거'] as const;

export interface TravelProfile {
  nickname: string;
  travelStyle: string | null;
  duration: string | null;
  transport: string | null;
}

const PROFILE_KEY = 'tripick_travel_profile';

export async function getTravelProfile(): Promise<TravelProfile> {
  const serverProfile = await fetchProfile();
  if (serverProfile) {
    const profile: TravelProfile = {
      nickname: serverProfile.nickname,
      travelStyle: serverProfile.travelStyle,
      duration: serverProfile.duration,
      transport: serverProfile.transport,
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile;
  }

  const saved = await AsyncStorage.getItem(PROFILE_KEY);
  if (saved) return JSON.parse(saved) as TravelProfile;
  return { nickname: '여행자', travelStyle: null, duration: null, transport: null };
}

export async function saveTravelProfile(profile: TravelProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  await updateProfile(profile);
}
