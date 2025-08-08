import { useSettingsStore } from '../store/settingsStore';

interface QuotaResponse {
  remaining: number;
  total: number;
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async checkQuota(): Promise<QuotaResponse | null> {
    const { settings } = useSettingsStore.getState();
    
    if (!settings.elevenLabsApiKey) {
      console.warn('ElevenLabs API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': settings.elevenLabsApiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return {
        remaining: data.subscription.character_limit - data.subscription.character_count,
        total: data.subscription.character_limit,
      };
    } catch (error) {
      console.error('Failed to check ElevenLabs quota:', error);
      return null;
    }
  }

  async generateSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM', modelId: string = 'eleven_multilingual_v2'): Promise<string | null> {
    const { settings } = useSettingsStore.getState();
    
    if (!settings.elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': settings.elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Text-to-speech API request failed with status ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUri = URL.createObjectURL(audioBlob);
      return audioUri;
    } catch (error) {
      console.error('Failed to generate speech:', error);
      throw error;
    }
  }

  async generateText(prompt: string, model: string = 'openrouter/auto'): Promise<string | null> {
    const { settings } = useSettingsStore.getState();
    
    if (!settings.openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Text generation API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Failed to generate text:', error);
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance();
