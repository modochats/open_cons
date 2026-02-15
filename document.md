# Open Cons - Task Documentation

This document tracks all tasks and changes made to the project.

---

## 2026-02-15

### Task 1: Create Documentation Files
**Status:** Completed
**Description:**
- Created `summerize.md` with project summary including tech stack, project structure, features, and color palette
- Created `document.md` for tracking future tasks

**Files Created:**
- `/summerize.md` - Project summary documentation
- `/document.md` - Task tracking document

---

## 2026-02-15 - Project Tasks

### Task 1: Supabase Setup & Database Schema
**Status:** Completed
**Description:** Create Supabase database schema including users, agents, flows, nodes, questions, answers tables and realtime settings

### Task 3: Supabase Client & API Routes Setup
**Status:** Completed
**Description:** Create Supabase client, setup authentication and API routes for data management without direct database access from frontend

### Task 5: RTL & Vazir Font Configuration
**Status:** Completed
**Description:** Update layout.tsx to set dir="rtl" and lang="fa", apply Vazir font across the application

---

### Task 7: Questions Page Implementation
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Q&A page with question submission, list, detail/edit, and agent answers

**Subtasks:**
- [x] 7.1 Create Questions page layout and routing (`/questions`)
- [x] 7.2 Question list with create form (sort, optional category filter)
- [x] 7.3 Question detail page (`/questions/[id]`) with view and edit (owner only)
- [x] 7.4 Create question form (title, content, category); POST `/api/questions`
- [x] 7.5 Answers list on question detail (from `answers` table, agent name + time)
- [x] 7.6 API: GET/POST `/api/questions`, GET/PATCH `/api/questions/[id]`, GET `/api/questions/[id]/answers`
- [x] 7.7 Question status: set to `answered` when workflow posts an answer
- [ ] 7.8 Implement Supabase realtime subscription for questions (optional)
- [ ] 7.9 Implement Supabase realtime subscription for answers (optional)

**Files:** `src/app/questions/page.tsx`, `src/app/questions/[id]/page.tsx`, `src/app/api/questions/route.ts`, `src/app/api/questions/[id]/route.ts`, `src/app/api/questions/[id]/answers/route.ts`

---

### Task 9: Agent Builder with ReactFlow
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Create dashboard using ReactFlow for visual agent building with three node types: Trigger, Agent, and Response

**Subtasks:**
- [x] 9.1 Create Dashboard layout and routing (`/dashboard`)
- [x] 9.2 Create agents list on dashboard (create agent, list agents, link to builder)
- [x] 9.3 Create agent builder page (`/dashboard/agents/builder/[agentId]`)
- [x] 9.4 Setup ReactFlow canvas with custom nodes
- [x] 9.5 Create Trigger node component
- [x] 9.6 Create Agent node component
- [x] 9.7 Create Response node component
- [x] 9.8 Implement drag-and-drop (canvas) and add-node panel (Trigger, Agent, Response)
- [x] 9.9 Create API route for agents CRUD (`/api/agents`, `/api/agents/[id]`)
- [x] 9.10 Create API route for flows CRUD (`/api/agents/[id]/flows`, `/api/flows/[id]`)
- [x] 9.11 Save/load flow data to database
- [x] 9.12 Add Persian/English translations for dashboard and builder UI

**Files:** `src/app/api/agents/*`, `src/app/api/flows/[id]/*`, `src/components/flow/*`, `src/app/dashboard/page.tsx`, `src/app/dashboard/agents/builder/[agentId]/page.tsx`, `src/contexts/I18nContext.tsx` (dashboard keys)

---

### Task 13: Homepage
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Create main landing page with navigation

**Subtasks:**
- [x] 13.1 Create navigation header component
- [x] 13.2 Update homepage with project info
- [x] 13.3 Add links to Questions and Dashboard pages
- [x] 13.4 Add Persian translations for all UI text

**Files:** `src/components/Header.tsx`, `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/questions/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/not-found.tsx`

---

### Task: Routes & 404 Fix
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Add missing pages so all URLs resolve; fix 404 on all routes

**Done:** Root page, login, register, questions, dashboard, custom not-found; shared Header with nav, language switcher, auth button.

---

### Task: Font Loading Fix
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Fix Vazir font not loading

**Done:** Moved font variable to `html`; removed circular `--font-vazir` from Tailwind theme; added `.font-vazir` utility; default `font-vazir` on html for first paint.

---

### Task: Dashboard Auth & User Menu
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Restrict dashboard to logged-in users; show username and avatar; add logout

**Done:** Dashboard redirects to `/login` when not authenticated; Header shows Dashboard link only when logged in; AuthButton shows user avatar (or initials), display name, dropdown with email and logout; logout clears session and redirects to home.

---

### Task 15: Trigger & Flow Execution System
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Workflow runs when a question is created; processes flows with trigger_type=question_created; Agent nodes call LLM; Response node saves answers

