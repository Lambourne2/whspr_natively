import { Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
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
            <Image 
              source={require('../assets/images/whspr_white (1).png')} 
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
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

          <TouchableOpacity
            style={buttonStyles.secondary}
            onPress={() => {
              console.log('Navigate to sample tracks');
              router.push('/affirmation-player');
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="library" size={24} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.textSecondary }]}>
                Sample Tracks
              </Text>
            </View>
          </TouchableOpacity>
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