// La app usa react-native-tvos (un fork de React Native que también corre en Apple TV y Android TV).
// En el monorepo pueden quedar otras copias de "react-native"; aquí se fuerza que todo use la de esta app.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const origin = path.join(__dirname, 'package.json');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native' || moduleName.startsWith('react-native/')) {
    return context.resolveRequest({ ...context, originModulePath: origin }, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
