module.exports = {
  extends: ['expo'],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.expo/',
    'web-build/',
    '*.config.js',
    '__tests__/',
    'test-setup.ts',
    'vitest.config.ts',
  ],
};

