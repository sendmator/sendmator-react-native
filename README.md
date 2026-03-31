# Sendmator React Native SDK

React Native SDK for contact preference management. Drop-in UI component that allows your users to manage their communication preferences.

## Installation

```bash
npm install @sendmator/react-native
# or
yarn add @sendmator/react-native
```

## Usage

### 1. Wrap your app with SendmatorProvider

```tsx
import { SendmatorProvider } from '@sendmator/react-native';

export default function App() {
  return (
    <SendmatorProvider
      config={{
        apiKey: 'sk_live_your_api_key',
        apiUrl: 'https://api.sendmator.com/api',
      }}
    >
      <YourApp />
    </SendmatorProvider>
  );
}
```

### 2. Use PreferenceCenterScreen in your settings

```tsx
import { PreferenceCenterScreen } from '@sendmator/react-native';

function UserSettingsScreen() {
  const { user } = useAuth();
  const [showPreferences, setShowPreferences] = useState(false);

  if (showPreferences) {
    return (
      <PreferenceCenterScreen
        contactId={user.sendmatorContactId}
        onClose={() => setShowPreferences(false)}
      />
    );
  }

  return (
    <View>
      <Button
        title="Communication Preferences"
        onPress={() => setShowPreferences(true)}
      />
    </View>
  );
}
```

## Props

### SendmatorProvider

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config.apiKey` | `string` | Yes | Your Sendmator API key |
| `config.apiUrl` | `string` | Yes | API URL (use `https://api.sendmator.com/api` for production) |
| `config.onError` | `(error: Error) => void` | No | Error handler |

### PreferenceCenterScreen

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `contactId` | `string` | Yes | Your user's ID |
| `onClose` | `() => void` | No | Callback when screen is closed |
| `onSave` | `(preferences) => void` | No | Callback after preferences are saved |
| `theme` | `object` | No | Custom colors (see below) |
| `hideHeader` | `boolean` | No | Hide the header with title and close button |

### Theming

The SDK includes a built-in theme switcher with 9 pre-built premium themes. Users can switch themes using the 🎨 button in the header, or you can force a specific theme via props.

#### Built-in Theme Switcher (Default Behavior)

By default, the SDK shows a theme picker button (🎨) in the header that allows users to switch between themes:

```tsx
// Users can switch themes using the built-in picker
<PreferenceCenterScreen
  contactId={contactId}
  onClose={() => setShowPreferences(false)}
/>
```

#### Force a Specific Theme

You can override the theme switcher and force a specific theme:

```tsx
import {
  PreferenceCenterScreen,
  LightTheme,
  DarkTheme,
  OceanBlueTheme,
} from '@sendmator/react-native';

// Use a pre-built theme
<PreferenceCenterScreen
  contactId={contactId}
  theme={DarkTheme}
/>
```

#### Available Themes

- **Default** - Modern indigo theme (default when no theme specified)
- **LightTheme** - Clean white background with black text
- **DarkTheme** - Pure black background with white text
- **MonochromeTheme** - Classic black and white for minimalist interfaces
- **OceanBlueTheme** - Modern blue theme for professional SaaS apps
- **SunsetPurpleTheme** - Creative purple theme for consumer apps
- **IndigoDarkTheme** - Premium dark mode with indigo accent
- **ForestGreenTheme** - Natural green theme for wellness apps
- **SlateGreyTheme** - Professional neutral grey for enterprise apps

> **Note:** When you provide a `theme` prop, the theme switcher button is automatically hidden.

#### Custom Theme

```tsx
<PreferenceCenterScreen
  contactId={contactId}
  theme={{
    colors: {
      primary: '#FF6B6B',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E0E0E0',
      success: '#51CF66',
      error: '#FA5252',
      accent: '#FF6B6B',
    },
  }}
/>
```

## Contact ID

The `contactId` prop should be your application's user ID. This is the same identifier you use when creating contacts in your Sendmator dashboard or via the Sendmator API.

```tsx
<PreferenceCenterScreen
  contactId={user.id}  // Your app's user ID
  onClose={() => setShowPreferences(false)}
/>
```

For more information on managing contacts, visit the [Sendmator Documentation](https://sendmator.com/docs).

## TypeScript

Full TypeScript support included:

```typescript
import type {
  ContactPreferences,
  ContactData,
  PreferenceCenterProps,
} from '@sendmator/react-native';
```

## License

MIT

---

Made with ❤️ by [Sendmator](https://sendmator.com)
