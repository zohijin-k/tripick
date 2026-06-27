import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { TraceScreen } from '../screens/TraceScreen';
import { SmartCourseScreen } from '../screens/SmartCourseScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="Trace" component={TraceScreen} />
      <Stack.Screen name="SmartCourse" component={SmartCourseScreen} />
    </Stack.Navigator>
  );
}
