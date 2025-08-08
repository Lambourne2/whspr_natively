import * as FileSystem from 'expo-file-system';
import * as Network from 'expo-network';
import { useAffirmationStore } from '../store/affirmationStore';
import { useSettingsStore } from '../store/settingsStore';

export interface OfflineStatus {
  isOnline: boolean;
  hasLocalAffirmations: boolean;
  canPlayOffline: boolean;
  missingAssets: string[];
}

class OfflineService {
  private static instance: OfflineService;
  private networkState: Network.NetworkState | null = null;

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.networkState = await Network.getNetworkStateAsync();
      
      // Set up network state listener
      Network.addNetworkStateListener((state) => {
        this.networkState = state;
        this.handleNetworkChange(state);
      });
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
    }
  }

  private handleNetworkChange(state: Network.NetworkState): void {
    if (!state.isConnected) {
      console.log('App went offline - switching to offline mode');
      this.enableOfflineMode();
    } else {
      console.log('App came online - enabling online features');
      this.enableOnlineMode();
    }
  }

  private enableOfflineMode(): void {
    // Disable features that require internet
    // Show offline indicator if needed
    console.log('Offline mode enabled');
  }

  private enableOnlineMode(): void {
    // Re-enable online features
    console.log('Online mode enabled');
  }

  async getOfflineStatus(): Promise<OfflineStatus> {
    const { affirmations } = useAffirmationStore.getState();
    const networkState = await Network.getNetworkStateAsync();
    
    const missingAssets: string[] = [];
    
    // Check if affirmation files exist locally
    for (const affirmation of affirmations) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(affirmation.audioUri);
        if (!fileInfo.exists) {
          missingAssets.push(affirmation.title);
        }
      } catch (error) {
        missingAssets.push(affirmation.title);
      }
    }

    return {
      isOnline: networkState.isConnected || false,
      hasLocalAffirmations: affirmations.length > 0,
      canPlayOffline: affirmations.length > 0 && missingAssets.length === 0,
      missingAssets,
    };
  }

  async validateLocalFiles(): Promise<{ valid: string[]; invalid: string[] }> {
    const { affirmations } = useAffirmationStore.getState();
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const affirmation of affirmations) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(affirmation.audioUri);
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
          valid.push(affirmation.id);
        } else {
          invalid.push(affirmation.id);
        }
      } catch (error) {
        invalid.push(affirmation.id);
      }
    }

    return { valid, invalid };
  }

  async cleanupInvalidFiles(): Promise<void> {
    const { invalid } = await this.validateLocalFiles();
    const { removeAffirmation } = useAffirmationStore.getState();

    for (const affirmationId of invalid) {
      console.log(`Removing invalid affirmation: ${affirmationId}`);
      removeAffirmation(affirmationId);
    }
  }

  async getStorageInfo(): Promise<{
    totalSize: number;
    availableSize: number;
    usedByApp: number;
  }> {
    try {
      const { affirmations } = useAffirmationStore.getState();
      let usedByApp = 0;

      // Calculate total size used by affirmation files
      for (const affirmation of affirmations) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(affirmation.audioUri);
          if (fileInfo.exists && fileInfo.size) {
            usedByApp += fileInfo.size;
          }
        } catch (error) {
          console.warn(`Failed to get file info for affirmation ${affirmation.id}:`, error);
        }
      }

      // Get device storage info
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      const totalSpace = await FileSystem.getTotalDiskCapacityAsync();

      return {
        totalSize: totalSpace || 0,
        availableSize: freeSpace || 0,
        usedByApp,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalSize: 0,
        availableSize: 0,
        usedByApp: 0,
      };
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Clear temporary files and cache
      const cacheDir = `${FileSystem.cacheDirectory}`;
      const cacheInfo = await FileSystem.getInfoAsync(cacheDir);
      
      if (cacheInfo.exists) {
        await FileSystem.deleteAsync(cacheDir, { idempotent: true });
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }

      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  isOnline(): boolean {
    return this.networkState?.isConnected || false;
  }

  canGenerateAffirmations(): boolean {
    const { settings } = useSettingsStore.getState();
    return this.isOnline() && 
           settings.openRouterApiKey.length > 0 && 
           settings.elevenLabsApiKey.length > 0;
  }

  canPlayAffirmations(): boolean {
    const { affirmations } = useAffirmationStore.getState();
    return affirmations.length > 0; // Can play offline if affirmations exist locally
  }

  getOfflineCapabilities(): {
    canPlay: boolean;
    canGenerate: boolean;
    canBrowseLibrary: boolean;
    canModifySettings: boolean;
  } {
    return {
      canPlay: this.canPlayAffirmations(),
      canGenerate: this.canGenerateAffirmations(),
      canBrowseLibrary: true, // Always available offline
      canModifySettings: true, // Always available offline
    };
  }

  async exportAffirmation(affirmationId: string): Promise<string | null> {
    try {
      const { affirmations } = useAffirmationStore.getState();
      const affirmation = affirmations.find(a => a.id === affirmationId);
      
      if (!affirmation) {
        throw new Error('Affirmation not found');
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(affirmation.audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file not found');
      }

      // Copy to a shareable location
      const exportDir = `${FileSystem.documentDirectory}exports/`;
      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });
      
      const exportPath = `${exportDir}${affirmation.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      await FileSystem.copyAsync({
        from: affirmation.audioUri,
        to: exportPath,
      });

      return exportPath;
    } catch (error) {
      console.error('Failed to export affirmation:', error);
      return null;
    }
  }
}

export const offlineService = OfflineService.getInstance();

