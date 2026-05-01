import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Image, 
  PanResponder,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { PrimaryButton } from '../../components/PrimaryButton';

const RACES = [
  { 
    id: 'human', 
    name: 'Humano', 
    imageSource: require('../../../assets/race-human.png'), 
    desc: 'Versáteis e ambiciosos, humanos se adaptam a qualquer desafio físico.', 
    skills: ['+5% de bônus em todo XP', 'Recuperação padrão'] 
  },
  { 
    id: 'dwarf', 
    name: 'Anão', 
    imageSource: require('../../../assets/race-dwarf.png'), 
    desc: 'Robustos e resilientes, os anões são conhecidos por sua força extraordinária e resistência lendária nas batalhas mais intensas.', 
    skills: ['Força Anã (+15% força)', 'Resiliência de Pedra (recuperação rápida)'] 
  },
  { 
    id: 'elf', 
    name: 'Elfo', 
    imageSource: require('../../../assets/race-elf.png'), 
    desc: 'Ágeis e precisos, elfos possuem uma estamina invejável para longas jornadas.', 
    skills: ['Agilidade Élfica (+20% cardio)', 'Foco mental'] 
  }
];

export default function ChooseRaceScreen() {
  const [selectedRace, setSelectedRace] = useState(RACES[1]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          setSelectedRace((prevRace) => {
            const currentIndex = RACES.findIndex(r => r.id === prevRace.id);
            return currentIndex > 0 ? RACES[currentIndex - 1] : prevRace;
          });
        } else if (gestureState.dx < -50) {
          setSelectedRace((prevRace) => {
            const currentIndex = RACES.findIndex(r => r.id === prevRace.id);
            return currentIndex < RACES.length - 1 ? RACES[currentIndex + 1] : prevRace;
          });
        }
      },
    })
  ).current;

  const handleNext = () => {
    router.push({ pathname: '/(onboarding)/name', params: { raceId: selectedRace.id, raceName: selectedRace.name } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
             <Text style={styles.skipText}>Pular ➝</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.stepText}>PASSO 1 DE 3</Text>
        <Text style={styles.title}>Escolha sua Raça</Text>
        <Text style={styles.subtitle}>Cada raça possui habilidades únicas</Text>

        <View {...panResponder.panHandlers}>
          
          <View style={styles.raceSelector}>
            {RACES.map((race) => (
              <TouchableOpacity 
                key={race.id}
                style={[styles.raceIconWrapper, selectedRace.id === race.id && styles.raceIconSelected]}
                onPress={() => setSelectedRace(race)}
              >
                <View style={[styles.imageContainer, selectedRace.id === race.id && styles.imageContainerSelected]}>
                  <Image 
                    source={race.imageSource} 
                    style={styles.raceImage} 
                    resizeMode="cover"
                  />
                </View>
                <Text style={[styles.raceName, selectedRace.id === race.id && styles.raceNameSelected]}>
                  {race.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
               <Image source={selectedRace.imageSource} style={styles.infoCardImage} />
               <Text style={styles.infoCardTitle}>{selectedRace.name}</Text>
            </View>
            <Text style={styles.infoCardDesc}>{selectedRace.desc}</Text>
            
            <View style={styles.divider} />

            <Text style={styles.skillsTitle}>ARTES DA RAÇA</Text>
            {selectedRace.skills.map((skill, index) => (
              <View key={index} style={styles.skillRow}>
                <Ionicons name="star" size={12} color={Colors.primary} style={styles.skillIcon} />
                <Text style={styles.skillItem}>{skill}</Text>
              </View>
            ))}
          </View>

        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {RACES.map((race) => (
              <View 
                key={race.id} 
                style={[
                  styles.dot, 
                  selectedRace.id === race.id && styles.dotActive
                ]} 
              />
            ))}
          </View>
          <PrimaryButton title="PRÓXIMO" onPress={handleNext} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  content: { 
    padding: 24, 
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 10 : 20, 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 32 
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: Colors.surfaceDark, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: Colors.border 
  },
  skipText: { 
    color: Colors.textMuted, 
    fontSize: 14, 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepText: { 
    color: Colors.textSecondary, 
    fontSize: 12, 
    letterSpacing: 1, 
    textAlign: 'center', 
    marginBottom: 8, 
    fontWeight: '700' 
  },
  title: { 
    color: Colors.primary, 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 4,
    textShadowColor: 'rgba(245, 166, 35, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: { 
    color: Colors.textSecondary, 
    fontSize: 14, 
    textAlign: 'center', 
    marginBottom: 32 
  },
  
  raceSelector: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 32 
  },
  raceIconWrapper: { 
    alignItems: 'center', 
    opacity: 0.5, 
    transform: [{ scale: 0.9 }] 
  },
  raceIconSelected: { 
    opacity: 1, 
    transform: [{ scale: 1.1 }] 
  },
  imageContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageContainerSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  raceImage: { 
    width: '100%', 
    height: '100%', 
  },
  raceName: { 
    color: Colors.textSecondary, 
    fontSize: 14, 
    fontWeight: '600' 
  },
  raceNameSelected: { 
    color: Colors.primary, 
    fontWeight: 'bold' 
  },
  
  infoCard: { 
    backgroundColor: Colors.surfaceDark, 
    borderRadius: 20, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  infoHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  infoCardImage: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    marginRight: 16, 
    borderWidth: 2, 
    borderColor: Colors.primary 
  },
  infoCardTitle: { 
    color: Colors.textPrimary, 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  infoCardDesc: { 
    color: Colors.textSecondary, 
    fontSize: 14, 
    lineHeight: 22, 
    marginBottom: 20 
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
    width: '100%',
  },
  skillsTitle: { 
    color: Colors.primary, 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    letterSpacing: 1 
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillIcon: {
    marginRight: 8,
  },
  skillItem: { 
    color: Colors.textPrimary, 
    fontSize: 14,
    fontWeight: '500',
  },
  
  footer: { 
    marginTop: 'auto' 
  },
  pagination: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 24 
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: Colors.border, 
    marginHorizontal: 4 
  },
  dotActive: { 
    backgroundColor: Colors.primary, 
    width: 24 
  },
});