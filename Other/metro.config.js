const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for mp3 files
config.resolver.assetExts.push('mp3');

// Use turborepo to restore the cache when possible
// config.cacheStores = [
//     new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
//   ];

module.exports = config;
