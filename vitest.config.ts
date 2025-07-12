import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.{test,spec}.{js,ts,tsx}', '**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.expo', 'web-build'],
    setupFiles: ['./test-setup.ts'],
  },
});

