# DevQuest — Build Task Flow

This document defines the step-by-step implementation plan for DevQuest MVP.

---

# Phase 0 — Repository & Tooling Setup

**Goal:** The project builds, deploys, and follows code quality standards.

## Tasks

- Create branch `setup/vite-tooling`
- Initialize Vite (Vanilla + TypeScript) inside `/app`
- Configure `vite.config.ts` base for GitHub Pages
- Add ESLint + Unicorn
- Add Prettier
- Configure Husky + lint-staged (Husky in root, lint in `/app`)
- Add GitHub Actions workflow:
  - install
  - lint
  - typecheck
  - build
  - deploy `app/dist` to GitHub Pages
- Enable GitHub Pages (Actions source)

**Deliverable:**  
Project runs locally and deploys automatically on push to `main`.

---

# Phase 1 — Application Skeleton

**Goal:** Working navigation with Store + EventBus + hash routing.

## Tasks

- Create base screen sections
  - WELCOME
  - SIGN_IN
  - SIGN_UP
  - SKILL_SELECT
  - DASHBOARD
  - GAME
  - -STATISTICS?
- Implement:
  - `core/store.ts`
  - `core/events.ts`
- Implement hash router (`/#/route`)
- Implement `screenManager.ts`
- Add route guards:
  - Protect dashboard/game from anonymous users
  - Redirect to SKILL_SELECT if skill is missing
- Create basic screen modules (`mount()` pattern)

**Deliverable:**  
Navigation works, URL updates correctly, no 404 on refresh.

---

# Phase 2 — Supabase Integration

**Goal:** Authentication and persistent user data.

## Supabase Setup

- Create Supabase project
- Enable Email/Password auth
- Create tables:
  - `profiles`
  - `player_state`
- Enable RLS
- Add policies (users can access only their own rows)

## Frontend Tasks

- Add `@supabase/supabase-js`
- Create `supabaseClient.ts`
- Implement `authFlow.ts`
  - sign up
  - sign in
  - sign out
  - session restore
- Implement `profileService.ts`
- Implement `progressService.ts`

**Deliverable:**  
Users can register, log in, and their progress persists.

---

# Phase 3 — Game MVP

**Goal:** Playable Day 1 with full loop.

## Core Game Tasks

- Define domain types
- Implement `timer.ts`
- Implement `statsManager.ts`
- Implement `dayManager.ts`
  - 3 tasks available
  - Complete 2 of 3 → emit `DAY_COMPLETED`
- Implement `taskManager.ts`

## Widgets

- `quizWidget.ts`
- `codeReviewWidget.ts`
- `dragDropWidget.ts`
- Unified result format:

```ts
{
  outcome: "correct" | "wrong" | "timeout",
  userAnswer: string
}
```
Deliverable:
User can complete a day, stats update, next day unlocks.

## Phase 4 — AI Integration (Secure)

Goal: AI-generated tasks without exposing API key.
Supabase Edge Function
Create generate-task function
Store GEMINI_KEY in Supabase Secrets
Validate input
Return structured JSON

# Frontend
Implement aiService.ts
Call Edge Function from taskManager.ts
Handle AI response

Deliverable:
Tasks generated dynamically via Gemini, key remains secure.

## Phase 5 — Senior Developer Chat
Goal: In-game help system.
Tasks
Create messages table
Implement chatService.ts
Add chat UI inside GAME screen
Store message history
Limit help requests per day OR add cooldown

Optional:
Enable Supabase Realtime subscription

Deliverable:
User can request help from Senior Dev (AI-simulated), history saved.

## Phase 6 — Polish & Stability

Goal: Production-ready MVP.
Tasks
Add loaders
Add toasts
Add modal results screen
Improve pixel UI components
Add error handling
Handle burnout state
Refine difficulty scaling

Deliverable:
Stable and polished playable MVP.


## Final Outcome

DevQuest MVP includes:

Authentication
Persistent progression
AI-generated tasks
Event-driven architecture
Secure API integration
CI/CD pipeline
Static deployment (GitHub Pages)
The system is modular, scalable, and production-ready.
