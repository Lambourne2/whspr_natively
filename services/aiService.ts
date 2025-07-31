import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { apiService } from './apiService';

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

export const generateAffirmation = async (params: GenerateAffirmationParams): Promise<GeneratedAffirmation> => {
  try {
    // Generate affirmation texts using OpenRouter API
    const prompt = generatePrompt(params);
    const generatedText = await apiService.generateText(prompt);
    
    if (!generatedText) {
      throw new Error('Failed to generate affirmation text');
    }
    
    // Parse the generated text into affirmation array
    const affirmationTexts = parseGeneratedText(generatedText);
    
    // Generate audio using ElevenLabs API
    const audioUri = await apiService.generateSpeech(affirmationTexts.join(' '), getVoiceId(params.voice));
    
    if (!audioUri) {
      throw new Error('Failed to generate affirmation audio');
    }
    
    // Calculate duration from actual audio
    const duration = await getAudioDuration(audioUri);
    
    return {
      audioUri,
      texts: affirmationTexts,
      duration,
    };
  } catch (error: any) {
    console.error('AI Generation error:', error);
    throw new Error(`Failed to generate affirmation: ${error.message || 'Unknown error'}`);
  }
};

const getVoiceId = (voiceName: string): string => {
  // Map voice names to ElevenLabs voice IDs
  const voiceMap: Record<string, string> = {
    'Female - Soft': '21m00Tcm4TlvDq8ikWAM', // Rachel
    'Female - Warm': 'AZnzlk1XvdvUeBnXmlld', // Domini
    'Male - Deep': 'CYw3kZ02Hs0563khs1Fj', // Clyde
    'Male - Calm': 'EXAVITRWM4VaoBX5IkoI', // Alex
    'Neutral - Gentle': 'TxGEqnHWrfWFTfGW9XjX', // Josh
  };
  
  return voiceMap[voiceName] || '21m00Tcm4TlvDq8ikWAM'; // Default to Rachel
};

const getAudioDuration = async (audioUri: string): Promise<string> => {
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync({ uri: audioUri });
    const status = await sound.getStatusAsync();
    
    if (status.isLoaded) {
      const durationMs = status.durationMillis || 0;
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return '0:00';
  } catch (error) {
    console.error('Failed to get audio duration:', error);
    return '0:00';
  }
};

const generatePrompt = (params: GenerateAffirmationParams): string => {
  return `Create 4 sleep affirmations for the intention of "${params.intention}" with a "${params.tone}" tone. ${params.customText ? `Incorporate this custom text: "${params.customText}"` : ''} Return only the affirmations, one per line. Each affirmation should be a complete sentence that promotes relaxation and sleep.`;
};

const parseGeneratedText = (text: string): string[] => {
  // Split the text into lines and filter out empty lines
  return text.split('\n').filter(line => line.trim().length > 0).slice(0, 4);
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
