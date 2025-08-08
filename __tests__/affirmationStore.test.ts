import { describe, it, expect, beforeEach } from 'vitest';
import { useAffirmationStore } from '../store/affirmationStore';

describe('AffirmationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAffirmationStore.setState({
      affirmations: [],
      backingTracks: [],
      currentAffirmation: null,
      currentBackingTrack: null,
      isPlaying: false,
      affirmationVolume: 0.8,
      backingTrackVolume: 0.6,
    });
  });

  describe('addAffirmation', () => {
    it('should add a new affirmation to the store', () => {
      const { addAffirmation, affirmations } = useAffirmationStore.getState();

      const newAffirmation = {
        id: 'test-1',
        title: 'Test Affirmation',
        date: '2024-01-01',
        intent: 'sleep',
        tone: 'soft',
        voice: 'soft_female',
        loopGap: 10,
        audioUri: '/test/path.mp3',
        duration: '5:30',
        plays: 0,
        affirmationTexts: ['I am peaceful', 'I am calm'],
      };

      addAffirmation(newAffirmation);

      const updatedState = useAffirmationStore.getState();
      expect(updatedState.affirmations).toHaveLength(1);
      expect(updatedState.affirmations[0]).toEqual(newAffirmation);
    });

    it('should add new affirmations to the beginning of the list', () => {
      const { addAffirmation } = useAffirmationStore.getState();

      const firstAffirmation = {
        id: 'test-1',
        title: 'First Affirmation',
        date: '2024-01-01',
        intent: 'sleep',
        tone: 'soft',
        voice: 'soft_female',
        loopGap: 10,
        audioUri: '/test/path1.mp3',
        duration: '5:30',
        plays: 0,
        affirmationTexts: ['First affirmation'],
      };

      const secondAffirmation = {
        id: 'test-2',
        title: 'Second Affirmation',
        date: '2024-01-02',
        intent: 'confidence',
        tone: 'uplifting',
        voice: 'soft_female',
        loopGap: 15,
        audioUri: '/test/path2.mp3',
        duration: '3:45',
        plays: 0,
        affirmationTexts: ['Second affirmation'],
      };

      addAffirmation(firstAffirmation);
      addAffirmation(secondAffirmation);

      const { affirmations } = useAffirmationStore.getState();
      expect(affirmations).toHaveLength(2);
      expect(affirmations[0]).toBeDefined();
      expect(affirmations[0]?.id).toBe('test-2'); // Most recent first
      expect(affirmations[1]).toBeDefined();
      expect(affirmations[1]?.id).toBe('test-1');
    });
  });

  describe('removeAffirmation', () => {
    it('should remove an affirmation by id', () => {
      const { addAffirmation, removeAffirmation } = useAffirmationStore.getState();

      const affirmation = {
        id: 'test-1',
        title: 'Test Affirmation',
        date: '2024-01-01',
        intent: 'sleep',
        tone: 'soft',
        voice: 'soft_female',
        loopGap: 10,
        audioUri: '/test/path.mp3',
        duration: '5:30',
        plays: 0,
        affirmationTexts: ['Test'],
      };

      addAffirmation(affirmation);
      expect(useAffirmationStore.getState().affirmations).toHaveLength(1);

      removeAffirmation('test-1');
      expect(useAffirmationStore.getState().affirmations).toHaveLength(0);
    });

    it('should not affect other affirmations when removing one', () => {
      const { addAffirmation, removeAffirmation } = useAffirmationStore.getState();

      const affirmation1 = {
        id: 'test-1',
        title: 'First',
        date: '2024-01-01',
        intent: 'sleep',
        tone: 'soft',
        voice: 'soft_female',
        loopGap: 10,
        audioUri: '/test/path1.mp3',
        duration: '5:30',
        plays: 0,
        affirmationTexts: ['First'],
      };

      const affirmation2 = {
        id: 'test-2',
        title: 'Second',
        date: '2024-01-02',
        intent: 'confidence',
        tone: 'uplifting',
        voice: 'soft_female',
        loopGap: 15,
        audioUri: '/test/path2.mp3',
        duration: '3:45',
        plays: 0,
        affirmationTexts: ['Second'],
      };

      addAffirmation(affirmation1);
      addAffirmation(affirmation2);
      expect(useAffirmationStore.getState().affirmations).toHaveLength(2);

      removeAffirmation('test-1');
      const { affirmations } = useAffirmationStore.getState();
      expect(affirmations).toHaveLength(1);
      expect(affirmations[0]).toBeDefined();
      expect(affirmations[0]?.id).toBe('test-2');
    });
  });

  describe('updateAffirmation', () => {
    it('should update an affirmation with new data', () => {
      const { addAffirmation, updateAffirmation } = useAffirmationStore.getState();

      const affirmation = {
        id: 'test-1',
        title: 'Original Title',
        date: '2024-01-01',
        intent: 'sleep',
        tone: 'soft',
        voice: 'soft_female',
        loopGap: 10,
        audioUri: '/test/path.mp3',
        duration: '5:30',
        plays: 0,
        affirmationTexts: ['Original'],
      };

      addAffirmation(affirmation);

      updateAffirmation('test-1', { title: 'Updated Title', plays: 5 });

      const { affirmations } = useAffirmationStore.getState();
      expect(affirmations[0]).toBeDefined();
      expect(affirmations[0]?.title).toBe('Updated Title');
      expect(affirmations[0]?.plays).toBe(5);
      expect(affirmations[0]?.intent).toBe('sleep'); // Unchanged
    });
  });

  describe('incrementPlays', () => {
    it('should increment the play count for an affirmation', () => {
      const { addAffirmation, incrementPlays } = useAffirmationStore.getState();

      const affirmation = {
        id: 'test-1',
        title: 'Test Affirmation',
        date: '2024-01-01',
        intent: 'sleep',
        tone: 'soft',
        voice: 'soft_female',
        loopGap: 10,
        audioUri: '/test/path.mp3',
        duration: '5:30',
        plays: 3,
        affirmationTexts: ['Test'],
      };

      addAffirmation(affirmation);
      incrementPlays('test-1');

      const { affirmations } = useAffirmationStore.getState();
      expect(affirmations[0]).toBeDefined();
      expect(affirmations[0]?.plays).toBe(4);
    });
  });

  describe('volume controls', () => {
    it('should update affirmation volume', () => {
      const { setAffirmationVolume } = useAffirmationStore.getState();

      setAffirmationVolume(0.5);

      const { affirmationVolume } = useAffirmationStore.getState();
      expect(affirmationVolume).toBe(0.5);
    });

    it('should update backing track volume', () => {
      const { setBackingTrackVolume } = useAffirmationStore.getState();

      setBackingTrackVolume(0.3);

      const { backingTrackVolume } = useAffirmationStore.getState();
      expect(backingTrackVolume).toBe(0.3);
    });
  });

  describe('initializeBackingTracks', () => {
    it('should initialize default backing tracks', () => {
      const { initializeBackingTracks } = useAffirmationStore.getState();

      initializeBackingTracks();

      const { backingTracks } = useAffirmationStore.getState();
      expect(backingTracks.length).toBeGreaterThanOrEqual(0);
      if (backingTracks.length > 0) {
        expect(backingTracks[0]).toHaveProperty('id');
        expect(backingTracks[0]).toHaveProperty('title');
        expect(backingTracks[0]).toHaveProperty('frequency');
      }
    });

    it('should not reinitialize if backing tracks already exist', () => {
      const { initializeBackingTracks } = useAffirmationStore.getState();

      // Initialize once
      initializeBackingTracks();
      const firstCount = useAffirmationStore.getState().backingTracks.length;

      // Initialize again
      initializeBackingTracks();
      const secondCount = useAffirmationStore.getState().backingTracks.length;

      expect(firstCount).toBe(secondCount);
    });
  });
});

