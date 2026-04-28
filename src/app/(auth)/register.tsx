import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CustomInput } from '../../components/CustomInput';
import { PrimaryButton } from '../../components/PrimaryButton';
// Usaremos ícones nativos do Expo
import Ionicons from '@expo/vector-icons/Ionicons'; 

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Novos estados para a seção física
  const [gender, setGender] = useState<'M' | 'F' | 'O' | null>('M'); 
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const handleRegister = () => {
    console.log('Registrando:', { name, email, gender, weight, height });
    router.push('/(onboarding)/choose-race');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Botão Voltar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Cabeçalho com Logo */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              {/* O ideal aqui é trocar por uma <Image source={...} /> depois */}
              <Text style={styles.logoText}>D&F</Text> 
            </View>
            <Text style={styles.subtitle}>Crie sua conta e comece sua aventura</Text>
          </View>

          <View style={styles.formContainer}>
            
            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📄</Text>
              <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
            </View>

            <CustomInput 
              placeholder="Nome completo" 
              value={name}
              onChangeText={setName}
            />
            
            <CustomInput 
              placeholder="Email" 
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <CustomInput 
              placeholder="Senha (mín. 8 caracteres)" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <CustomInput 
              placeholder="Confirmar senha" 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* SEÇÃO 2: DADOS FÍSICOS */}
            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <Text style={styles.sectionIcon}>🛡️</Text>
              <Text style={styles.sectionTitle}>DADOS FÍSICOS</Text>
            </View>

            {/* Seletor de Gênero */}
            <View style={styles.genderRow}>
              {(['M', 'F', 'O'] as const).map((item) => (
                <TouchableOpacity 
                  key={item}
                  style={[
                    styles.genderButton,
                    gender === item && styles.genderButtonActive
                  ]}
                  onPress={() => setGender(item)}
                >
                  <Text style={styles.genderTextIcon}>
                    {item === 'M' ? '♂️' : item === 'F' ? '♀️' : '⚧️'}
                  </Text>
                  <Text style={[
                    styles.genderText,
                    gender === item && styles.genderTextActive
                  ]}>
                    {item === 'M' ? 'Masc.' : item === 'F' ? 'Fem.' : 'Outro'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Peso e Altura lado a lado */}
            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <CustomInput 
                  placeholder="Peso (kg)" 
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  style={styles.halfInput}
                />
              </View>
              <View style={styles.halfInputContainer}>
                <CustomInput 
                  placeholder="Altura (cm)" 
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  style={styles.halfInput}
                />
              </View>
            </View>

            {/* Aviso Lâmpada */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>Calculamos calorias e personalizamos sua jornada</Text>
            </View>

            {/* Botões Finais */}
            <View style={styles.actionsContainer}>
              <PrimaryButton title="CRIAR CONTA" onPress={handleRegister} />
              
              <Text style={styles.orText}>ou</Text>
              
              <PrimaryButton title="JÁ TENHO CONTA" variant="outline" onPress={handleGoBack} />
            </View>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'ios' ? 50 : 20, 
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  genderTextIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  genderText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  genderTextActive: {
    color: Colors.background, 
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  halfInput: {
    // Caso queira algum estilo extra só nos inputs pela metade
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  actionsContainer: {
    alignItems: 'center',
  },
  orText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginVertical: 12,
  }
});