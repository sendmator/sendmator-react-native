/**
 * Type definitions for Sendmator React Native SDK
 */

export type PreferenceChannel = 'email' | 'sms' | 'whatsapp' | 'push';

export type PreferenceCategory =
  | 'transactional'
  | 'promotional'
  | 'utility'
  | 'conversational'
  | 'marketing'
  | 'service'
  | 'system';

export interface ChannelPreferences {
  transactional?: boolean;
  promotional?: boolean;
  utility?: boolean;
  conversational?: boolean;
  marketing?: boolean;
  service?: boolean;
  system?: boolean;
}

export interface ContactPreferences {
  email?: ChannelPreferences;
  sms?: ChannelPreferences;
  whatsapp?: ChannelPreferences;
  push?: ChannelPreferences;
}

export interface PreferenceUpdate {
  channel: PreferenceChannel;
  category: PreferenceCategory;
  subscribed: boolean;
}

export interface SendmatorConfig {
  apiKey: string;
  apiUrl: string;
  onError?: (error: Error) => void;
  /** Enable automatic FCM token collection and sync (default: true) */
  autoSyncFcmToken?: boolean;
  /** Callback when FCM token is successfully synced */
  onFcmTokenSynced?: (token: string) => void;
}

export interface PreferenceCenterTheme {
  colors?: {
    primary?: string;
    background?: string;
    surface?: string;
    text?: string;
    textSecondary?: string;
    border?: string;
    success?: string;
    error?: string;
    accent?: string;
  };
}

export interface PreferenceCenterProps {
  /** Your app's user ID (must match the external_id used when creating the contact in Sendmator) */
  contactId: string;
  magicLinkToken?: string; // Optional: for email unsubscribe links
  onClose?: () => void;
  onSave?: (preferences: ContactPreferences) => void;
  theme?: PreferenceCenterTheme;
  /** Hide the header with title and close button */
  hideHeader?: boolean;
}

export interface ContactData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone_country_code?: string;
  country_code?: string;
  tags?: string[];
  is_active: boolean;
  is_unsubscribed: boolean;
  unsubscribed_at?: string | null;
  preferences: ContactPreferences;
  custom_fields?: Record<string, any>;
  metadata?: Record<string, any>;
  fcm_token?: string; // Firebase Cloud Messaging token for push notifications
  apns_token?: string; // Apple Push Notification Service token (iOS)
  created_at: string;
  updated_at: string;
}
