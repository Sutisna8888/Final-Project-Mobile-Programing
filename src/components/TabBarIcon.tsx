import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

export const TabBarIcon = ({ name, color, style }: { name: any; color: string; style?: StyleProp<TextStyle> }) => {
  return <Ionicons name={name} size={28} style={[{ marginBottom: -3 }, style]} color={color} />;
};

