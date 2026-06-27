import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  CourseDetail: { courseId: string };
  Trace: { courseId: string };
  SmartCourse: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type CourseDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;
export type TraceScreenProps = NativeStackScreenProps<RootStackParamList, 'Trace'>;
