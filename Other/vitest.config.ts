import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.{test,spec}.{js,ts,tsx}', '**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.expo', 'web-build'],
    setupFiles: ['./test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': __dirname,
      '@components': __dirname + '/components',
      '@styles': __dirname + '/styles',
      '@hooks': __dirname + '/hooks',
      '@types': __dirname + '/types',
      '@utils': __dirname + '/utils',
      '@store': __dirname + '/store',
      '@assets': __dirname + '/assets',
      '@services': __dirname + '/services',
    },
  },
});

