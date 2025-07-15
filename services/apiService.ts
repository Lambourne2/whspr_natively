import { useSettingsStore } from '../store/settingsStore';

export interface AffirmationRequest {
  intent: string;
  tone: string;
  count?: number;
}

export interface AffirmationResponse {
  affirmations: string[];
}

export interface TTSRequest {
  text: string;
  voice: string;
}

export interface TTSResponse {
  audioUrl: string;
  audioData: ArrayBuffer;
}

class ApiService {
  private static instance: ApiService;
  private requestQueue: Promise<any>[] = [];

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit,
    responseType: 'json' | 'arraybuffer' = 'json',
    retryCount = 0
  ): Promise<T> {
    const maxRetries = 3;
    const baseDelay = 1000;

    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        // Rate limited - exponential backoff
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest<T>(url, options, responseType, retryCount + 1);
        }
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Error Response:', errorBody);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      if (responseType === 'arraybuffer') {
        return (await response.arrayBuffer()) as T;
      }
      return (await response.json()) as T;
    } catch (error) {
      if (retryCount < maxRetries && error instanceof Error && error.message.includes('network')) {
        const delay = baseDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(url, options, responseType, retryCount + 1);
      }
      throw error;
    }
  }

  async generateAffirmations(request: AffirmationRequest): Promise<AffirmationResponse> {
    const { settings } = useSettingsStore.getState();
    
    if (!settings.openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `Generate ${request.count || 12} concise, first-person present-tense affirmations for ${request.intent} with a ${request.tone} tone. 
    
    Requirements:
    - Each affirmation should be 5-15 words
    - Use present tense ("I am", "I have", "I feel")
    - Make them personal and empowering
    - Suitable for sleep/relaxation context
    - Return as a JSON array of strings
    
    Intent: ${request.intent}
    Tone: ${request.tone}
    
    Return only the JSON array, no additional text.`;

    const response = await this.makeRequest<{ choices: Array<{ message: { content: string } }> }>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://whspr.app',
          'X-Title': 'Whspr Affirmation App',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    try {
      const content = response?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content found in AI response');
      }
      
      // Find the start and end of the JSON array
      const startIndex = content.indexOf('[');
      const endIndex = content.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('No JSON array found in the response');
      }
      
      const jsonString = content.substring(startIndex, endIndex + 1);
      const affirmations = JSON.parse(jsonString);
      
      if (!Array.isArray(affirmations)) {
        throw new Error('Parsed content is not an array');
      }

      return { affirmations };
    } catch (error) {
      console.error('Error parsing affirmations:', error);
      throw new Error('Failed to parse affirmations from AI response');
    }
  }

  async synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    const { settings } = useSettingsStore.getState();
    
    if (!settings.elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Check if we're within concurrent request limits
    if (this.requestQueue.length >= settings.maxConcurrentTtsCalls) {
      await Promise.race(this.requestQueue);
    }

    const voiceId = this.getVoiceId(request.voice);
    
    const requestPromise = this.makeRequest<ArrayBuffer>(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': settings.elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
          output_format: 'pcm_24000',
        }),
      },
      'arraybuffer'
    ).then(async (response) => {
      // Remove from queue when completed
      this.requestQueue = this.requestQueue.filter(p => p !== requestPromise);
      return response;
    });

    this.requestQueue.push(requestPromise);

    const audioData = await requestPromise;
    
    return {
      audioUrl: '', // Will be set when saved to file system
      audioData,
    };
  }

  private getVoiceId(voiceName: string): string {
    const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella
    // Map voice names to ElevenLabs voice IDs
    const voiceMap: Record<string, string> = {
      'soft_female': DEFAULT_VOICE_ID,
      'calm_male': 'VR6AewLTigWG4xSOukaG',   // Josh
      'warm_female': 'ThT5KcBeYPX3keUQqHPh', // Dorothy
      'gentle_male': 'ZQe5CqHNLWdVhrnuHIhO', // Callum
    };

    return voiceMap[voiceName] || DEFAULT_VOICE_ID;
  }

  async checkQuota(): Promise<{ remaining: number; total: number }> {
    try {
      const { settings } = useSettingsStore.getState();

      if (!settings.elevenLabsApiKey) {
        // Don't throw, just return zeroed-out quota
        return { total: 0, remaining: 0 };
      }

      const response = await this.makeRequest<{
        subscription: {
          tier: string;
          character_count: number;
          character_limit: number;
          can_extend_character_limit: boolean;
          allowed_to_extend_character_limit: boolean;
          next_character_count_reset_unix: number;
          voice_limit: number;
          professional_voice_limit: number;
          can_extend_voice_limit: boolean;
          can_use_instant_voice_cloning: boolean;
          can_use_professional_voice_cloning: boolean;
          status: string;
        };
        is_new_user: boolean;
        xi_api_key: string;
      }>(
        'https://api.elevenlabs.io/v1/user',
        {
          method: 'GET',
          headers: {
            'xi-api-key': settings.elevenLabsApiKey,
          },
        }
      );

      if (response && response.subscription) {
        return {
          total: response.subscription.character_limit,
          remaining: response.subscription.character_limit - response.subscription.character_count,
        };
      }

      // Return default if response is not as expected
      return { total: 0, remaining: 0 };
    } catch (error) {
      console.warn('Failed to check ElevenLabs quota:', error);
      return { total: 0, remaining: 0 };
    }
  }
}

export const apiService = ApiService.getInstance();
