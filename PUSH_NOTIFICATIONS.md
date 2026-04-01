# Push Notifications Setup

The Sendmator React Native SDK now supports automatic FCM (Firebase Cloud Messaging) token collection and synchronization for push notifications.

## Features

- ✅ **Automatic FCM token collection** on SDK initialization
- ✅ **Auto-sync on token refresh** (handles token rotation)
- ✅ **Graceful degradation** - doesn't crash if Firebase isn't configured
- ✅ **Zero configuration** - works out of the box if Firebase is present
- ✅ **Manual control** - option to disable auto-sync and manage tokens manually

## Prerequisites

Your app needs to have Firebase configured. The SDK will automatically detect Firebase and sync tokens.

### Install Firebase Messaging

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
# or
yarn add @react-native-firebase/app @react-native-firebase/messaging
```

### Configure Firebase in your app

Follow the official Firebase setup guide:
- [iOS Setup](https://rnfirebase.io/#2-ios-setup)
- [Android Setup](https://rnfirebase.io/#3-android-setup)

## Usage

### Automatic Mode (Recommended)

The SDK automatically collects and syncs FCM tokens when you provide a `contactId`:

```typescript
import { SendmatorProvider } from '@sendmator/react-native';

function App() {
  const userId = 'user_123'; // Your app's user ID

  return (
    <SendmatorProvider
      config={{
        apiKey: 'your-api-key',
        apiUrl: 'https://api.sendmator.com',
      }}
      contactId={userId} // SDK auto-syncs FCM token for this contact
    >
      <YourApp />
    </SendmatorProvider>
  );
}
```

That's it! The SDK will:
1. Check if Firebase is configured
2. Request notification permissions (iOS)
3. Get the FCM token
4. Sync it with Sendmator
5. Listen for token refresh and auto-update

### With Callbacks

Get notified when tokens are synced:

```typescript
<SendmatorProvider
  config={{
    apiKey: 'your-api-key',
    apiUrl: 'https://api.sendmator.com',
    onFcmTokenSynced: (token) => {
      console.log('FCM token synced:', token);
      // Optional: Store token locally or send to your backend
    },
    onError: (error) => {
      console.error('Sendmator error:', error);
    },
  }}
  contactId={userId}
>
  <YourApp />
</SendmatorProvider>
```

### Manual Mode

Disable auto-sync and manage tokens manually:

```typescript
import { SendmatorProvider, useSendmator, getFcmToken } from '@sendmator/react-native';

// In your provider
<SendmatorProvider
  config={{
    apiKey: 'your-api-key',
    apiUrl: 'https://api.sendmator.com',
    autoSyncFcmToken: false, // Disable auto-sync
  }}
>
  <YourApp />
</SendmatorProvider>

// In your component
function MyComponent() {
  const { syncFcmToken } = useSendmator();

  const handleLogin = async (userId: string) => {
    // Manually sync token after login
    await syncFcmToken(userId);
  };

  return <Button onPress={() => handleLogin('user_123')} />;
}
```

### Advanced: Manual Token Management

For complete control:

```typescript
import {
  getFcmToken,
  requestNotificationPermissions,
  onFcmTokenRefresh,
  deleteFcmToken,
  isFirebaseConfigured,
} from '@sendmator/react-native';

// Check if Firebase is available
if (isFirebaseConfigured()) {
  // Request permissions
  const hasPermission = await requestNotificationPermissions();

  if (hasPermission) {
    // Get token
    const token = await getFcmToken();
    console.log('FCM Token:', token);

    // Listen for refresh
    const unsubscribe = onFcmTokenRefresh((newToken) => {
      console.log('New token:', newToken);
      // Handle token update
    });

    // Cleanup
    return () => unsubscribe?.();
  }
}

// On logout
await deleteFcmToken();
```

## Graceful Degradation

If Firebase is **not** configured:
- ✅ SDK initializes normally
- ✅ All other features work (preferences, etc.)
- ⚠️ Console log: "Firebase Messaging not available"
- ❌ Push notification tokens won't be synced

This means you can:
- Test without Firebase
- Roll out Firebase gradually
- Have some users without push notifications

## Sending Push Notifications

Once tokens are synced with Sendmator, you can send push notifications through the Sendmator API or directly using Firebase Admin SDK.

## iOS Permissions

On iOS, the SDK automatically requests notification permissions. Users will see a system dialog.

To customize the permission request, do it before initializing Sendmator:

```typescript
import messaging from '@react-native-firebase/messaging';

// Request permissions with custom options
const authStatus = await messaging().requestPermission({
  alert: true,
  announcement: false,
  badge: true,
  carPlay: false,
  provisional: false,
  sound: true,
});

// Then initialize Sendmator
<SendmatorProvider ... />
```

## Troubleshooting

### "Firebase Messaging not available"
- Install `@react-native-firebase/messaging`
- Follow Firebase setup for iOS/Android
- Rebuild your app

### Token not syncing
- Check `contactId` is provided to `SendmatorProvider`
- Verify `autoSyncFcmToken` is not `false`
- Check network connectivity
- Verify API key and URL are correct

### iOS permissions denied
- Check Info.plist has required keys
- User may have denied permissions - they need to enable in Settings

### Android token not generated
- Verify `google-services.json` is in `android/app/`
- Check Firebase project has Cloud Messaging enabled
- Ensure app package name matches Firebase config

## Next Steps

1. ✅ Configure Firebase in your app
2. ✅ Pass `contactId` to `SendmatorProvider`
3. ✅ Start sending push notifications through Sendmator!

## Example App

Check the `example/` folder for a complete working implementation.
