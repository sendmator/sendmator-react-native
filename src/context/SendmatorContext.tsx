/**
 * Sendmator Context Provider
 */

import { createContext, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import { SendmatorApiClient } from '../api/client';
import type { SendmatorConfig } from '../types';
import {
  getFcmToken,
  onFcmTokenRefresh,
  isFirebaseConfigured,
} from '../utils/fcmTokenManager';

interface SendmatorContextType {
  client: SendmatorApiClient;
  config: SendmatorConfig;
  /** Manually sync FCM token for a contact */
  syncFcmToken: (contactExternalId: string) => Promise<void>;
}

const SendmatorContext = createContext<SendmatorContextType | null>(null);

export interface SendmatorProviderProps {
  config: SendmatorConfig;
  children: ReactNode;
  /** Contact's ID (external_id) for auto-syncing FCM token */
  contactId?: string;
}

export function SendmatorProvider({
  config,
  children,
  contactId,
}: SendmatorProviderProps) {
  const client = new SendmatorApiClient(config.apiUrl, config.apiKey);
  const tokenRefreshUnsubscribeRef = useRef<(() => void) | null>(null);
  const currentContactIdRef = useRef<string | undefined>(contactId);

  // Update ref when contactId changes
  useEffect(() => {
    currentContactIdRef.current = contactId;
  }, [contactId]);

  /**
   * Sync FCM token to Sendmator backend
   */
  const syncFcmToken = async (externalId: string): Promise<void> => {
    if (!isFirebaseConfigured()) {
      console.log('[Sendmator] Firebase not configured, skipping FCM sync');
      return;
    }

    try {
      const token = await getFcmToken();
      if (!token) {
        console.log('[Sendmator] No FCM token available');
        return;
      }

      // Detect platform and prepare device token data
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      await client.updateDeviceToken(externalId, {
        token,
        platform,
        os_version: Platform.Version?.toString(),
        // app_version and device_model can be added via config if needed
      });

      console.log('[Sendmator] FCM token synced successfully');

      // Call success callback if provided
      config.onFcmTokenSynced?.(token);
    } catch (error) {
      const err = error as Error;
      console.error('[Sendmator] Failed to sync FCM token:', err.message);
      config.onError?.(err);
    }
  };

  // Auto-sync FCM token on mount and when contactId changes
  useEffect(() => {
    const autoSyncEnabled = config.autoSyncFcmToken !== false; // Default true

    console.log('[Sendmator] Effect triggered - autoSyncEnabled:', autoSyncEnabled, 'contactId:', contactId);

    if (autoSyncEnabled && contactId) {
      console.log('[Sendmator] Starting FCM token sync for contact:', contactId);
      // Initial sync
      syncFcmToken(contactId).catch((error) => {
        console.warn('[Sendmator] Auto-sync failed:', error);
      });

      // Set up token refresh listener
      const unsubscribe = onFcmTokenRefresh((newToken) => {
        console.log('[Sendmator] Token refreshed, syncing...');
        if (currentContactIdRef.current) {
          const platform = Platform.OS === 'ios' ? 'ios' : 'android';

          client
            .updateDeviceToken(currentContactIdRef.current, {
              token: newToken,
              platform,
              os_version: Platform.Version?.toString(),
            })
            .then(() => {
              console.log('[Sendmator] Refreshed token synced');
              config.onFcmTokenSynced?.(newToken);
            })
            .catch((error) => {
              console.error('[Sendmator] Failed to sync refreshed token:', error);
              config.onError?.(error as Error);
            });
        }
      });

      tokenRefreshUnsubscribeRef.current = unsubscribe;
    }

    // Cleanup on unmount or when contactId changes
    return () => {
      if (tokenRefreshUnsubscribeRef.current) {
        tokenRefreshUnsubscribeRef.current();
        tokenRefreshUnsubscribeRef.current = null;
      }
    };
  }, [contactId, config.autoSyncFcmToken]);

  return (
    <SendmatorContext.Provider value={{ client, config, syncFcmToken }}>
      {children}
    </SendmatorContext.Provider>
  );
}

export function useSendmator(): SendmatorContextType {
  const context = useContext(SendmatorContext);

  if (!context) {
    throw new Error('useSendmator must be used within a SendmatorProvider');
  }

  return context;
}
