# Sendmator React Native SDK - Complete Integration Guide

## 🎯 Overview

This guide shows how developers integrate the Sendmator preference center into their React Native apps, and how their end-users will use it.

---

## 📦 Step 1: Installation

Developers add your SDK to their project:

```bash
npm install sendmator-react-native
# or
yarn add sendmator-react-native
```

---

## 🔧 Step 2: App Configuration

### 2.1 Wrap App with Provider

In their root `App.tsx`:

```tsx
import { SendmatorProvider } from 'sendmator-react-native';

export default function App() {
  return (
    <SendmatorProvider
      config={{
        apiUrl: 'https://api.sendmator.com',
        teamId: 'team_abc123', // Their Sendmator team ID
        onError: (error) => {
          // Optional: Custom error handling
          console.error('Sendmator error:', error);
        },
      }}
    >
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SendmatorProvider>
  );
}
```

### 2.2 Configure Deep Linking

**iOS (Info.plist):**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>
```

**Android (AndroidManifest.xml):**
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="myapp" />
</intent-filter>
```

---

## 🚀 Step 3: Implementation Approaches

Developers have **3 ways** to integrate:

### Approach A: Magic Link Flow (Recommended for Standalone Access)

**Best for:** Settings screens, email links, standalone preference management

```tsx
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { PreferenceCenterScreen } from 'sendmator-react-native';

function PreferencesScreen() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Listen for deep links
    const handleUrl = ({ url }: { url: string }) => {
      // Extract token from: myapp://preferences?token=abc123
      const match = url.match(/token=([^&]+)/);
      if (match) {
        setToken(match[1]);
      }
    };

    // Handle app opened via link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    // Handle link while app is running
    const subscription = Linking.addEventListener('url', handleUrl);

    return () => subscription.remove();
  }, []);

  if (!token) {
    return <RequestAccessScreen />;
  }

  return (
    <PreferenceCenterScreen
      magicLinkToken={token}
      onClose={() => setToken(null)}
      onSave={(preferences) => {
        console.log('User updated preferences:', preferences);
      }}
    />
  );
}

// Screen to request magic link
function RequestAccessScreen() {
  const { client } = useSendmator();
  const [email, setEmail] = useState('');

  const handleRequest = async () => {
    try {
      await client.requestAccess(email);
      Alert.alert('Success', 'Check your email for the magic link!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <Text>Enter your email to manage preferences</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="your@email.com"
      />
      <Button title="Send Magic Link" onPress={handleRequest} />
    </View>
  );
}
```

### Approach B: Authenticated In-App Access

**Best for:** Logged-in users accessing preferences from settings

```tsx
import { PreferenceCenterScreen, useSendmator } from 'sendmator-react-native';

function UserSettingsScreen() {
  const { user } = useAuth(); // App's auth system
  const { client } = useSendmator();
  const [showPreferences, setShowPreferences] = useState(false);

  const handleOpenPreferences = async () => {
    // Option 1: Use existing magic link system
    // User clicks button → backend sends email → user gets token

    // Option 2: Backend creates short-lived token for logged-in user
    // const token = await yourBackend.createPreferenceToken(user.contactId);
    // setToken(token);

    setShowPreferences(true);
  };

  if (showPreferences) {
    return (
      <PreferenceCenterScreen
        magicLinkToken={yourToken}
        onClose={() => setShowPreferences(false)}
      />
    );
  }

  return (
    <View>
      <Button
        title="Manage Communication Preferences"
        onPress={handleOpenPreferences}
      />
    </View>
  );
}
```

### Approach C: Embed in Settings Screen

**Best for:** Native-feeling settings integration

```tsx
import { useSendmator } from 'sendmator-react-native';

function SettingsScreen() {
  const { client } = useSendmator();
  const [preferences, setPreferences] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Load preferences on mount
    if (token) {
      loadPreferences();
    }
  }, [token]);

  const loadPreferences = async () => {
    const data = await client.validateToken(token);
    setPreferences(data.preferences);
  };

  const togglePreference = async (channel, category, value) => {
    // Optimistic update
    setPreferences(prev => ({
      ...prev,
      [channel]: { ...prev[channel], [category]: value }
    }));

    // Sync with server
    try {
      await client.updateSinglePreference(
        contactId,
        channel,
        category,
        value,
        token
      );
    } catch (error) {
      // Revert on error
      loadPreferences();
    }
  };

  return (
    <ScrollView>
      <Text>Email Preferences</Text>
      <Switch
        value={preferences?.email?.promotional}
        onValueChange={(v) => togglePreference('email', 'promotional', v)}
      />
      {/* More switches */}
    </ScrollView>
  );
}
```

