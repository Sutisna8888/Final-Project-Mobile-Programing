import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  maxWidth?: number;
  style?: ViewStyle;
}

export default function ResponsiveContainer({ children, maxWidth = 500, style }: Props) {
  return (
    <View style={styles.outer}>
      <View style={[styles.inner, { maxWidth }, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center', 
    width: '100%',
  },
  inner: {
    width: '100%',
    flex: 1,
  }
});