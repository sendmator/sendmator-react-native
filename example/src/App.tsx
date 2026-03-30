import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import Constants from 'expo-constants';
import {
  SendmatorProvider,
  PreferenceCenterScreen,
  MonochromeTheme,
  OceanBlueTheme,
  SunsetPurpleTheme,
  SlateGreyTheme,
  DarkTheme,
  LightTheme,
} from 'sendmator-react-native';

// Get environment variables from expo-constants
const API_KEY = Constants.expoConfig?.extra?.sendmatorApiKey || 'your-api-key-here';
const API_URL = Constants.expoConfig?.extra?.sendmatorApiUrl || 'http://localhost:3000';
const DEFAULT_CONTACT_ID = Constants.expoConfig?.extra?.sendmatorTestContactId || '';

function AppContent() {
  const [contactId, setContactId] = useState<string>(DEFAULT_CONTACT_ID);
  const [showPreferences, setShowPreferences] = useState(false);

  const handleShowPreferences = () => {
    if (!contactId) {
      Alert.alert('Error', 'Please enter a contact ID or external ID');
      return;
    }
    
    setShowPreferences(true);
  };

  if (showPreferences) {
    return (
      <PreferenceCenterScreen
        contactId={contactId}
        onClose={() => setShowPreferences(false)}
        onSave={(preferences) => {
          console.log('Preferences saved:', preferences);
        }}
        theme={LightTheme}
        hideHeader={true}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sendmator Preference Center</Text>
        <Text style={styles.subtitle}>
          Test the preference management screen
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Contact ID or External ID"
          value={contactId}
          onChangeText={setContactId}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleShowPreferences}
        >
          <Text style={styles.buttonText}>Open Preference Center</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to test:</Text>
          <Text style={styles.instructionsText}>
            1. Make sure your backend is running at {API_URL}
          </Text>
          <Text style={styles.instructionsText}>
            2. Create a contact via API or dashboard
          </Text>
          <Text style={styles.instructionsText}>
            3. Enter the contact's external_id above
          </Text>
          <Text style={styles.instructionsText}>
            4. Click "Open Preference Center"
          </Text>
          <Text style={styles.instructionsText}>
            5. Use the 🎨 button to switch themes!
          </Text>
        </View>

        <View style={styles.apiInfo}>
          <Text style={styles.apiInfoTitle}>Configuration:</Text>
          <Text style={styles.apiInfoText}>API URL: {API_URL}</Text>
          <Text style={styles.apiInfoText}>
            API Key: {API_KEY.substring(0, 20)}...
          </Text>
          <Text style={[styles.apiInfoText, { marginTop: 8, fontSize: 11 }]}>
            💡 The SDK includes a built-in theme switcher with 6 themes
          </Text>
        </View>

        <View style={styles.envNote}>
          <Text style={styles.envNoteText}>
            Edit example/.env to configure API settings
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SendmatorProvider
      config={{
        apiKey: API_KEY,
        apiUrl: API_URL,
        onError: (error) => {
          console.error('Sendmator error:', error);
          Alert.alert('Error', error.message);
        },
      }}
    >
      <AppContent />
    </SendmatorProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  apiInfo: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90CAF9',
    marginBottom: 12,
  },
  apiInfoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 6,
  },
  apiInfoText: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 2,
  },
  envNote: {
    backgroundColor: '#FFF9C4',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDD835',
  },
  envNoteText: {
    fontSize: 11,
    color: '#F57F17',
    textAlign: 'center',
  },
});