---

## 👥 End-User Experience Flow

### Flow 1: First-Time User (Magic Link)

```
1. User signs up for food delivery app "FoodFast"
   └─ Email: john@example.com

2. User receives welcome email with:
   "Manage your communication preferences"
   [Customize Preferences] button

3. User clicks button → Opens magic link:
   myapp://preferences?token=eyJhbGc...

4. FoodFast app opens to Preference Center screen

5. User sees beautiful UI with:
   ┌─────────────────────────────────┐
   │ Manage Preferences              │
   │                                 │
   │ 📧 Email                        │
   │   ✓ Order Updates      [ON]    │
   │   ✓ Promotions         [OFF]   │
   │   ✓ Weekly Newsletter  [ON]    │
   │                                 │
   │ 💬 SMS                          │
   │   ✓ Delivery Updates   [ON]    │
   │   ✓ Special Offers     [OFF]   │
   │                                 │
   │ 📱 WhatsApp                     │
   │   ✓ Order Status       [ON]    │
   └─────────────────────────────────┘

6. User toggles preferences → Instant feedback
   └─ Changes saved automatically

7. FoodFast respects preferences when sending messages
```

### Flow 2: Returning User (In-App)

```
1. User opens FoodFast app

2. Goes to Settings → "Communication Preferences"

3. Taps → Opens Preference Center screen
   (No email needed - already authenticated)

4. Updates preferences

5. Continues using app
```

### Flow 3: Email Unsubscribe Link

```
1. User receives promotional email from FoodFast

2. Clicks "Unsubscribe" link at bottom

3. Opens in app: myapp://preferences?token=...

4. Lands on Preference Center

5. Can:
   - Unsubscribe from just promotional emails
   - Unsubscribe from all email
   - Unsubscribe from everything
   - Or fine-tune individual preferences
```

---

## 🎨 Customization Examples

### Custom Branding

```tsx
<PreferenceCenterScreen
  magicLinkToken={token}
  theme={{
    colors: {
      primary: '#FF6B6B',      // Brand color
      success: '#51CF66',       // Success green
      error: '#FA5252',         // Error red
      background: '#FFFFFF',    // Light background
      surface: '#F8F9FA',       // Card background
      text: '#212529',          // Text color
      textSecondary: '#868E96', // Secondary text
      border: '#DEE2E6',        // Border color
    },
  }}
/>
```

### Custom Callbacks

```tsx
<PreferenceCenterScreen
  magicLinkToken={token}
  onClose={() => {
    navigation.goBack();
  }}
  onSave={(preferences) => {
    // Track in analytics
    analytics.track('Preferences Updated', {
      subscribedChannels: Object.keys(preferences).filter(
        channel => preferences[channel].promotional
      ),
    });

    // Update local state
    dispatch(updateUserPreferences(preferences));

    // Show confirmation
    Toast.show('Preferences saved!');
  }}
/>
```

---

## 🔐 Security

### How Magic Links Work

1. **User requests access:**
   ```
   POST /preference-center/request-access
   { email: "user@example.com", team_id: "..." }
   ```

2. **Backend generates JWT token:**
   ```javascript
   {
     contact_id: "cnt_abc123",
     email: "user@example.com",
     team_id: "team_xyz",
     exp: 1234567890 // 15 minutes expiry
   }
   ```

3. **Email sent with link:**
   ```
   myapp://preferences?token=eyJhbGc...
   ```

4. **SDK validates token:**
   ```
   GET /preference-center/validate-token
   Authorization: Bearer eyJhbGc...
   ```

5. **Backend verifies:**
   - Token signature valid
   - Token not expired
   - Contact exists
   - Returns preferences

6. **User makes changes:**
   ```
   PATCH /v1/contacts/:id/preferences/:channel/:category
   Authorization: Bearer eyJhbGc...
   ```

### Security Features

- ✅ **Short-lived tokens** (15 minutes)
- ✅ **Single-use capability** (optional)
- ✅ **JWT signed & verified**
- ✅ **HTTPS only**
- ✅ **Rate limiting** on backend
- ✅ **No password required**
- ✅ **Contact verification via email**

---

## 📊 Analytics Integration

Developers can track user behavior:

