import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarIcon } from '../../src/components/TabBarIcon';

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: '#A0AEC0',
        
        tabBarHideOnKeyboard: true, 

        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'android' ? 0 : (insets.bottom ),

          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 0,
          height: 50, 
          borderTopWidth: 0,
          
          elevation: 5, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          
          paddingBottom: 1,
          paddingTop: 1,
          
          marginBottom: Platform.OS === 'android' ? insets.bottom : 0,
        },
        
        tabBarItemStyle: {
           height: 50, 
           justifyContent: 'center',
           alignItems: 'center',
           paddingVertical: -2,
        },

        tabBarLabelStyle: {
           fontSize: 10,
           fontWeight: '600',
           marginTop: 2,
        },
      }}>
      
      <Tabs.Screen
        name="home"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'game-controller' : 'game-controller-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen name="level" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="edit-profile" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="study-target" options={{ href: null, tabBarStyle: { display: 'none' } }} /> 
    </Tabs>
  );
}