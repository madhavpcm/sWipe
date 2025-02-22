const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const {
    wrapWithReanimatedMetroConfig,
  } = require('react-native-reanimated/metro-config');
  

const config = getDefaultConfig(__dirname);

// Add SVG support
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== "svg");
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = wrapWithReanimatedMetroConfig(
    withNativeWind(config, { input: "./app/global.css" })
  );