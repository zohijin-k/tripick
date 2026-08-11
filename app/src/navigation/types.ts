import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Course } from '../types/course';

export type RootStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: string };
  Trace: { courseId: string };
  SmartCourse: undefined;
  Profile: undefined;
  NearbyCourses: { placeName: string; courses: Course[] };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type CourseDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;
export type TraceScreenProps = NativeStackScreenProps<RootStackParamList, 'Trace'>;
