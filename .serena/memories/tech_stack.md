# Technology Stack

## Core Framework
- **Framework**: React Native 0.81.4 with Expo SDK 54
- **Language**: TypeScript 5.9.2 (strict mode enabled)
- **Runtime**: React 19.1.0
- **Platform**: iOS + Android

## State Management
- **Primary**: Zustand 5.0.8 (lightweight, no Redux boilerplate)
- **Why**: Simple API, minimal setup, TypeScript-first

## Database & Storage
- **Database**: expo-sqlite 16.0.8 with SQLCipher encryption
- **Encryption**: 256-bit AES encryption keys
- **Key Storage**: expo-secure-store 15.0.7 (OS Keychain/Keystore)
- **Why**: ACID compliance, encrypted, mature, offline-first

## Animation & Performance
- **Animations**: react-native-reanimated 4.1.3 + moti 0.30.0
- **Graphics**: @shopify/react-native-skia 2.3.0 (glass effects)
- **Lists**: @shopify/flash-list 2.1.0 (virtualized rendering)
- **Gestures**: react-native-gesture-handler 2.28.0
- **Why**: 60fps worklets on UI thread, proven for CRED-like polish

## Native Modules
- **Contacts**: expo-contacts 15.0.9
- **Sharing**: expo-sharing 14.0.7
- **Documents**: expo-document-picker 14.0.7
- **Haptics**: expo-haptics 15.0.7
- **QR Codes**: react-native-qrcode-svg 6.3.15
- **SVG**: react-native-svg 15.14.0
- **Device Info**: expo-device 8.0.9

## Utilities
- **Date Handling**: date-fns 4.1.0
- **Validation**: zod 3.25.76
- **Slider**: @react-native-community/slider 5.0.1

## Testing & Quality
- **Unit Tests**: jest 30.2.0 + jest-expo 54.0.12
- **React Testing**: @testing-library/react-native 13.3.3
- **E2E Testing**: Detox (configured, not yet installed)
- **Linting**: ESLint 9.37.0 + @typescript-eslint 8.46.1
- **Configuration**: eslint-config-expo 10.0.0

## Build & Bundling
- **Bundler**: Metro (via Expo)
- **Babel**: babel-preset-expo 54.0.4
- **TypeScript Compiler**: tsc 5.9.2

## Development Tools
- **Package Manager**: npm (package-lock.json present)
- **CI/CD**: GitHub Actions (5 jobs: lint, test, build, security)
- **Coverage**: Jest with text, HTML, LCOV reporters
- **Git**: Version control with main branch

## Why React Native?
✅ Best balance of performance, ecosystem, and animation capabilities
✅ Proven for CRED-like polish with Reanimated 3 + Skia
✅ Single codebase for iOS + Android
✅ Strong native module support through Expo
✅ Offline-first capabilities with SQLite
