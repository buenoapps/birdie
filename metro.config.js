// Custom Metro config — extends Expo's default to register `.wasm` as an
// asset extension. `expo-sqlite`'s web build imports `wa-sqlite/wa-sqlite.wasm`
// directly, and the bundler fails to resolve it without this. Native iOS /
// Android bundles work without this change.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

module.exports = config;
