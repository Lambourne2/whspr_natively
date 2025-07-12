module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@styles': './styles',
            '@hooks': './hooks',
            '@types': './types',
            '@utils': './utils',
            '@store': './store',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
};
