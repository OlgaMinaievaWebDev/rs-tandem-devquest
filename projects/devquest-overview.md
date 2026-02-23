# DevQuest — Software Architecture Specification (SAS)

Document Version: 1.0  
Status: Draft  
Project: DevQuest  
Last Updated: 2026-Feb-23

---

# 1. Introduction

## 1.1 Purpose

This document defines the software architecture of DevQuest, including system structure, component responsibilities, integration patterns, data flow, security model, and deployment strategy.
The purpose of this specification is to ensure architectural consistency, scalability, security, and maintainability.

---

## 1.2 Scope

DevQuest is a desktop-first pixel-art developer training simulator.

The system provides:

- User authentication
- Skill-based task generation
- Day-based progression system
- Stress and Authority mechanics
- AI-powered task generation
- Real-time assistance chat
- CI/CD deployment pipeline

---

## 1.3 Architectural Goals

- Clear separation of concerns
- Secure handling of API keys
- Deterministic state management
- Modular scalability
- Static-hosting compatibility
- Production-grade CI/CD

---

# 2. Architectural Overview

## 2.1 Architecture Style

DevQuest follows:

- Layered Architecture
- Event-Driven Communication Model
- Single Source of Truth State Management
- Secure API Proxy Pattern
- Static SPA Deployment Model

---

## 2.2 High-Level System Diagram


┌──────────────────────────────────────────────┐
│ Frontend │
│ UI Layer │
│ Game Logic Layer │
│ Core Layer (Store + EventBus + Routing) │
│ Services Layer │
└──────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────┐
│ Supabase │
│ Authentication │
│ Database │
│ Realtime │
│ Edge Functions (AI Proxy) │
└──────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────┐
│ Gemini API │
└──────────────────────────────────────────────┘


---

# 3. Frontend Architecture

## 3.1 Layered Structure

### 3.1.1 UI Layer

Responsibilities:
- Render screens and components
- Capture user interaction
- Dispatch domain events

Constraints:
- No business logic
- No direct database or AI calls

---

### 3.1.2 Game Logic Layer

Responsibilities:
- Day lifecycle management
- Task orchestration
- Timer handling
- Stress and Authority calculations

Characteristics:
- Pure logic
- DOM-agnostic
- Stateless except via Store

---

### 3.1.3 Core Layer

Components:
- Global Store
- EventBus
- Screen Manager
- Router (Hash-based)

Responsibilities:
- Centralized state control
- Event distribution
- Navigation control

---

### 3.1.4 Services Layer

Responsibilities:
- Supabase authentication
- Database CRUD
- Realtime subscriptions
- AI proxy calls

All external integrations are isolated in this layer.

---

# 4. State Management

## 4.1 Single Source of Truth

The application state is centralized in a Global Store.

### State Domains

- `auth` → user/session
- `profile` → name/avatar/skill
- `progress` → day/stress/authority
- `runtime` → currentScreen/currentTask/loading/errors

All state mutations must go through controlled update functions.

---

## 4.2 Event-Driven Communication

EventBus distributes domain events.

### Minimum Event Set

- AUTH_CHANGED
- PROFILE_LOADED
- TASK_FINISHED
- DAY_COMPLETED

### Example Flow


TASK_FINISHED
→ statsManager.apply()
→ UI update
→ dayManager.increment()
→ emit DAY_COMPLETED


Modules remain loosely coupled.

---

# 5. Routing Strategy

## 5.1 Hash Routing

DevQuest uses hash-based routing to support static hosting environments.

Example routes:

- /#/welcome
- /#/dashboard
- /#/game
- /#/statistics



Advantages:
- No server rewrite required
- Compatible with GitHub Pages
- Safe refresh behavior

---

# 6. Game Domain Model

## 6.1 Day Rules (MVP)

- 3 tasks available per day
- User must complete 2 of 3
- Per-task timer
- Difficulty scales with day
- Skill modifies task generation context

---

## 6.2 Widget Model

Each task widget returns a unified result structure:

```ts
{
  outcome: "correct" | "wrong" | "timeout",
  userAnswer: string
}

This enables consistent evaluation logic.

7. Backend Architecture

## 7.1 Supabase Services

Supabase provides:

Authentication (email/password)
PostgreSQL database
Row Level Security
Realtime subscriptions
Edge Functions


## 7.2 Data Model profiles

id
name
avatar
skill
player_state
user_id
day
stress
authority
messages
id
user_id
text
created_at

RLS ensures user data isolation.

8. Realtime Communication

Realtime chat uses:
Supabase messages table
Realtime subscription
Client-side listener

Constraints:

Message limit per day OR cooldown
RLS-based access control

9. AI Integration Architecture
9.1 Security Model

Gemini API key is never exposed to the client.

Architecture:

Frontend
  → aiService
  → Supabase Edge Function
  → Gemini API

Edge Function:

Stores GEMINI_KEY in environment secrets
Validates input
Returns structured JSON
Client receives only processed data.

10. Deployment Architecture
10.1 Repository Structure

root/
  README.md
  notes/
  .husky/
  .github/workflows/

app/src/
  main.ts                 # entry (запуск приложения)
  app.ts                  # bootstrap (mount screens, init auth)

  core/
    store.ts              # global state (single source of truth)
    events.ts             # event bus (pub/sub)
    constants.ts          # game constants (limits, deltas)

  ui/
    screenManager.ts      # showScreen + bootToCorrectScreen
    screens/              # каждый экран = mount() + handlers
      welcome.ts
      signIn.ts
      signUp.ts
      skillSelect.ts
      dashboard.ts
      game.ts
    components/           # переиспользуемые UI блоки
      modal.ts
      toast.ts
      loader.ts
      pixelBars.ts        # stress/authority bars

  game/
    gameManager.ts        # startGame/endGame, orchestration
    dayManager.ts         # day flow: 2 of 3 tasks -> DAY_COMPLETED
    taskManager.ts        # pick/generate/evaluate task
    statsManager.ts       # apply stress/authority
    timer.ts              # per-task timer (start/stop)

  widgets/
    taskRenderer.ts       # switch by type -> widget
    quizWidget.ts
    codeReviewWidget.ts
    dragDropWidget.ts

  services/
    supabaseClient.ts     # createClient + env
    authFlow.ts           # sign up/in/out, session restore
    profileService.ts     # profiles CRUD
    progressService.ts    # player_state CRUD
    chatService.ts        # realtime chat subscribe/send
    aiService.ts          # calls Edge Function (NO Gemini key in client)

  types/
    domain.ts             # Task, Profile, Message, Events typings

  styles/
    main.css              # base styles + pixel UI


10.2 CI/CD Flow

On push to main:
Install dependencies
Lint
Typecheck
Build
Deploy app/dist to GitHub Pages

11. Security Considerations

API keys stored server-side only
RLS enforced on all tables
No business logic in client routing
Controlled state mutations
No direct DB access from UI

12. Non-Functional Requirements

Static hosting compatibility
Deterministic state updates
Modular scalability
Secure API management
Minimal coupling between modules

13. Architectural Principles

Separation of Concerns
Secure-by-Design
Explicit Data Flow
Event-Driven Modularity
Infrastructure Isolation

14. Conclusion

DevQuest is designed as a secure, modular, event-driven web system with:
Clean layer separation
Secure AI integration
Real-time communication capability
Production-grade deployment workflow
Scalable frontend architecture
