/**
 * FCM Token Manager
 * Handles Firebase Cloud Messaging token collection and refresh
 * Gracefully degrades if Firebase is not configured
 */

let messagingModule: any = null;
let hasFirebase = false;

/**
 * Check if Firebase Messaging is available
 */
function checkFirebaseAvailability(): boolean {
  if (hasFirebase) return true;

  try {
    // Try to dynamically import @react-native-firebase/messaging
    messagingModule = require('@react-native-firebase/messaging').default;
    hasFirebase = true;
    return true;
  } catch (error) {
    // Firebase not installed - gracefully degrade
    console.log(
      '[Sendmator] Firebase Messaging not available. Push notifications will not be synced automatically.'
    );
    return false;
  }
}

/**
 * Request notification permissions (iOS)
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!checkFirebaseAvailability()) return false;

  try {
    const authStatus = await messagingModule().requestPermission();
    const enabled =
      authStatus === 1 || // AuthorizationStatus.AUTHORIZED
      authStatus === 2; // AuthorizationStatus.PROVISIONAL

    return enabled;
  } catch (error) {
    console.warn('[Sendmator] Failed to request notification permissions:', error);
    return false;
  }
}

/**
 * Get current FCM token
 * Returns null if Firebase is not configured or token unavailable
 */
export async function getFcmToken(): Promise<string | null> {
  if (!checkFirebaseAvailability()) return null;

  try {
    // Request permissions first (iOS requirement)
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('[Sendmator] Notification permissions not granted');
      return null;
    }

    const token = await messagingModule().getToken();
    if (token) {
      console.log('[Sendmator] FCM token retrieved successfully');
      return token;
    }
    return null;
  } catch (error) {
    console.warn('[Sendmator] Failed to get FCM token:', error);
    return null;
  }
}

/**
 * Listen for FCM token refresh
 * Calls callback with new token when it changes
 */
export function onFcmTokenRefresh(
  callback: (token: string) => void
): (() => void) | null {
  if (!checkFirebaseAvailability()) return null;

  try {
    const unsubscribe = messagingModule().onTokenRefresh((token: string) => {
      console.log('[Sendmator] FCM token refreshed');
      callback(token);
    });

    return unsubscribe;
  } catch (error) {
    console.warn('[Sendmator] Failed to set up token refresh listener:', error);
    return null;
  }
}

/**
 * Delete FCM token (logout/cleanup)
 */
export async function deleteFcmToken(): Promise<boolean> {
  if (!checkFirebaseAvailability()) return false;

  try {
    await messagingModule().deleteToken();
    console.log('[Sendmator] FCM token deleted');
    return true;
  } catch (error) {
    console.warn('[Sendmator] Failed to delete FCM token:', error);
    return false;
  }
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return checkFirebaseAvailability();
}
