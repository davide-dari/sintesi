import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ricettafacile.app',
  appName: 'Ricetta Facile',
  webDir: 'dist',
  android: {
    backgroundColor: '#0f766e',
    allowMixedContent: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f766e',
      overlaysWebView: true,
    },
  },
};

export default config;
