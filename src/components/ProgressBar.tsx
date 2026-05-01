import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface ProgressBarProps {
  progress: number; 
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${clampedProgress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 12,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
});