```tsx
import analytics from '@segment/analytics-react-native';

<SendmatorProvider
  config={{
    apiUrl: 'https://api.sendmator.com',
    teamId: 'team_abc123',
    onError: (error) => {
      analytics.track('Sendmator Error', {
        error: error.message,
        screen: 'PreferenceCenter',
      });
    },
  }}
>
  <PreferenceCenterScreen
    onSave={(preferences) => {
      analytics.track('Preferences Updated', {
        channels_enabled: Object.keys(preferences).length,
        email_promotional: preferences.email?.promotional,
        sms_enabled: Object.values(preferences.sms || {}).some(v => v),
      });
    }}
  />
</SendmatorProvider>
```

---

## 🧪 Testing

### Manual Testing

1. **Get a test token:**
   ```bash
   curl -X POST http://localhost:3000/preference-center/request-access \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "team_id": "your_team_id"
     }'
   ```

2. **Check email for magic link**

3. **Extract token from URL**

4. **Paste in example app**

5. **Test all features:**
   - Toggle preferences
   - Subscribe all
   - Unsubscribe all
   - Unsubscribe channel
   - Error handling

### Automated Testing

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { PreferenceCenterScreen } from 'sendmator-react-native';

describe('PreferenceCenterScreen', () => {
  it('loads and displays preferences', async () => {
    const { getByText } = render(
      <SendmatorProvider config={mockConfig}>
        <PreferenceCenterScreen magicLinkToken="test_token" />
      </SendmatorProvider>
    );

    await waitFor(() => {
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('SMS')).toBeTruthy();
    });
  });

  it('updates preference on toggle', async () => {
    const onSave = jest.fn();
    const { getByTestId } = render(
      <PreferenceCenterScreen
        magicLinkToken="test_token"
        onSave={onSave}
      />
    );

    fireEvent.press(getByTestId('toggle-email-promotional'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        email: expect.objectContaining({
          promotional: false
        })
      })
    );
  });
});
```

---

## 🚀 Publishing to npm

Once tested:

```bash
cd ~/Projects/sendmator-react-native

# Build
yarn prepare

# Login to npm
npm login

# Publish
npm publish

# Or publish as public (first time)
npm publish --access public
```

Then developers install with:
```bash
npm install sendmator-react-native
```

---

## 📱 Real-World Example: Food Delivery App

**App:** "QuickEats"
**Use Case:** Let users control which notifications they receive

```tsx
// App.tsx
import { SendmatorProvider } from 'sendmator-react-native';

<SendmatorProvider
  config={{
    apiUrl: 'https://api.sendmator.com',
    teamId: 'quickeats_team_id',
  }}
>
  <App />
</SendmatorProvider>

// SettingsScreen.tsx
function SettingsScreen() {
  return (
    <List>
      <ListItem
        title="Communication Preferences"
        onPress={() => navigation.navigate('Preferences')}
      />
    </List>
  );
}

// PreferencesScreen.tsx
function PreferencesScreen() {
  const { user } = useAuth();
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Request token for logged-in user
    requestPreferenceToken(user.email).then(setToken);
  }, []);

  if (!token) return <Loading />;

  return (
    <PreferenceCenterScreen
      magicLinkToken={token}
      onClose={() => navigation.goBack()}
      theme={{
        colors: {
          primary: '#FF6B35', // QuickEats brand orange
        },
      }}
    />
  );
}
```

**Result:** Users can now control:
- 📧 Order confirmation emails
- 💬 Delivery SMS updates
- 📱 Promotional WhatsApp messages
- 🔔 Push notifications for deals

All with a beautiful, native-feeling UI that took QuickEats developers **< 1 hour to integrate**!

---

## 💡 Key Benefits for Developers

1. **Quick Integration** - < 1 hour setup time
2. **No Backend Work** - Everything handled by Sendmator
3. **Beautiful UI** - Professional design out-of-box
4. **Customizable** - Match their brand
5. **Type-Safe** - Full TypeScript support
6. **Expo Compatible** - Works everywhere
7. **Well Documented** - Clear examples
8. **Maintained** - Regular updates from Sendmator team

---

## 🎯 Key Benefits for End-Users

1. **Easy Access** - One click from email
2. **Granular Control** - Choose exactly what they want
3. **Instant Updates** - Changes apply immediately
4. **Clear Categories** - Understand what each preference does
5. **Visual Feedback** - See changes as they happen
6. **No Account Needed** - Magic link = instant access
7. **Mobile-Native** - Feels like part of the app

---

Made with ❤️ by Sendmator
