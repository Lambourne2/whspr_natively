import { useSettingsStore } from '../store/settingsStore';
import { apiService } from './apiService';

export interface UsageStats {
  elevenLabsUsage: {
    used: number;
    total: number;
    remaining: number;
    percentageUsed: number;
  };
  requestCounts: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    todayRequests: number;
  };
  estimatedCosts: {
    elevenLabsEstimate: number;
    openRouterEstimate: number;
  };
}

export interface CostAlert {
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  action?: string;
}

class CostControlService {
  private static instance: CostControlService;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private usageStats: UsageStats | null = null;
  private lastQuotaCheck: number = 0;
  private quotaCheckInterval: number = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CostControlService {
    if (!CostControlService.instance) {
      CostControlService.instance = new CostControlService();
    }
    return CostControlService.instance;
  }

  async checkQuotaStatus(): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];
    const { settings } = useSettingsStore.getState();
    
    try {
      // Only check quota if enough time has passed
      const now = Date.now();
      if (now - this.lastQuotaCheck < this.quotaCheckInterval) {
        return alerts;
      }

      const quota = await apiService.checkQuota();
      this.lastQuotaCheck = now;

      if (!quota) {
        // Error is already logged by the apiService, just exit.
        return alerts;
      }

      // Check if below threshold
      if (quota.remaining < settings.elevenLabsQuotaThreshold) {
        const percentageRemaining = (quota.remaining / quota.total) * 100;
        
        if (percentageRemaining < 10) {
          alerts.push({
            type: 'critical',
            title: 'Critical: Very Low Quota',
            message: `Only ${quota.remaining} characters remaining (${percentageRemaining.toFixed(1)}%). Consider upgrading your plan.`,
            action: 'Upgrade Plan',
          });
        } else if (percentageRemaining < 25) {
          alerts.push({
            type: 'warning',
            title: 'Warning: Low Quota',
            message: `${quota.remaining} characters remaining (${percentageRemaining.toFixed(1)}%). You may want to monitor usage.`,
            action: 'View Usage',
          });
        }
      }

      // Update usage stats
      this.usageStats = {
        elevenLabsUsage: {
          used: quota.total - quota.remaining,
          total: quota.total,
          remaining: quota.remaining,
          percentageUsed: ((quota.total - quota.remaining) / quota.total) * 100,
        },
        requestCounts: this.getRequestCounts(),
        estimatedCosts: this.calculateEstimatedCosts(quota),
      };

    } catch (error) {
      console.error('Failed to check quota status:', error);
      alerts.push({
        type: 'warning',
        title: 'Unable to Check Quota',
        message: 'Could not verify your ElevenLabs quota. Please check your API key.',
        action: 'Check Settings',
      });
    }

    return alerts;
  }

  private getRequestCounts() {
    // In a real app, this would be stored in persistent storage
    // For now, return mock data
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      todayRequests: 0,
    };
  }

  private calculateEstimatedCosts(quota: { remaining: number; total: number }) {
    // Rough cost estimates based on typical pricing
    const elevenLabsCharacterCost = 0.0001; // $0.0001 per character (example)
    const openRouterRequestCost = 0.001; // $0.001 per request (example)
    
    const charactersUsed = quota.total - quota.remaining;
    
    return {
      elevenLabsEstimate: charactersUsed * elevenLabsCharacterCost,
      openRouterEstimate: this.getRequestCounts().totalRequests * openRouterRequestCost,
    };
  }

  async canMakeRequest(estimatedCharacters: number = 100): Promise<{
    canProceed: boolean;
    reason?: string;
    suggestion?: string;
  }> {
    const { settings } = useSettingsStore.getState();

    // Check if we have API keys
    if (!settings.elevenLabsApiKey || !settings.openRouterApiKey) {
      return {
        canProceed: false,
        reason: 'API keys not configured',
        suggestion: 'Please configure your API keys in Settings',
      };
    }

    // Check concurrent request limit
    if (this.requestQueue.size >= settings.maxConcurrentTtsCalls) {
      return {
        canProceed: false,
        reason: 'Too many concurrent requests',
        suggestion: `Please wait. Maximum ${settings.maxConcurrentTtsCalls} concurrent requests allowed.`,
      };
    }

    try {
      // Check quota
      const quota = await apiService.checkQuota();
      
      if (quota.remaining < estimatedCharacters) {
        return {
          canProceed: false,
          reason: 'Insufficient quota',
          suggestion: `Need ${estimatedCharacters} characters but only ${quota.remaining} remaining.`,
        };
      }

      if (quota.remaining < settings.elevenLabsQuotaThreshold) {
        // Allow but warn
        return {
          canProceed: true,
          reason: 'Low quota warning',
          suggestion: `Only ${quota.remaining} characters remaining. Consider upgrading soon.`,
        };
      }

      return { canProceed: true };
    } catch (error) {
      console.error('Failed to check quota for request:', error);
      return {
        canProceed: true, // Allow request but warn
        reason: 'Could not verify quota',
        suggestion: 'Proceeding without quota verification. Check your API key if issues persist.',
      };
    }
  }

  async trackRequest(requestId: string, promise: Promise<any>): Promise<any> {
    this.requestQueue.set(requestId, promise);
    
    try {
      const result = await promise;
      this.requestQueue.delete(requestId);
      // Track successful request
      return result;
    } catch (error) {
      this.requestQueue.delete(requestId);
      // Track failed request
      throw error;
    }
  }

  getActiveRequestCount(): number {
    return this.requestQueue.size;
  }

  async getUsageStats(): Promise<UsageStats | null> {
    if (!this.usageStats) {
      await this.checkQuotaStatus();
    }
    return this.usageStats;
  }

  async estimateAffirmationCost(
    affirmationTexts: string[],
    voice: string
  ): Promise<{
    characterCount: number;
    estimatedCost: number;
    quotaPercentage: number;
  }> {
    const characterCount = affirmationTexts.join(' ').length;
    const estimatedCost = characterCount * 0.0001; // Example rate
    
    try {
      const quota = await apiService.checkQuota();
      const quotaPercentage = (characterCount / quota.remaining) * 100;
      
      return {
        characterCount,
        estimatedCost,
        quotaPercentage,
      };
    } catch (error) {
      return {
        characterCount,
        estimatedCost,
        quotaPercentage: 0,
      };
    }
  }

  async optimizeRequestBatch(requests: any[]): Promise<any[][]> {
    const { settings } = useSettingsStore.getState();
    const batchSize = settings.maxConcurrentTtsCalls;
    const batches: any[][] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    return batches;
  }

  async waitForAvailableSlot(): Promise<void> {
    const { settings } = useSettingsStore.getState();
    
    while (this.requestQueue.size >= settings.maxConcurrentTtsCalls) {
      // Wait for any request to complete
      await Promise.race(Array.from(this.requestQueue.values()));
      // Small delay to prevent tight loop
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.usageStats) {
      const { elevenLabsUsage } = this.usageStats;
      
      if (elevenLabsUsage.percentageUsed > 80) {
        recommendations.push('Consider upgrading your ElevenLabs plan for more quota');
      }
      
      if (elevenLabsUsage.percentageUsed > 50) {
        recommendations.push('Monitor your usage closely to avoid running out of quota');
      }
      
      if (this.getActiveRequestCount() > 1) {
        recommendations.push('Multiple requests are running. Consider reducing concurrent requests for better cost control');
      }
    }
    
    recommendations.push('Create shorter affirmations to use less quota');
    recommendations.push('Reuse existing affirmations instead of generating new ones');
    
    return recommendations;
  }
}

export const costControlService = CostControlService.getInstance();

