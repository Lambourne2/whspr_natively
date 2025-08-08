import { Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors } from '../styles/commonStyles';

export default function LibraryScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'sleep', name: 'Sleep' },
    { id: 'confidence', name: 'Confidence' },
    { id: 'stress', name: 'Stress Relief' },
    { id: 'motivation', name: 'Motivation' },
  ];

  const affirmations = [
    {
      id: 1,
      title: 'Deep Sleep Meditation',
      category: 'sleep',
      duration: '8:45',
      plays: 23,
      lastPlayed: '2 days ago',
      music: 'Ocean Waves',
      voice: 'Calm & Soothing'
    },
    {
      id: 2,
      title: 'Morning Confidence Boost',
      category: 'confidence',
      duration: '5:30',
      plays: 15,
      lastPlayed: '1 day ago',
      music: 'Soft Piano',
      voice: 'Warm & Gentle'
    },
    {
      id: 3,
      title: 'Stress Release & Calm',
      category: 'stress',
      duration: '6:15',
      plays: 18,
      lastPlayed: '3 hours ago',
      music: 'Forest Sounds',
      voice: 'Deep & Relaxing'
    },
    {
      id: 4,
      title: 'Self Love & Acceptance',
      category: 'confidence',
      duration: '4:20',
      plays: 12,
      lastPlayed: '5 days ago',
      music: 'Gentle Rain',
      voice: 'Soft & Whispered'
    },
  ];

  const filteredAffirmations = affirmations.filter(affirmation => {
    const matchesSearch = affirmation.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || affirmation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!fontsLoaded) {
    return null;
  }

  console.log('LibraryScreen rendered');

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 30 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold', flex: 1, textAlign: 'left' }]}>
            My Library
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log('Navigate to create');
              router.push('/create');
            }}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[commonStyles.input, { fontFamily: 'Inter_400Regular', paddingLeft: 48 }]}
              placeholder="Search affirmations..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons 
              name="search" 
              size={20} 
              color={colors.textMuted} 
              style={{ position: 'absolute', left: 16, top: 18 }}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={{ marginBottom: 24 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 12, paddingRight: 20 }}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={{
                    backgroundColor: selectedCategory === category.id ? colors.primary : colors.surface,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: selectedCategory === category.id ? colors.primary : colors.border,
                  }}
                  onPress={() => {
                    console.log(`Selected category: ${category.name}`);
                    setSelectedCategory(category.id);
                  }}
                >
                  <Text style={[
                    commonStyles.textMuted,
                    {
                      fontFamily: 'Inter_400Regular',
                      color: selectedCategory === category.id ? colors.text : colors.textMuted
                    }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Affirmations List */}
        <View style={{ marginBottom: 40 }}>
          {filteredAffirmations.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Ionicons name="library-outline" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
              <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', textAlign: 'center', marginBottom: 8 }]}>
                No affirmations found
              </Text>
              <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular', textAlign: 'center' }]}>
                Try adjusting your search or create a new affirmation
              </Text>
            </View>
          ) : (
            filteredAffirmations.map((affirmation) => (
              <TouchableOpacity
                key={affirmation.id}
                style={[commonStyles.card, { marginBottom: 16 }]}
                onPress={() => {
                  console.log(`Open affirmation: ${affirmation.title}`);
                  router.push(`/player?id=${affirmation.id}`);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', marginBottom: 4 }]}>
                      {affirmation.title}
                    </Text>
                    <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular', marginBottom: 8 }]}>
                      {affirmation.duration} • {affirmation.plays} plays • {affirmation.lastPlayed}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="musical-notes" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular', fontSize: 12 }]}>
                        {affirmation.music}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="mic" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[commonStyles.textMuted, { fontFamily: 'Inter_400Regular', fontSize: 12 }]}>
                        {affirmation.voice}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 20,
                        width: 40,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8,
                      }}
                      onPress={() => {
                        console.log(`Play affirmation: ${affirmation.title}`);
                      }}
                    >
                      <Ionicons name="play" size={20} color={colors.text} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        console.log(`More options for: ${affirmation.title}`);
                      }}
                    >
                      <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}