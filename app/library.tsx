import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useAffirmationStore, Affirmation } from '../store/affirmationStore';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'sleep', label: 'Sleep', icon: 'moon' },
  { id: 'confidence', label: 'Confidence', icon: 'star' },
  { id: 'healing', label: 'Healing', icon: 'heart' },
  { id: 'abundance', label: 'Abundance', icon: 'diamond' },
  { id: 'love', label: 'Self-Love', icon: 'heart-circle' },
  { id: 'focus', label: 'Focus', icon: 'eye' },
];

const SORT_OPTIONS = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'plays', label: 'Most Played' },
  { id: 'title', label: 'Title A-Z' },
];

export default function LibraryScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { affirmations, removeAffirmation, updateAffirmation } = useAffirmationStore();

  if (!fontsLoaded) {
    return null;
  }

  const filteredAndSortedAffirmations = () => {
    let filtered = affirmations;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(affirmation =>
        affirmation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affirmation.intent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affirmation.tone.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(affirmation => affirmation.intent === selectedFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'recent':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'plays':
          return b.plays - a.plays;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleDelete = (affirmation: Affirmation) => {
    Alert.alert(
      'Delete Affirmation',
      `Are you sure you want to delete "${affirmation.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeAffirmation(affirmation.id),
        },
      ]
    );
  };

  const handleRename = (affirmation: Affirmation) => {
    setEditingId(affirmation.id);
    setEditTitle(affirmation.title);
  };

  const saveRename = () => {
    if (editingId && editTitle.trim()) {
      updateAffirmation(editingId, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleShare = async (affirmation: Affirmation) => {
    try {
      const message = `Check out my personalized affirmations from Whspr:\n\n"${affirmation.title}"\n\n${affirmation.affirmationTexts.slice(0, 3).join('\n')}\n\n...and more!`;
      
      await Share.share({
        message,
        title: affirmation.title,
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share affirmation.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterChips}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {FILTER_OPTIONS.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterChip,
            selectedFilter === filter.id && styles.selectedFilterChip,
          ]}
          onPress={() => setSelectedFilter(filter.id)}
        >
          <Ionicons
            name={filter.icon as any}
            size={16}
            color={selectedFilter === filter.id ? colors.text : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.filterChipText,
              { color: selectedFilter === filter.id ? colors.text : colors.textSecondary },
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSortOptions = () => (
    <View style={styles.sortOptions}>
      <Text style={[styles.sortLabel, { fontFamily: 'Inter_600SemiBold' }]}>
        Sort by:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortOption,
              selectedSort === option.id && styles.selectedSortOption,
            ]}
            onPress={() => setSelectedSort(option.id)}
          >
            <Text
              style={[
                styles.sortOptionText,
                { color: selectedSort === option.id ? colors.primary : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAffirmationCard = (affirmation: Affirmation) => (
    <View key={affirmation.id} style={styles.affirmationCard}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => router.push(`/player?id=${affirmation.id}`)}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardArt}
        >
          <Ionicons name="moon" size={24} color={colors.text} />
        </LinearGradient>

        <View style={styles.cardInfo}>
          {editingId === affirmation.id ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editTitle}
                onChangeText={setEditTitle}
                onSubmitEditing={saveRename}
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={saveRename} style={styles.editAction}>
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelRename} style={styles.editAction}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.cardTitle, { fontFamily: 'Inter_600SemiBold' }]}>
                {affirmation.title}
              </Text>
              <Text style={[styles.cardMeta, { fontFamily: 'Inter_400Regular' }]}>
                {affirmation.intent} • {affirmation.tone} • {formatDate(affirmation.date)}
              </Text>
              <Text style={[styles.cardStats, { fontFamily: 'Inter_400Regular' }]}>
                {affirmation.duration} • {affirmation.plays} plays
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push(`/player?id=${affirmation.id}`)}
        >
          <Ionicons name="play" size={20} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRename(affirmation)}
        >
          <Ionicons name="pencil" size={16} color={colors.textSecondary} />
          <Text style={styles.actionText}>Rename</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(affirmation)}
        >
          <Ionicons name="share" size={16} color={colors.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(affirmation)}
        >
          <Ionicons name="trash" size={16} color={colors.textSecondary} />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredAffirmations = filteredAndSortedAffirmations();

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.title, { fontFamily: 'Inter_700Bold' }]}>
          My Library
        </Text>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        >
          <Ionicons name="options" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search affirmations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      {renderFilterChips()}

      {/* Sort Options */}
      {showFilters && renderSortOptions()}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { fontFamily: 'Inter_400Regular' }]}>
          {filteredAffirmations.length} of {affirmations.length} affirmations
        </Text>
      </View>

      {/* Affirmations List */}
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {filteredAffirmations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="library" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { fontFamily: 'Inter_600SemiBold' }]}>
              {affirmations.length === 0 ? 'No Affirmations Yet' : 'No Results Found'}
            </Text>
            <Text style={[styles.emptySubtitle, { fontFamily: 'Inter_400Regular' }]}>
              {affirmations.length === 0
                ? 'Create your first personalized affirmation to get started'
                : 'Try adjusting your search or filters'}
            </Text>
            {affirmations.length === 0 && (
              <TouchableOpacity
                style={buttonStyles.primary}
                onPress={() => router.push('/create')}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[buttonStyles.primary, { margin: 0 }]}
                >
                  <Text style={[commonStyles.text, { fontFamily: 'Inter_600SemiBold', color: colors.text }]}>
                    Create Affirmations
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.affirmationsList}>
            {filteredAffirmations.map(renderAffirmationCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  filterChips: {
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortOptions: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  selectedSortOption: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 6,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  affirmationsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  affirmationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardArt: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardStats: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playButton: {
    backgroundColor: `${colors.primary}20`,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  editActions: {
    flexDirection: 'row',
  },
  editAction: {
    padding: 4,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
});

