# Technical Design Document: Calma MVP

## Overview

This document defines how Calma will be built based on the approved PRD.

**Platform:** iOS-first Mobile App\
**Stack:** Expo (React Native) + TypeScript + Firebase\
**AI Development Tools:** Cursor + Claude Code\
**Budget:** Under \$50/month\
**Timeline:** 4 weeks

------------------------------------------------------------------------

## Architecture Overview

### Recommended Stack

**Primary Recommendation: Expo + Firebase**

Why: - Fast development cycle - Strong AI tooling support -
Offline-first capability - Scales easily - Keeps costs minimal

Alternatives considered:

  ------------------------------------------------------------------------
  Option                       Pros                  Cons
  ---------------------------- --------------------- ---------------------
  Expo + Firebase              Fast, scalable,       Requires App Store
                               AI-friendly           process

  FlutterFlow                  Faster UI building    Harder custom logic
                                                     later

  Native Swift                 Best performance      Slower to build
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## Core System Design

### High-Level Flow

User Action → App Logic → Firestore → UI Update

No dedicated backend server required for MVP.

------------------------------------------------------------------------

## Data Model (Firestore)

Collections:

/users/{uid} /users/{uid}/pet/state /users/{uid}/logs/{logId}
/users/{uid}/urges/{urgeId} /users/{uid}/tasks/{taskId}

### Example Structures

**pet/state** - name - stage - xp - mood - updatedAt

**logs** - date - dayRating - compulsionCount - compulsionTypes -
notes - createdAt

**urges** - createdAt - urgeType - intensity - delaySeconds - outcome

------------------------------------------------------------------------

## Offline Strategy

-   Enable Firestore offline persistence
-   Panic Button must work fully offline
-   Sync automatically when online
-   No blocking "offline mode" screens

------------------------------------------------------------------------

## Security Design

-   Use Firebase Anonymous Auth
-   Restrict read/write to user-owned documents
-   No unnecessary PII collection
-   Add privacy screen in-app

------------------------------------------------------------------------

## Feature Implementation Plan

### 1. Virtual Pet System

-   XP increases from resisted urges and completed tasks
-   Stage evolves every 100 XP
-   Mood reflects recent activity

### 2. Panic Button

Flow: 1. Select urge type 2. Rate intensity 3. Start delay timer 4.
Acceptance script display 5. Outcome selection 6. Save urge + reward pet

Must function offline.

### 3. Daily Log

-   Rate day
-   Count compulsions
-   Write notes
-   Editable entry per day

### 4. Daily Tasks

-   Local JSON templates
-   1--3 tasks generated daily
-   Completion increases XP

------------------------------------------------------------------------

## Analytics (Minimal)

Track: - panic_started - panic_completed - log_created - task_completed

Use Firebase Analytics.

------------------------------------------------------------------------

## Cost Breakdown

  Service             Estimated Cost
  ------------------- ------------------------------
  Firebase            \$0 (Spark Plan)
  Apple Dev Program   \~\$8.25/month (annual \$99)
  Cursor/Claude       Depends on subscription
  Total Infra         Under \$50/month

------------------------------------------------------------------------

## 4-Week Timeline

Week 1: - Project setup - Firebase setup - Pet screen

Week 2: - Panic Button implementation

Week 3: - Daily log + tasks

Week 4: - UI polish - Testing - TestFlight submission

------------------------------------------------------------------------

## AI Development Strategy

Use: - Cursor for component generation - Claude Code for multi-file
refactors and debugging

Prompt template: "Implement \[feature\] in Expo + TypeScript using
Firebase Firestore. Must work offline."

------------------------------------------------------------------------

## Definition of Technical Success

-   App runs without crashing
-   All 4 MVP features functional
-   Offline functionality verified
-   Monthly cost within budget
-   Ready for TestFlight

------------------------------------------------------------------------

Created: 2026-02-27 Document: TechDesign-Calma-MVP.md
