import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sintesi.app',
  appName: 'Sintesi',
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
