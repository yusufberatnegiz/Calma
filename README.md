# Calma (MVP)

## What this is
Calma is an iOS-first mobile app that helps people with OCD delay and reduce compulsions using calming, gamified support.

## Stack
- Expo (React Native) + TypeScript
- Firebase (Auth + Firestore)
- Local notifications (no push)

## Quick Start
1) Install dependencies:
```bash
npm install
```

2) Start dev server:
```bash
npx expo start
```

## Environment variables
Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## MVP Screens
- Home (Pet)
- Panic Button
- Daily Log
- Daily Tasks
- Settings (minimal)

## Notes
- MVP has no AI features
- App must work offline
- Strong privacy expectations (minimize PII; strict Firebase rules)
