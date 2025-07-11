import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Button from '../components/Button';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [recentAffirmations] = useState([
    { id: 1, title: 'Morning Confidence', duration: '5:30', plays: 12 },
    { id: 2, title: 'Sleep Deeply', duration: '8:45', plays: 8 },
    { id: 3, title: 'Self Love', duration: '3:20', plays: 15 },
  ]);

  if (!fontsLoaded) {
    return null;
  }

  console.log('HomeScreen rendered');

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignSelf: 'center',
              marginBottom: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="moon" size={40} color={colors.text} />
          </LinearGradient>
          
          <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold' }]}>
            Whspr
          </Text>
          <Text style={[commonStyles.subtitle, { fontFamily: 'Inter_400Regular' }]}>
            Custom affirmations for peaceful sleep
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 30 }}>
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 16 }]}
            onPress={() => {
              console.log('Navigate to create affirmation');
              router.push('/create');
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[buttonStyles.primary, { margin: 0 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="add-circle" size={24} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.text }]}>
                  Create New Affirmation
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={buttonStyles.secondary}
            onPress={() => {
              console.log('Navigate to library');
              router.push('/library');
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="library" size={24} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.textSecondary }]}>
                My Library
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Affirmations */}
        <View style={{ marginBottom: 30 }}>
          <Text style={[commonStyles.subtitle, { fontFamily: 'Inter_600SemiBold', textAlign: 'left', marginBottom: 16 }]}>
            Recent Affirmations
          </Text>
          
          {recentAffirmations.map((affirmation) => (
            <TouchableOpacity
              key={affirmation.id}
              style={commonStyles.card}
              onPress={() => {
                console.log(`Play affirmation: ${affirmation.title}`);
                router.push(`/player?id=${affirmation.id}`);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 4 }]}>
                    {affirmation.title}
                  </Text>
                  <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular' }]}>
                    {affirmation.duration} • {affirmation.plays} plays
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    console.log(`Quick play: ${affirmation.title}`);
                  }}
                >
                  <Ionicons name="play" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <View style={{ marginBottom: 40 }}>
          <Text style={[commonStyles.subtitle, { fontFamily: 'Inter_600SemiBold', textAlign: 'left', marginBottom: 16 }]}>
            Features
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <TouchableOpacity
              style={[commonStyles.card, { flex: 1, marginRight: 8, alignItems: 'center' }]}
              onPress={() => {
                console.log('Navigate to AI generator');
                router.push('/ai-generate');
              }}
            >
              <Ionicons name="sparkles" size={32} color={colors.primary} style={{ marginBottom: 8 }} />
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', textAlign: 'center' }]}>
                AI Generate
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[commonStyles.card, { flex: 1, marginLeft: 8, alignItems: 'center' }]}
              onPress={() => {
                console.log('Navigate to voice settings');
                router.push('/voice-settings');
              }}
            >
              <Ionicons name="mic" size={32} color={colors.secondary} style={{ marginBottom: 8 }} />
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', textAlign: 'center' }]}>
                Voice Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}