import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CustomInput } from '../../components/CustomInput';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login:', email);
    // Redirecionar para o Dashboard temporariamente para testar o fluxo
    // router.replace('/(tabs)/dashboard');
  };

  const handleCreateAccount = () => {
    router.push('/(auth)/register');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          
          <View style={styles.logoContainer}>
            {/* Substitua pelo SVG/Imagem real do seu brasão D&F */}
            <View style={styles.placeholderLogo}>
              <Text style={styles.logoText}>D&F</Text>
            </View>
            <Text style={styles.subtitle}>Transforme seu sedentarismo em uma aventura épica de RPG.</Text>
          </View>

          <View style={styles.formContainer}>
            <CustomInput 
              placeholder="seu@email.com" 
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <CustomInput 
              placeholder="Senha" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.forgotPassword}>Esqueci minha senha</Text>

            <PrimaryButton title="Entrar" onPress={handleLogin} />
            <PrimaryButton title="Criar Conta" variant="outline" onPress={handleCreateAccount} />
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-evenly',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  placeholderLogo: {
    width: 120,
    height: 120,
    backgroundColor: Colors.surface,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 24,
  },
  logoText: {
    color: Colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  forgotPassword: {
    color: Colors.primary,
    textAlign: 'right',
    marginBottom: 24,
    fontWeight: '600',
  }
});