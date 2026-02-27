# Calma — AI Agent Instructions (AGENTS.md)

## Project Summary
Calma is an iOS-first mobile app that helps people with OCD delay and reduce compulsions using calming, gamified support.

MVP Features (P0):
1) Virtual Pet system (growth tied to resisted compulsions and completed daily tasks)
2) Panic Button (urge type + intensity + delay timer + acceptance script + outcome logging)
3) Daily Log (day rating, compulsion count/types, notes)
4) Daily Micro ERP Tasks (simple templated daily challenges)

Constraints:
- Budget: <$50/month
- Timeline: 4 weeks
- Offline-first: app must work without internet
- Privacy: strong expectations; minimize PII and keep data access locked per user
- Platform: iOS-first for MVP (Android later)

No AI features in v1 (AI progress report is v2).

## Non-Negotiables
- Do NOT provide reassurance content (e.g., “Nothing bad will happen”).
- Keep UX calm: soft visuals, minimal clutter, gentle animations.
- Panic Button must function fully offline.
- Use strict TypeScript (no `any`).
- Prefer stable libraries; do not introduce unnecessary dependencies.

## Tech Stack (Locked)
- Expo (React Native) + TypeScript
- Firebase (Auth + Firestore)
- Local notifications (no push)

## Data Model (Firestore)
Path pattern:
- /users/{uid}
- /users/{uid}/pet/state
- /users/{uid}/logs/{logId}
- /users/{uid}/urges/{urgeId}
- /users/{uid}/tasks/{taskId}

Rules:
- Each user can only read/write their own subcollections.
- Basic schema validation in rules where feasible.

## Architecture Guidelines
- Routes in `app/` (expo-router)
- Feature modules in `src/features/*`
- Shared UI components in `src/components/*`
- Firebase access isolated in `src/lib/firebase/*`
- Domain logic isolated in `src/domain/*` (pet growth rules, task generation, etc.)

## Quality Bar
- Every screen must be usable with one hand (iPhone)
- 60fps animations for pet idle movement (simple)
- Robust error handling: user-friendly messages, never crash
- Offline behavior tested (airplane mode)

## Testing Expectations
- Unit tests for domain logic (pet growth, task generation)
- Smoke test main flow:
  Home → Panic Button → Save outcome → Pet grows → Daily log saved

## Build Order (Follow This)
1) Project setup + navigation + design tokens
2) Firebase init + Anonymous Auth + Firestore persistence
3) Pet Home screen + pet state storage
4) Panic Button flow + urge logging + rewards
5) Daily Log
6) Daily Tasks
7) Local notifications
8) Polish + TestFlight prep

## Definition of Done (MVP)
- All P0 features implemented and stable
- Offline mode verified
- Firestore security rules applied and tested
- Costs remain within budget
- Ready for TestFlight
