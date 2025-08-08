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
        theme: 'light',
        defaultVoice: 'Rachel',
        defaultLoopGap: 3,
        hasCompletedOnboarding: true,
        enableCostControl: true,
      },
    })),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Test response',
            },
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.generateText('Test prompt');

      expect(result).toBe('Test response');
    });

    it('should handle API key not configured', async () => {
      (useSettingsStore.getState as any).mockReturnValueOnce({
        settings: {
          openRouterApiKey: '',
          elevenLabsApiKey: 'test-key',
          maxConcurrentTtsCalls: 3,
          elevenLabsQuotaThreshold: 1000,
          theme: 'light',
          defaultVoice: 'Rachel',
          defaultLoopGap: 3,
          hasCompletedOnboarding: true,
          enableCostControl: true,
        },
      });

      await expect(
        apiService.generateText('Test prompt'),
      ).rejects.toThrow('OpenRouter API key not configured');
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

      expect(result).not.toBeNull();
      if (result) {
        expect(result.remaining).toBe(5000);
        expect(result.total).toBe(10000);
      }
    });

    it('should handle quota check failure gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.checkQuota();

      expect(result).toBeNull();
    });
  });
});

