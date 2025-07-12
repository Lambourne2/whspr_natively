// Test setup file for Vitest
import { beforeEach, vi } from 'vitest';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: vi.fn(() => Promise.resolve(null)),
  setItem: vi.fn(() => Promise.resolve()),
  removeItem: vi.fn(() => Promise.resolve()),
  clear: vi.fn(() => Promise.resolve()),
  getAllKeys: vi.fn(() => Promise.resolve([])),
  multiGet: vi.fn(() => Promise.resolve([])),
  multiSet: vi.fn(() => Promise.resolve()),
  multiRemove: vi.fn(() => Promise.resolve()),
};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: mockAsyncStorage,
}));

// Mock Expo modules
vi.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: vi.fn(),
    Sound: {
      createAsync: vi.fn(() => Promise.resolve({ sound: {} })),
    },
  },
}));

vi.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  cacheDirectory: '/mock/cache/',
  writeAsStringAsync: vi.fn(),
  readAsStringAsync: vi.fn(),
  getInfoAsync: vi.fn(() => Promise.resolve({ exists: true, size: 1000 })),
  deleteAsync: vi.fn(),
  makeDirectoryAsync: vi.fn(),
  copyAsync: vi.fn(),
  getFreeDiskStorageAsync: vi.fn(() => Promise.resolve(1000000000)),
  getTotalDiskCapacityAsync: vi.fn(() => Promise.resolve(10000000000)),
}));

vi.mock('expo-network', () => ({
  getNetworkStateAsync: vi.fn(() => Promise.resolve({ isConnected: true })),
  addNetworkStateListener: vi.fn(),
}));

vi.mock('expo-router', () => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  },
  useLocalSearchParams: vi.fn(() => ({})),
  useGlobalSearchParams: vi.fn(() => ({})),
}));

// Mock React Native components
vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Dimensions: {
    get: vi.fn(() => ({ width: 375, height: 812 })),
  },
  Alert: {
    alert: vi.fn(),
  },
  Share: {
    share: vi.fn(),
  },
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

