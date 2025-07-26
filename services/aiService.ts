import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

interface GenerateAffirmationParams {
  intention: string;
  tone: string;
  voice: string;
  customText?: string;
}

interface GeneratedAffirmation {
  audioUri: string;
  texts: string[];
  duration: string;
}

// Mock AI service - in production, this would connect to a real AI service
export const generateAffirmation = async (params: GenerateAffirmationParams): Promise<GeneratedAffirmation> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate affirmation texts based on intention and tone
    const affirmationTexts = generateAffirmationTexts(params);
    
    // Create audio file (in production, this would use TTS API)
    const audioUri = await createMockAudioFile(affirmationTexts, params);
    
    return {
      audioUri,
      texts: affirmationTexts,
      duration: '5:00', // Mock duration
    };
  } catch (error) {
    console.error('AI Generation error:', error);
    throw new Error('Failed to generate affirmation');
  }
};

const generateAffirmationTexts = (params: GenerateAffirmationParams): string[] => {
  const { intention, tone, customText } = params;
  
  const baseAffirmations = {
    'Deep Sleep': [
      'I am safe and protected as I drift into peaceful sleep.',
      'My body knows how to rest deeply and wake refreshed.',
      'Each breath carries me deeper into relaxation.',
      'I release all tension and welcome restful sleep.',
    ],
    'Stress Relief': [
      'I release all stress and tension from my body and mind.',
      'Peace flows through me with every breath.',
      'I am calm, centered, and at ease.',
      'All is well, and I am safe.',
    ],
    'Self-Love': [
      'I am worthy of love and respect.',
      'I love and accept myself exactly as I am.',
      'I am enough, just as I am.',
      'I treat myself with kindness and compassion.',
    ],
    'Confidence': [
      'I trust in my abilities and inner wisdom.',
      'I am capable of handling whatever comes my way.',
      'I believe in myself and my potential.',
      'I am strong, confident, and resilient.',
    ],
    'Gratitude': [
      'I am grateful for this day and all its blessings.',
      'Thank you for the gift of rest and renewal.',
      'I appreciate the peace that surrounds me.',
      'Gratitude fills my heart as I prepare for sleep.',
    ],
    'Healing': [
      'My body and mind are healing and restoring themselves.',
      'Every cell in my body is working for my highest good.',
      'I am open to receiving healing energy.',
      'Rest brings renewal and restoration to my entire being.',
    ],
    'Success': [
      'I am aligned with my highest potential.',
      'Success flows to me naturally and easily.',
      'I am creating the life of my dreams.',
      'I trust the process of my life.',
    ],
    'Inner Peace': [
      'Peace is my natural state of being.',
      'I am centered and calm in all situations.',
      'Tranquility fills my mind and heart.',
      'I choose peace over worry.',
    ],
    'Anxiety Relief': [
      'I am safe and all is well.',
      'My mind is calm and my heart is peaceful.',
      'I release all anxious thoughts.',
      'I breathe in calm and breathe out tension.',
    ],
    'Positive Energy': [
      'I radiate positive energy and attract good things.',
      'My energy is aligned with joy and abundance.',
      'I am a magnet for positive experiences.',
      'Light and love surround me.',
    ],
  };

  let affirmations = baseAffirmations[intention as keyof typeof baseAffirmations] || baseAffirmations['Deep Sleep'];
  
  // Add custom text if provided
  if (customText) {
    affirmations = [...affirmations, customText];
  }
  
  // Adjust tone
  const toneAdjustments = {
    'Gentle & Calming': (text: string) => text.replace(/\./g, ', gently and peacefully.'),
    'Empowering': (text: string) => text.replace(/\./g, ', powerfully and confidently.'),
    'Nurturing': (text: string) => text.replace(/\./g, ', with love and care.'),
    'Uplifting': (text: string) => text.replace(/\./g, ', joyfully and optimistically.'),
    'Grounding': (text: string) => text.replace(/\./g, ', steadily and securely.'),
    'Soothing': (text: string) => text.replace(/\./g, ', soothingly and calmly.'),
  };
  
  const toneAdjuster = toneAdjustments[tone as keyof typeof toneAdjustments];
  if (toneAdjuster) {
    affirmations = affirmations.map(toneAdjuster);
  }
  
  return affirmations.slice(0, 4); // Return 4 affirmations
};

const createMockAudioFile = async (texts: string[], params: GenerateAffirmationParams): Promise<string> => {
  // In production, this would use a TTS service
  // For now, create a silent audio file as placeholder
  
  const audioContent = generateMockAudioContent(texts, params);
  const fileName = `affirmation_${Date.now()}.mp3`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
  // Create a simple mock audio file (in production, use real TTS)
  // For now, return a placeholder URI
  return fileUri;
};

const generateMockAudioContent = (texts: string[], params: GenerateAffirmationParams): string => {
  // This would be replaced with actual TTS generation
  return `Mock audio for: ${texts.join(' ')} with ${params.voice} voice`;
};

// Utility function to validate generated audio
export const validateAudioFile = async (audioUri: string): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    return fileInfo.exists;
  } catch {
    return false;
  }
};

// Function to delete generated audio files
export const cleanupAudioFile = async (audioUri: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(audioUri);
  } catch (error) {
    console.error('Failed to cleanup audio file:', error);
  }
};
