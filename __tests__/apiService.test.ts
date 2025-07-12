import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../services/apiService';
import { useSettingsStore } from '../store/settingsStore';

// Mock the settings store
vi.mock('../store/settingsStore', () => ({
  useSettingsStore: {
    getState: vi.fn(() => ({
      settings: {
        openRouterApiKey: 'test-openrouter-key',
        elevenLabsApiKey: 'test-elevenlabs-key',
        maxConcurrentTtsCalls: 3,
        elevenLabsQuotaThreshold: 1000,
      },
    })),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAffirmations', () => {
    it('should generate affirmations successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                'I am peaceful and calm',
                'I sleep deeply and restfully',
                'I wake up refreshed and energized',
              ]),
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.generateAffirmations({
        intent: 'sleep',
        tone: 'soft',
        count: 3,
      });

      expect(result.affirmations).toHaveLength(3);
      expect(result.affirmations[0]).toBe('I am peaceful and calm');
    });

    it('should throw error when API key is missing', async () => {
      vi.mocked(useSettingsStore.getState).mockReturnValueOnce({
        settings: {
          openRouterApiKey: '',
          elevenLabsApiKey: 'test-key',
          maxConcurrentTtsCalls: 3,
          elevenLabsQuotaThreshold: 1000,
        },
      });

      await expect(
        apiService.generateAffirmations({
          intent: 'sleep',
          tone: 'soft',
        })
      ).rejects.toThrow('OpenRouter API key not configured');
    });

    it('should handle rate limiting with exponential backoff', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [
                {
                  message: {
                    content: JSON.stringify(['I am calm and peaceful']),
                  },
                },
              ],
            }),
        });

      const result = await apiService.generateAffirmations({
        intent: 'sleep',
        tone: 'soft',
        count: 1,
      });

      expect(result.affirmations).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('synthesizeSpeech', () => {
    it('should synthesize speech successfully', async () => {
      const mockArrayBuffer = new ArrayBuffer(1000);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });

      const result = await apiService.synthesizeSpeech({
        text: 'I am peaceful and calm',
        voice: 'soft_female',
      });

      expect(result.audioData).toBe(mockArrayBuffer);
    });

    it('should throw error when ElevenLabs API key is missing', async () => {
      vi.mocked(useSettingsStore.getState).mockReturnValueOnce({
        settings: {
          openRouterApiKey: 'test-key',
          elevenLabsApiKey: '',
          maxConcurrentTtsCalls: 3,
          elevenLabsQuotaThreshold: 1000,
        },
      });

      await expect(
        apiService.synthesizeSpeech({
          text: 'Test text',
          voice: 'soft_female',
        })
      ).rejects.toThrow('ElevenLabs API key not configured');
    });
  });

  describe('checkQuota', () => {
    it('should return quota information', async () => {
      const mockQuota = {
        subscription: {
          character_count: 5000,
          character_limit: 10000,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuota),
      });

      const result = await apiService.checkQuota();

      expect(result.remaining).toBe(5000);
      expect(result.total).toBe(10000);
    });

    it('should handle quota check failure gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.checkQuota();

      expect(result.remaining).toBe(0);
      expect(result.total).toBe(0);
    });
  });
});

