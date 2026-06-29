import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { Colors } from '../constants/Colors';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'solid' | 'outline';
}

export function PrimaryButton({ title, variant = 'solid', style, ...rest }: PrimaryButtonProps) {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOutline ? styles.buttonOutline : styles.buttonSolid,
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      <Text style={[styles.text, isOutline && styles.textOutline]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonSolid: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  text: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textOutline: {
    color: Colors.primary,
  },
});
