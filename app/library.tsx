// library.tsx
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

interface LibraryScreenProps {}

const LibraryScreen: React.FC<LibraryScreenProps> = () => {
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

    if (searchQuery.trim()) {
      filtered = filtered.filter(affirmation =>
        affirmation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affirmation.intent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affirmation.tone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affirmation.affirmationTexts.some(text => 
          text.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(affirmation => affirmation.intent === selectedFilter);
    }

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

  const handlePlay = (affirmation: Affirmation) => {
    router.push({
      pathname: '/player',
      params: { id: affirmation.id }
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Affirmation',
      'Are you sure you want to delete this affirmation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeAffirmation(id) }
      ]
    );
  };

  const handleShare = async (affirmation: Affirmation) => {
    try {
      const shareText = `${affirmation.title}\n\n${affirmation.affirmationTexts.join('\n\n')}`;
      await Share.share({
        message: shareText,
        title: `Check out this affirmation: ${affirmation.title}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEditTitle = (id: string, newTitle: string) => {
    if (newTitle.trim()) {
      updateAffirmation(id, { title: newTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredAffirmations = filteredAndSortedAffirmations();

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundAlt]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back arrow and Settings gear */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.title}>My Library</Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/settings')}
            accessibilityLabel="Settings"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search affirmations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filterLabel}>Filter by:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterChips}
            >
              {FILTER_OPTIONS.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}
                >
                  <Ionicons
                    name={filter.icon as any}
                    size={16}
                    color={selectedFilter === filter.id ? colors.background : colors.text}
                    style={styles.filterChipIcon}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === filter.id && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Sort by:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sortOptions}
            >
              {SORT_OPTIONS.map((sort) => (
                <TouchableOpacity
                  key={sort.id}
                  style={[
                    styles.sortChip,
                    selectedSort === sort.id && styles.sortChipActive,
                  ]}
                  onPress={() => setSelectedSort(sort.id)}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      selectedSort === sort.id && styles.sortChipTextActive,
                    ]}
                  >
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Affirmations List */}
        <View style={styles.affirmationsContainer}>
          {filteredAffirmations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No affirmations found</Text>
              <Text style={styles.emptySubtitle}>
                {affirmations.length === 0
                  ? "Create your first affirmation to get started!"
                  : "Try adjusting your search or filters."}
              </Text>
              {affirmations.length === 0 && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push('/create')}
                >
                  <Text style={styles.createButtonText}>Create Affirmation</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredAffirmations.map((affirmation) => (
              <View key={affirmation.id} style={styles.affirmationCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.cardArt}
                >
                  <View style={styles.cardContent}>
                    {editingId === affirmation.id ? (
                      <View style={styles.editContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editTitle}
                          onChangeText={setEditTitle}
                          autoFocus
                          selectTextOnFocus
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.saveButton]}
                            onPress={() => handleEditTitle(affirmation.id, editTitle)}
                          >
                            <Ionicons name="checkmark" size={20} color={colors.success} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => {
                              setEditingId(null);
                              setEditTitle('');
                            }}
                          >
                            <Ionicons name="close" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <>
                        <View style={styles.cardHeader}>
                          <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle} numberOfLines={1}>
                              {affirmation.title}
                            </Text>
                            <View style={styles.cardMeta}>
                              <Text style={styles.cardCategory}>{affirmation.intent}</Text>
                              <Text style={styles.cardTone}>{affirmation.tone}</Text>
                            </View>
                          </View>
                          <View style={styles.cardStats}>
                            <View style={styles.stat}>
                              <Ionicons name="play" size={14} color={colors.textSecondary} />
                              <Text style={styles.statText}>{affirmation.plays}</Text>
                            </View>
                            <View style={styles.stat}>
                              <Ionicons name="time" size={14} color={colors.textSecondary} />
                              <Text style={styles.statText}>
                                {formatDate(affirmation.date)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Text style={styles.cardText} numberOfLines={2}>
                          {affirmation.affirmationTexts[0]}
                        </Text>
                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handlePlay(affirmation)}
                          >
                            <Ionicons name="play" size={20} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                              setEditingId(affirmation.id);
                              setEditTitle(affirmation.title);
                            }}
                          >
                            <Ionicons name="create" size={20} color={colors.textSecondary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleShare(affirmation)}
                          >
                            <Ionicons name="share" size={20} color={colors.textSecondary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDelete(affirmation.id)}
                          >
                            <Ionicons name="trash" size={20} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 4,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
  },
  filtersContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipIcon: {
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.background,
    fontFamily: 'Inter_600SemiBold',
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
  },
  sortChipText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
  },
  sortChipTextActive: {
    color: colors.background,
    fontFamily: 'Inter_600SemiBold',
  },
  affirmationsContainer: {
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background,
  },
  affirmationCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardArt: {
    padding: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.primary,
    marginRight: 8,
  },
  cardTone: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  cardStats: {
    alignItems: 'flex-end',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  editContainer: {
    flex: 1,
  },
  editInput: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    marginRight: 8,
  },
  cancelButton: {},
});

export default LibraryScreen;
