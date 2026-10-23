// Expo's default (what Metro uses when no config exists), written out so
// babel-jest can transform the tests too.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
