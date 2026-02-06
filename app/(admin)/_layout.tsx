import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false 
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="manage/[categoryId]" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
}