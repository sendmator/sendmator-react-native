/**
 * Sendmator React Native SDK
 * Contact Preference Management & Push Notifications
 */

export { SendmatorProvider, useSendmator } from './context/SendmatorContext';
export { PreferenceCenterScreen } from './components/PreferenceCenterScreen';
export { SendmatorApiClient } from './api/client';

// Export FCM utilities for advanced use cases
export {
  getFcmToken,
  onFcmTokenRefresh,
  requestNotificationPermissions,
  deleteFcmToken,
  isFirebaseConfigured,
} from './utils/fcmTokenManager';

// Export pre-built themes
export {
  LightTheme,
  DarkTheme,
  MonochromeTheme,
  OceanBlueTheme,
  SunsetPurpleTheme,
  IndigoDarkTheme,
  ForestGreenTheme,
  SlateGreyTheme,
} from './themes';

export type {
  PreferenceChannel,
  PreferenceCategory,
  ChannelPreferences,
  ContactPreferences,
  ContactData,
  PreferenceUpdate,
  SendmatorConfig,
  PreferenceCenterTheme,
  PreferenceCenterProps,
} from './types';
