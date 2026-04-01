# Sendmator React Native Example App

This example app demonstrates how to use the `@sendmator/react-native` SDK for contact preference management and push notifications.

## Installation

### Option 1: Using Published NPM Package (Recommended for users)

```bash
cd example
npm install
npm start
```

This will install `@sendmator/react-native` from npm and run the example.

### Option 2: Using Local Development Version

If you're developing the SDK locally and want to test changes:

```bash
# From the root of the repo
cd example
npm run dev
```

This uses the local workspace version of the SDK (via yarn workspaces).

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Sendmator API credentials:
   ```
   SENDMATOR_API_KEY=your-api-key-here
   SENDMATOR_API_URL=https://api.sendmator.com
   SENDMATOR_TEST_CONTACT_ID=user_123
   ```

## Running the App

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

## Features Demonstrated

1. **SendmatorProvider** - SDK initialization with config
2. **PreferenceCenterScreen** - Contact preference management UI
3. **Theme Switching** - Built-in theme picker with 8 themes
4. **FCM Token Auto-Sync** - Automatic push notification token syncing
5. **Error Handling** - Callbacks for errors and token sync events

## Testing Push Notifications

To test FCM token auto-sync:

1. Install Firebase in the example app:
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/messaging
   ```

2. Configure Firebase for iOS/Android (see [Setup Guide](https://rnfirebase.io))

3. Set a `SENDMATOR_TEST_CONTACT_ID` in `.env`

4. Run the app - you should see in console:
   ```
   [Sendmator] FCM token retrieved successfully
   ✅ FCM Token synced: xxxxxxxxxxxxxxxxxxxx...
   ```

If Firebase is not configured, the app will still work but you'll see:
```
[Sendmator] Firebase Messaging not available
```

## Code Structure

- `src/App.tsx` - Main example app
- `.env` - Configuration (not committed)
- `.env.example` - Example configuration template

## Need Help?

- [Full Documentation](https://github.com/sendmator/sendmator-react-native)
- [Push Notifications Setup](../PUSH_NOTIFICATIONS.md)
- [Integration Guide](../INTEGRATION_GUIDE.md)
