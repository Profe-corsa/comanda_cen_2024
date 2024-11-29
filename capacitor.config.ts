import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.comanda',
  appName: 'Comanda CEN',
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId:
        '388609361201-m87jvekt4819pamvq5cau7thtgahdk16.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
