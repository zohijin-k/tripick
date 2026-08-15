import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Course, Review } from '../types/course';

export interface BackendTourSpot {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  imageUrl: string | null;
  contentId: string;
  contentTypeId: string;
}

interface JeonjuSpotsResponse {
  source: string;
  count: number;
  spots: BackendTourSpot[];
}

interface AuthResponse {
  accessToken: string;
}

export interface UserProfile {
  id?: string;
  email?: string;
  nickname: string;
  travelStyle: string | null;
  duration: string | null;
  transport: string | null;
}

export interface TraceResponse {
  visitedSpotIds: string[];
  completionRate: number;
  completedAt: string | null;
}

const TOKEN_KEY = 'tripick_backend_access_token';
const DEVICE_KEY = 'tripick_backend_device_id';

function getBaseUrl(): string | null {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl || baseUrl.trim() === '') return null;
  return baseUrl.replace(/\/$/, '');
}

async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const id = `rn-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(DEVICE_KEY, id);
  return id;
}

async function ensureToken(): Promise<string | null> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  const existing = await AsyncStorage.getItem(TOKEN_KEY);
  if (existing) return existing;

  try {
    const response = await fetch(`${baseUrl}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: await getDeviceId() }),
    });
    if (!response.ok) return null;
    const json = (await response.json()) as AuthResponse;
    if (!json.accessToken) return null;
    await AsyncStorage.setItem(TOKEN_KEY, json.accessToken);
    return json.accessToken;
  } catch {
    return null;
  }
}

async function requestJson<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T | null> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.auth) {
    const token = await ensureToken();
    if (!token) return null;
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchJeonjuSpots(): Promise<BackendTourSpot[] | null> {
  const json = await requestJson<JeonjuSpotsResponse>('/tour/spots/jeonju');
  if (!Array.isArray(json?.spots)) return null;
  return json.spots;
}

// ─── 전주 축제·행사 (TourAPI searchFestival2 프록시) ─────────────────────────

export interface JeonjuFestival {
  id: string;
  title: string;
  /** YYYYMMDD */
  startDate: string;
  /** YYYYMMDD */
  endDate: string;
  address: string;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
  isOngoing: boolean;
}

interface JeonjuFestivalsResponse {
  source: string;
  count: number;
  festivals: JeonjuFestival[];
}

export async function fetchJeonjuFestivals(): Promise<JeonjuFestival[] | null> {
  const json = await requestJson<JeonjuFestivalsResponse>('/tour/festivals/jeonju');
  if (!Array.isArray(json?.festivals)) return null;
  return json.festivals;
}

export async function fetchCourses(): Promise<Course[] | null> {
  return requestJson<Course[]>('/courses');
}

export async function fetchNearbyCourses(lat: number, lng: number): Promise<Course[] | null> {
  const query = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  return requestJson<Course[]>(`/courses/nearby?${query.toString()}`, { auth: true });
}

export async function fetchProfile(): Promise<UserProfile | null> {
  return requestJson<UserProfile>('/auth/me', { auth: true });
}

export async function updateProfile(profile: Omit<UserProfile, 'id' | 'email'>): Promise<UserProfile | null> {
  return requestJson<UserProfile>('/auth/me', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(profile),
  });
}

export async function fetchMyCourses(): Promise<Course[] | null> {
  return requestJson<Course[]>('/courses/my', { auth: true });
}

export async function fetchCourse(courseId: string): Promise<Course | null> {
  return requestJson<Course>(`/courses/${encodeURIComponent(courseId)}`);
}

export async function createCourse(course: Course): Promise<Course | null> {
  return requestJson<Course>('/courses', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(course),
  });
}

/** 내가 만든 코스 삭제 (시드 코스는 서버가 거부) */
export async function deleteCourse(courseId: string): Promise<boolean> {
  const result = await requestJson<{ deleted: boolean }>(
    `/courses/${encodeURIComponent(courseId)}`,
    { method: 'DELETE', auth: true },
  );
  return result?.deleted === true;
}

export async function fetchReviews(courseId: string): Promise<Review[] | null> {
  return requestJson<Review[]>(`/courses/${encodeURIComponent(courseId)}/reviews`);
}

export async function createReview(input: {
  courseId: string;
  rating: number;
  comment: string;
}): Promise<Review | null> {
  return requestJson<Review>(`/courses/${encodeURIComponent(input.courseId)}/reviews`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ rating: input.rating, comment: input.comment }),
  });
}

export async function fetchTraceProgress(courseId: string): Promise<TraceResponse | null> {
  return requestJson<TraceResponse>(`/courses/${encodeURIComponent(courseId)}/trace`, { auth: true });
}

/**
 * 위치 정직성: 원좌표(lat/lng)는 기기 밖으로 내보내지 않는다.
 * 50m 판정·속도 계산은 기기에서 수행하고, 파생값만 서버로 전송해 검증에 사용.
 * (원스토어 위치정보 "미전송" 신고와 일치)
 */
export async function checkInSpot(input: {
  courseId: string;
  spotId: string;
  distanceMeters?: number;
  speedKmh?: number;
  isManual?: boolean;
}): Promise<TraceResponse | null> {
  return requestJson<TraceResponse>(`/courses/${encodeURIComponent(input.courseId)}/checkins`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({
      spotId: input.spotId,
      distanceMeters: input.distanceMeters,
      speedKmh: input.speedKmh,
      isManual: input.isManual,
    }),
  });
}

export async function completeTrace(courseId: string): Promise<TraceResponse | null> {
  return requestJson<TraceResponse>(`/courses/${encodeURIComponent(courseId)}/trace/complete`, {
    method: 'POST',
    auth: true,
  });
}

/** 체크인(방문 검증)한 스팟에만 별점 저장 가능 — 서버가 체크인 여부를 강제함 */
export async function rateSpotCheckIn(input: {
  courseId: string;
  spotId: string;
  rating: number;
}): Promise<{ spotId: string; rating: number } | null> {
  return requestJson(
    `/courses/${encodeURIComponent(input.courseId)}/checkins/${encodeURIComponent(input.spotId)}/rating`,
    {
      method: 'POST',
      auth: true,
      body: JSON.stringify({ rating: input.rating }),
    },
  );
}
