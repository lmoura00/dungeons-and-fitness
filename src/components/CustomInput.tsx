import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface CustomInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap; 
}

export function CustomInput({ style, icon, ...rest }: CustomInputProps) {
  return (
    <View style={styles.container}>
      {icon && (
        <Ionicons name={icon} size={20} color={Colors.textSecondary} style={styles.icon} />
      )}
      <TextInput 
        style={[styles.input, icon && styles.inputWithIcon, style]}
        placeholderTextColor={Colors.textMuted}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface, 
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 12, 
  }
});