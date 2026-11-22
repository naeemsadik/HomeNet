const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      middleware(req, res, next);
    };
  },
};

config.resolver.sourceExts.push('mjs');

// Inline requires speed up app start on phones; the website keeps eager loading,
// so import-time side effects (DOM guard, console silencing) run at startup there.
config.transformer.getTransformOptions = async (_entryPoints, options) => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: options?.platform !== 'web',
  },
});

module.exports = config;
