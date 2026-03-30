require('dotenv').config();

module.exports = {
  expo: {
    name: "SendmatorReactNative Example",
    slug: "sendmator-react-native-example",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "sendmatorreactnative.example"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "sendmatorreactnative.example"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      sendmatorApiKey: process.env.SENDMATOR_API_KEY,
      sendmatorApiUrl: process.env.SENDMATOR_API_URL,
      sendmatorTestContactId: process.env.SENDMATOR_TEST_CONTACT_ID
    }
  }
};