**Subtasks:**
- [x] 15.1 Trigger: POST `/api/questions` calls `runWorkflowsForQuestion(questionId)` after insert
- [x] 15.2 question_created: workflow loads active flows with `trigger_type=question_created`, `is_active=true`
- [x] 15.3 Flow executor: `src/lib/workflow/run.ts` – graph order (trigger→agent→response), substitute `{{question.*}}`, `{{previous_output}}`
- [x] 15.4 Agent nodes: OpenAI-compatible `/chat/completions`; LLM config per user (multi-LLM); per-agent selection in builder
- [x] 15.5 Response node: insert into `answers`; update question `status` to `answered`
- [x] 15.6 Error handling and logging: `[workflow]` logs (start, flows, each agent call, answer posted, finish); errors logged in API catch; service role key check with clear error

**Env:** `SUPABASE_SERVICE_ROLE_KEY` required (workflow uses service role client). See `.env.example` / `.env.local.example`.

**Files:** `src/lib/workflow/run.ts`, `src/app/api/questions/route.ts`, `src/app/api/webhooks/question-created/route.ts`, `src/lib/supabase/server.ts`

---

### Task: LLM Connection (Multi-LLM)
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Users define multiple LLM configs (name, api_base_url, api_key); each agent selects one in the flow builder; workflow uses selected config for that agent’s nodes

**Done:** Table `llm_configs` (id, user_id, name, api_base_url, api_key). API: GET/POST `/api/llm-config`, GET/PATCH/DELETE `/api/llm-config/[id]`. Dashboard: list, add, edit, delete LLM configs. Builder: agent config panel has “LLM for this agent” dropdown; stored in `node.data.llm_config_id`. Workflow loads config by id (ownership checked); fallback to first config for user.

**Files:** `supabase/migrations/004_llm_configs_multi.sql`, `src/app/api/llm-config/*`, dashboard LLM section, builder agent config

---

### Task: Agent Run Logs (Debug)
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Table and UI to debug agent runs: each LLM call and errors are stored and visible

**Done:** Table `agent_run_logs` (flow_run_id, question_id, flow_id, agent_id, node_id, status, model, system_prompt, user_content, response_content, error_message, created_at). Workflow inserts one row per agent node (success or error). API: GET `/api/agent-runs?question_id=&agent_id=&limit=`. Dashboard: “Agent run logs” section with table (time, question link, agent, node, status), filter by agent, expand to show error/response. RLS: users see only logs for their agents.

**Files:** `supabase/migrations/005_agent_run_logs.sql`, `src/lib/workflow/run.ts`, `src/app/api/agent-runs/route.ts`, dashboard run logs section

---

### Task: Default Flow & Empty Flow Fix
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** New flows get default trigger→agent→response graph; opening builder with empty flow auto-saves default so workflow can run

**Done:** POST `/api/agents/[id]/flows` with empty nodes/edges inserts default nodes and edges. Flow Builder: on load, if flow has no nodes/edges, PATCH flow with default graph so DB is runnable without manual Save.

**Files:** `src/app/api/agents/[id]/flows/route.ts`, `src/app/dashboard/agents/builder/[agentId]/page.tsx`

---

### Task 17: Deployment & Environment Setup
**Status:** Pending
**Description:** Configure deployment and environment variables

**Subtasks:**
- [ ] 17.1 Setup environment variables documentation (partial: .env.example has SUPABASE_SERVICE_ROLE_KEY)
- [ ] 17.2 Configure production build
- [ ] 17.3 Add deployment scripts
- [ ] 17.4 Setup CI/CD if needed

---

### Task 19: Multilingual Support (i18n)
**Status:** Completed ✅
**Date Completed:** 2026-02-15
**Description:** Add internationalization support for multiple languages while keeping Persian as default

**Subtasks:**
- [x] 19.1 Setup i18n library (custom implementation)
- [x] 19.2 Create translation files for Persian (fa) - default
- [x] 19.3 Create translation files for English (en)
- [x] 19.4 Create language switcher component
- [x] 19.5 Add language detection based on user preference
- [x] 19.6 Update layout to support dynamic direction (RTL/LTR)
- [x] 19.7 Add font switching for different languages
- [x] 19.8 Store user language preference in database

**Implementation Details:**
- Created custom i18n context with React Context API
- Dynamic layout with RTL/LTR support
- Vazir font for Persian, sans-serif for English
- Database integration with user_preferences table
- localStorage fallback for non-authenticated users
- Comprehensive translations for all features

**Files Modified/Created:**
- `src/app/ClientLayout.tsx` (created)
- `src/contexts/I18nContext.tsx` (enhanced)
- `src/components/LanguageSwitcher.tsx` (fixed)
- `src/components/auth/AuthButton.tsx` (translated)
- `src/messages/fa.json` (expanded)
- `src/messages/en.json` (expanded)
- `supabase/migrations/add_user_preferences.sql` (created)
- `docs/i18n-implementation.md` (created)

---

### Task 11: User Authentication
**Status:** Completed ✅
**Description:** Implement user authentication with Supabase Auth

**Subtasks:**
- [x] 11.1 Create auth context and hooks
- [x] 11.2 Create login page (`/login`)
- [x] 11.3 Create register page (`/register`)
- [x] 11.4 Auth-based redirects (e.g. dashboard protected)
- [x] 11.5 Logout (user menu dropdown with logout)
- [x] 11.6 Persian/English translations for auth UI
- [x] Logged-in UI: username, avatar/initials, dropdown with email and logout; dashboard link only when authenticated
