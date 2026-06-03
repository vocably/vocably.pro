# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the React Native mobile app for Vocably (iOS & Android). Part of Vocably monorepo (parent dir: `/packages`). Language-learning tool allowing users to select words/phrases while reading and learn via flashcards with spaced repetition.

## Prerequisites

1. React Native environment setup (see [React Native docs](https://reactnative.dev/docs/environment-setup?guide=native&package-manager=npm))
2. Dependencies from parent monorepo `/packages` must be built first:
   ```bash
   cd ../scripts && node build-packages.mjs
   ```

## Development Commands

### Initial Setup

```bash
npm install
npm run reset-ios          # Reset iOS build (rm -rf ios/build ios/Pods && pod-install)
npm run reset-android      # Reset Android build
```

### Running Dev Server

```bash
npm start                  # Start Metro bundler (with Safari extension dev setup)
npm run ios               # Run on iOS simulator
npm run android           # Run on Android emulator
npm run list-devices      # List available iOS simulators
```

### Testing & Linting

There is no testing or linting configured for this project.

## User interface language

The system interface is expected to be translated into the following languages:

- English (en) - default
- Russian (ru)
- Ukrainian (uk)
- Brazilian Portuguese (pt)
- Spanish (es)
- Turkish (tr)
- Vietnamese (vi)

The translation files are located in `src/i18n/locales`.

`src/i18n/lolcales/en.ts` is used ased as baseline that provides types for other translation typescript files.

Avoid plurals app states (e.g. "Загружаю" instead of "Загружаем"). There is only one person behind the app. Using plurals as "We" or "Us" is not appropriate.

## Architecture

### App Structure

- **Entry point**: `index.js` - registers App and ShareExtensionApp
- **Root**: `src/App.tsx` - nested provider hierarchy (Theme → Navigation → PostHog → Auth → CustomerInfo → Notifications → UserMetadata → Languages → TranslationPreset → RootModalStack)
- **Navigation**: React Navigation v7 (stack, tabs, drawer)
- **State management**: React Context

### Key Directories

```
src/
├── auth/              # AWS Amplify auth (Cognito)
├── study/             # Flashcard study UI & SRS logic
├── Settings/          # Settings stack screens
├── ShareIntent/       # iOS Share Extension integration
├── LookUpScreen/      # Word lookup & analysis
├── DeckStack/         # Deck management & notifications
├── Onboarding/        # First-run experience
├── Welcome/           # Welcome screens
├── ChatWithCard/      # AI chat with cards
├── TranslationPreset/ # Language pair management
├── ui/                # Reusable UI components
├── loaders/           # Loading states
```

### Tech Stack

- React Native 0.77.3 / React 18.3.1
- AWS Amplify 6 (auth, push notifications)
- React Navigation 7
- React Native Paper 5 (UI components)
- RevenueCat (in-app purchases)
- Sentry (error tracking)
- PostHog (analytics)
- TypeScript 5

### Key Features

- **iOS Safari Extension**: Built from `../packages/ios-extension`, copied to `ios/Vocably for Safari/Resources`
- **Share Extension**: Separate app target for iOS/Android share intent
- **Push Notifications**: AWS Pinpoint via Amplify
- **Audio playback**: `react-native-sound` for pronunciation
- **Shared Storage**: `react-native-shared-group-preferences` for iOS extension data sharing

## Environment Variables

Uses `react-native-dotenv`. Required vars in `.env`:

- `API_BASE_URL` - Backend API endpoint
- `API_REGION` - AWS region
- `API_CARDS_BUCKET` - S3 bucket for card data

Files: `.env.dev`, `.env.prod` (`.env` gitignored, copied from these)

## iOS Extension Integration

Safari extension setup runs automatically with `npm start`:

```bash
npm run setup-safari-extension-dev   # Build dev + copy to ios/
npm run setup-safari-extension-prod  # Build prod + copy to ios/
npm run copy-ios-extension          # Copy built extension
```

## API Integration

Uses `@vocably/api` package from monorepo. Configured in `src/App.tsx`:

- Base URL from env
- JWT from AWS Amplify session
- Backend: AWS Lambda (see parent `/packages/backend`)

## Dependencies from Monorepo

External packages (must be built in parent):

- `@vocably/api` - API client
- `@vocably/model` - TypeScript types
- Other shared packages from `/packages`

## Common Patterns

### Authentication

- AWS Cognito via Amplify
- Custom storage: `src/auth/AuthStorage.ts`
- Managed by `src/auth/AuthContainer.tsx`

### Navigation

- Stack navigator in `src/RootModalStack.tsx`
- Tabs in `src/TabsNavigator.tsx`
- Deck stack in `src/DeckStack.tsx`

### Theming

- `src/ThemeProvider.tsx` wraps app
- React Native Paper theme + custom dark/light mode

### Analytics

- PostHog: `src/PostHogProvider.tsx`
- Sentry: initialized in `index.js`

## Platform-Specific Code

Files with `.ios.tsx` or `.android.tsx` extensions for platform-specific implementations:

- `src/ShareIntent/ShareExtensionApp.ios.tsx`
- `src/ShareIntent/ShareExtensionApp.android.tsx`

## Troubleshooting

### Build Issues

```bash
npm run reset-ios          # Clear iOS build artifacts
npm run reset-android      # Clear Android build artifacts (incl. stale .cxx native caches)
cd ios && pod install      # Reinstall CocoaPods (iOS only)
```

If an Android build/deploy fails in CMake with `Imported target "ReactAndroid::jsi"
includes non-existent path .../.gradle/caches/.../transforms/...`, the `.cxx` native
build cache is stale (it hard-codes a Gradle transforms path that has since been
evicted). Run `npm run reset-android` to clear it.

### Metro Bundler

```bash
npm start -- --reset-cache # Clear Metro cache
```

### Dependencies

Ensure parent monorepo packages built:

```bash
cd ../scripts && node build-packages.mjs
```
