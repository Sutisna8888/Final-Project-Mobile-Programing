import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

interface Props {
  label: string;
  status: 'idle' | 'selected' | 'correct' | 'wrong';
  onPress: () => void;
  disabled: boolean;
}

export default function AnimatedOption({ label, status, onPress, disabled }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current; 
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    if (status !== 'selected') {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    if (status === 'selected') {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.02, duration: 500, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.98, duration: 500, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
      
    } else if (status === 'wrong') {
      scaleAnim.setValue(1);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      
    } else {
      scaleAnim.setValue(1);
      shakeAnim.setValue(0);
    }
  }, [status]);

  let backgroundColor = 'white';
  let borderColor = '#EEEEEE';
  let textColor = '#555';
  let iconName = null;
  let iconColor = 'white';

  if (status === 'selected') {
    borderColor = '#26C6DA';
    backgroundColor = '#E0F7FA';
    textColor = '#00838F';
  } else if (status === 'correct') {
    backgroundColor = '#4CAF50';
    borderColor = '#4CAF50';
    textColor = 'white';
    iconName = "checkmark-circle";
  } else if (status === 'wrong') {
    backgroundColor = '#F44336';
    borderColor = '#F44336';
    textColor = 'white';
    iconName = "close-circle";
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      onPress={disabled ? undefined : onPress}
    >
      <Animated.View style={[
        styles.container,
        { 
          backgroundColor, 
          borderColor,
          transform: [{ scale: scaleAnim }, { translateX: shakeAnim }]
        },
        status === 'correct' && styles.glow
      ]}>
        <Text style={[styles.text, { color: textColor, fontWeight: status !== 'idle' ? 'bold' : 'normal' }]}>
          {label}
        </Text>
        
        {status === 'idle' && (
          <View style={styles.radioCircle} />
        )}
        {status === 'selected' && (
          <View style={[styles.radioCircle, styles.radioSelected]}>
              <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
        {(status === 'correct' || status === 'wrong') && (
          <Ionicons name={iconName as any} size={24} color="white" />
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 18, borderRadius: 16, borderWidth: 2, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
  },
  text: { fontSize: 16, flex: 1, paddingRight: 10 },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { backgroundColor: '#26C6DA', borderColor: '#26C6DA' },
  
  glow: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 10
  }
});
