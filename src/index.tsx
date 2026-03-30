/**
 * Sendmator React Native SDK
 * Contact Preference Management
 */

export { SendmatorProvider, useSendmator } from './context/SendmatorContext';
export { PreferenceCenterScreen } from './components/PreferenceCenterScreen';
export { SendmatorApiClient } from './api/client';

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
