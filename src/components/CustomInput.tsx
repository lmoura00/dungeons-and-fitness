import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface CustomInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: TextInputProps["style"];
}

export function CustomInput({ style, containerStyle, icon, onFocus, onBlur, ...rest }: CustomInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.containerFocused, containerStyle]}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={focused ? Colors.primaryBase : Colors.textMuted}
          style={styles.icon}
        />
      )}
      <TextInput
        style={[styles.input, icon && styles.inputWithIcon, style]}
        placeholderTextColor={Colors.textMuted}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
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
    backgroundColor: Colors.surfaceDark,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  containerFocused: {
    borderWidth: 2,
    borderColor: Colors.primaryBase,
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
  },
});
