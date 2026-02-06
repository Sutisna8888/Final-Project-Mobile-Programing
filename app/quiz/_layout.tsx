import { Stack } from 'expo-router';

export default function QuizLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[categoryId]" />
      <Stack.Screen name="result" />
    </Stack>
  );
}