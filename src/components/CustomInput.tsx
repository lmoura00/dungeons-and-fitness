import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface CustomInputProps extends TextInputProps {}

export function CustomInput({ style, ...rest }: CustomInputProps) {
  return (
    <View style={styles.container}>
      <TextInput 
        style={[styles.input, style]}
        placeholderTextColor={Colors.textSecondary}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    height: 56,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3D2B1F'
  },
});