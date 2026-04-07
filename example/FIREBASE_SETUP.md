# Firebase Cloud Messaging Setup

This guide walks you through setting up Firebase Cloud Messaging (FCM) for the Sendmator React Native example app to test push notification device token synchronization.

## Overview

The Sendmator SDK automatically syncs FCM tokens to your backend when configured with Firebase. This example app demonstrates:

- Automatic device token registration
- Token refresh handling
- Device token synchronization to Sendmator backend
- Real-time token updates

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI
- A Firebase project (free tier is sufficient)
- Sendmator backend running locally or deployed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** or select an existing project
3. Follow the setup wizard (Analytics is optional for this use case)

## Step 2: Register Your Apps

### For Android

1. In the Firebase Console, click the **Android icon** to add an Android app
2. Enter the package name: `sendmatorreactnative.example`
3. Click **Register app**
4. Download the `google-services.json` file
5. Place it in the example app root directory:
   ```
   /Users/ashoksekar/Projects/sendmator-react-native/example/google-services.json
   ```

### For iOS

1. In the Firebase Console, click the **iOS icon** to add an iOS app
2. Enter the bundle ID: `sendmatorreactnative.example`
3. Click **Register app**
4. Download the `GoogleService-Info.plist` file
5. Place it in the example app root directory:
   ```
   /Users/ashoksekar/Projects/sendmator-react-native/example/GoogleService-Info.plist
   ```

> **Important**: Both configuration files are gitignored for security. Never commit them to version control.

## Step 3: Enable Cloud Messaging

