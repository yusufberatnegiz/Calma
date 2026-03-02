// UNUSED — expo-router is the app entry point (package.json "main": "expo-router/entry").
// This file is kept for reference only and is not loaded at runtime.
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
