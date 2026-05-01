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
  TouchableOpacity,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CustomInput } from '../../components/CustomInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons'; 

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
          keyboardShouldPersistTaps="handled" 
        >

          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.header}>
            <View style={styles.placeholderLogo}>
              <Image
                source={require("../../../assets/logo_df_circulo 1.png")}
                style={styles.logoImage}
              />
            </View>
            <Text style={styles.appTitle}>Nova Jornada</Text>
            <Text style={styles.subtitle}>Crie sua conta e comece sua aventura épica</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📄</Text>
              <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
            </View>

            <CustomInput 
              icon="person-outline"
              placeholder="Nome completo" 
              value={name}
              onChangeText={setName}
            />
            
            <CustomInput 
              icon="mail-outline"
              placeholder="Email" 
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <CustomInput 
              icon="lock-closed-outline"
              placeholder="Senha (mín. 8 caracteres)" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <CustomInput 
              icon="checkmark-circle-outline"
              placeholder="Confirmar senha" 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

           
            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <Text style={styles.sectionIcon}>🛡️</Text>
              <Text style={styles.sectionTitle}>DADOS FÍSICOS</Text>
            </View>

           
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

          
            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <CustomInput 
                  placeholder="Peso (kg)" 
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInputContainer}>
                <CustomInput 
                  placeholder="Altura (cm)" 
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
            </View>

        
            <View style={styles.infoContainer}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>Calculamos calorias e personalizamos sua jornada</Text>
            </View>

          
            <View style={styles.actionsContainer}>
              <PrimaryButton title="CRIAR CONTA" onPress={handleRegister} />
              
              
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>
              
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
    paddingBottom: 60, 
    paddingTop: Platform.OS === 'ios' ? 50 : 30, 
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  placeholderLogo: {
    width: 85,
    height: 85,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  appTitle: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(245, 166, 35, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },


  formCard: {
    backgroundColor: Colors.surfaceDark,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
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
    letterSpacing: 1,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
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
  
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    paddingHorizontal: 12,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});