1. In the Firebase Console, go to **Project Settings** > **Cloud Messaging**
2. Copy the **Server Key** (you'll need this for sending push notifications from your backend)
3. For iOS, you'll need to upload your APNs certificate or key:
   - Go to **Project Settings** > **Cloud Messaging** > **iOS app configuration**
   - Upload your APNs Authentication Key or Certificate

## Step 4: Configure the Example App

The example app is already configured to use Firebase via the installed packages:

- `@react-native-firebase/app` - Core Firebase functionality
- `@react-native-firebase/messaging` - Cloud Messaging

The `app.config.js` file references your Firebase configuration files:

```javascript
{
  ios: {
    googleServicesFile: './GoogleService-Info.plist',
  },
  android: {
    googleServicesFile: './google-services.json',
  },
  plugins: ['@react-native-firebase/app'],
}
```

## Step 5: Configure Environment Variables

Edit the `.env` file in the example directory:

```bash
SENDMATOR_API_KEY=your-sendmator-api-key
SENDMATOR_API_URL=http://localhost:3000
SENDMATOR_TEST_CONTACT_ID=test-user-123
```

- `SENDMATOR_API_KEY`: Your Sendmator API key from the backend
- `SENDMATOR_API_URL`: Your Sendmator backend URL (use `http://localhost:3000` for local development)
- `SENDMATOR_TEST_CONTACT_ID`: A contact's `external_id` to test token syncing (optional, can be entered in the app)

## Step 6: Install Dependencies

The Firebase packages are already installed. If you need to reinstall:

```bash
cd example
npm install --legacy-peer-deps
```

> The `--legacy-peer-deps` flag resolves peer dependency conflicts with Expo.

## Step 7: Build Development Build (Required for Firebase)

**Important:** Firebase requires native modules that are not available in Expo Go. You must create a development build.

### Option A: Local Development Build (Recommended)

#### For iOS:

```bash
cd example
npx expo prebuild --clean
npx expo run:ios
```

This will:
1. Generate native iOS project with Firebase configured
2. Install CocoaPods dependencies
3. Build and run on iOS simulator

#### For Android:

```bash
cd example
npx expo prebuild --clean
npx expo run:android
```

This will:
1. Generate native Android project with Firebase configured
2. Install Gradle dependencies
3. Build and run on Android emulator

### Option B: EAS Build (For Testing on Physical Devices)

If you want to test on physical devices without a Mac/local setup:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build for iOS simulator
eas build --profile development --platform ios

# Build for Android
eas build --profile development --platform android
```

Download and install the build on your device.

## Step 8: Run the Development Build

After building once, you can start the dev server:

```bash
cd example
yarn start
```

Then:
- Press `i` to open iOS development build
- Press `a` to open Android development build

**Note:** Unlike Expo Go, you'll need to rebuild whenever you:
- Add/remove native dependencies
- Change Firebase configuration files
- Modify `app.config.js` plugins

## Step 8: Test Device Token Sync

1. **Enter a Contact ID**: On the first screen, enter a contact's `external_id` (or use the pre-configured one from `.env`)

2. **Token Registration**: When the app loads with a contact ID, the SDK automatically:
   - Requests FCM token from Firebase
   - Syncs the token to your Sendmator backend
   - Logs success in the console: `✅ FCM Token synced: <token>`

3. **View in Backend**:
   - Open your Sendmator web dashboard
   - Navigate to Contacts
   - Edit the contact you used
   - Check the "Device Tokens" section - you should see the new token grouped by platform

4. **Test Token Refresh**:
   - Firebase automatically refreshes tokens periodically
   - The SDK listens for refresh events and auto-syncs
   - Check console logs for: `[Sendmator] Token refreshed, syncing...`

5. **Open Preference Center**:
   - Click "Open Preference Center" to view the SDK's preference management UI
   - The preference screen is independent but uses the same contact ID

## Architecture

### How Token Sync Works

The Sendmator SDK provides **two approaches** for syncing FCM tokens:

#### Approach 1: Auto-Sync (Recommended for Persistent Login)

Pass `contactId` to `SendmatorProvider` to automatically sync on mount:

```typescript
<SendmatorProvider
  config={{
    apiKey: API_KEY,
    apiUrl: API_URL,
    onFcmTokenSynced: (token) => {
      console.log('✅ FCM Token synced:', token);
    },
  }}
  contactId={user.externalId} // Auto-syncs FCM token when user is known
>
  <App />
</SendmatorProvider>
```

**When to use:**
- User is already logged in when app starts
- Persistent login sessions
- Immediate token sync on app launch

#### Approach 2: Manual Sync (Recommended for Login Flows)

Use the `syncFcmToken()` helper function for manual control:

```typescript
import { useSendmator } from '@sendmator/react-native';

function LoginScreen() {
  const { syncFcmToken } = useSendmator();

  const handleLogin = async (credentials) => {
    // Authenticate user
    const user = await authenticateUser(credentials);

    // Manually sync FCM token after successful login
    try {
      await syncFcmToken(user.externalId);
      console.log('Token synced for user:', user.externalId);
    } catch (error) {
      console.error('Token sync failed:', error);
    }

    // Navigate to home screen
    navigation.navigate('Home');
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

**When to use:**
- User logs in during app session
- User switching scenarios
- Custom token sync timing
- Post-authentication flows

#### How It Works (Both Approaches)

When token sync is triggered:

1. SDK calls `getFcmToken()` from Firebase
2. Requests notification permissions (iOS only)
3. Detects platform (iOS/Android) via `Platform.OS`
4. Collects device metadata (OS version, app version, etc.)
5. Sends token to backend via `PATCH /v1/contacts/external/:externalId/device-token`
6. Backend performs smart upsert (updates if exists, creates if new)
7. Sets up token refresh listener for automatic re-sync

#### Token Refresh

Both approaches automatically handle token refresh:
- Firebase may refresh tokens periodically
- SDK listens for refresh events via `onTokenRefresh`
- Automatically re-syncs new token to backend
- No manual intervention required

### Token Storage

Device tokens are stored in the contact's `device_tokens` JSONB array:

```json
{
  "token": "fcm_token_string",
  "platform": "android",
  "app_version": "1.0.0",
  "os_version": "13",
  "device_model": "Pixel 7",
  "last_used_at": "2026-04-07T10:00:00Z",
  "created_at": "2026-04-07T09:00:00Z"
}
```

Multiple devices per contact are supported. Stale tokens (>90 days) are auto-cleaned.

## Troubleshooting

### Token Not Syncing

1. **Check Firebase Configuration**:
   - Verify `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) are in the example root directory
   - Ensure package name matches: `sendmatorreactnative.example`

2. **Check API Configuration**:
   - Verify `SENDMATOR_API_URL` is correct in `.env`
   - Ensure backend is running and accessible
   - Check `SENDMATOR_API_KEY` is valid

3. **Check Contact ID**:
   - The contact must exist in your backend
   - Use the contact's `external_id`, not the internal database ID

4. **Check Console Logs**:
   - Look for: `[Sendmator] Firebase not configured, skipping FCM sync`
   - Look for: `[Sendmator] Failed to sync FCM token: <error>`

### Firebase Errors

1. **"Default app has not been initialized"**:
   - Rebuild the app after adding Firebase config files
   - Clear Expo cache: `expo start -c`

2. **Permission Denied (iOS)**:
   - FCM requires notification permissions
   - The SDK requests permissions automatically
   - Check iOS Settings > App > Notifications

3. **"Google Play Services not available" (Android)**:
   - Use a physical device or emulator with Google Play Services
   - AVD emulators must include Google APIs

### Build Errors

If you encounter build errors after adding Firebase:

```bash
# Clear all caches
rm -rf node_modules
rm -rf .expo
npm install --legacy-peer-deps

# Clear Expo cache and rebuild
expo start -c
```

## SDK Development Notes

### Local SDK Testing

For SDK contributors testing local changes:

1. The repo uses yarn workspaces for local development
2. Temporarily change the example app's package.json:
   ```json
   {
     "dependencies": {
       "@sendmator/react-native": "workspace:*"
     }
   }
   ```
3. Run `yarn install` to link the local workspace
4. Test your changes
5. **Important**: Revert to npm version before committing:
   ```json
   {
     "dependencies": {
       "@sendmator/react-native": "^0.0.4"
     }
   }
   ```

### Production Usage

In production apps, install the published npm package:

```bash
npm install @sendmator/react-native
# or
yarn add @sendmator/react-native
```

## API Reference

### Device Token Endpoint

**Endpoint**: `PATCH /v1/contacts/external/:externalId/device-token`

**Headers**:
```
X-API-KEY: your-api-key
Content-Type: application/json
```

**Body**:
```json
{
  "token": "fcm_token_string",
  "platform": "android",
  "app_version": "1.0.0",
  "os_version": "13",
  "device_model": "Pixel 7"
}
```

**Response**: Updated contact object with device tokens

## Security Considerations

1. **Never commit Firebase config files** - They contain sensitive API keys
2. **Use environment variables** - Store API keys in `.env` (gitignored)
3. **Validate tokens server-side** - The backend validates tokens before storage
4. **Auto-cleanup stale tokens** - Tokens older than 90 days are automatically removed

## Support

- **SDK Issues**: Open an issue on the [GitHub repository](https://github.com/sendmator/sendmator-react-native)
- **Firebase Issues**: Check [Firebase Documentation](https://firebase.google.com/docs/cloud-messaging)
- **Backend Issues**: Check the Sendmator backend documentation

## Next Steps

After successfully testing device token sync:

1. Send a test push notification from your backend
2. Implement push notification handlers in your app
3. Customize the preference center theme
4. Integrate into your production app

## Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Sendmator SDK Documentation](https://github.com/sendmator/sendmator-react-native)
- [Expo Firebase Setup](https://docs.expo.dev/guides/using-firebase/)
