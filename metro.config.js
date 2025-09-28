const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const customConfig = {
  resolver: {
    assetExts: ['ttf'], // we will merge this with default assetExts below
  },
};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  {
    resolver: {
      assetExts: [...getDefaultConfig(__dirname).resolver.assetExts, 'ttf'],
    },
  }
);

