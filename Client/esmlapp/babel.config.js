module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Ensure there are no references to expo-barcode-scanner here
    ],
  };
};
