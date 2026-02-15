# Open Consultant – Project Summary

## Overview

**Open Consultant** is a Q&A platform where users ask questions and AI agents (built with ReactFlow) answer them. When a question is created, active flows with trigger `question_created` run: Trigger → Agent (LLM) → Response; answers are stored and the question status becomes `answered`.

---

## Features

### Questions
- **List** (`/questions`): All questions, create form (title, content, category) for logged-in users, link to detail.
- **Detail** (`/questions/[id]`): View question; owner can edit (title, content, category). Answers section shows each agent run (agent name, time, content).
- **API:** GET/POST `/api/questions`, GET/PATCH `/api/questions/[id]`, GET `/api/questions/[id]/answers`.

### Workflow (question_created)
- **Trigger:** POST `/api/questions` creates the question and calls `runWorkflowsForQuestion(questionId)` (fire-and-forget).
- **Flows:** Loads flows with `trigger_type=question_created` and `is_active=true`; runs each flow’s graph (trigger → agent → response).
- **Agent nodes:** Call OpenAI-compatible `/chat/completions`; prompt supports `{{question.*}}` and `{{previous_output}}`; model and system prompt from node data; LLM chosen per agent (from user’s LLM configs).
- **Response node:** Inserts into `answers`; sets question `status` to `answered`.
- **Logging:** Server logs with `[workflow]` prefix (start, flows, each agent call, answer posted, finish).
- **Env:** Requires `SUPABASE_SERVICE_ROLE_KEY` (service role client used in workflow).

### Dashboard (logged-in only)
- **Agents:** List, create agent (creates default flow with trigger→agent→response), edit name/avatar, link to Flow Builder.
- **LLM configs:** List, add, edit, delete (name, api_base_url, api_key); agents choose one in the builder.
- **Agent run logs:** Table of runs (time, question link, agent, node, status); filter by agent; expand to see error or response body. Used for debugging.

### Flow Builder (`/dashboard/agents/builder/[agentId]`)
- ReactFlow canvas: Trigger, Agent, Response nodes; add-node panel; save/load to DB.
- If loaded flow has no nodes/edges, auto-saves default graph so the flow is runnable.
- Agent config (when agent node selected): model, system prompt, drag placeholders (`{{question.*}}`, `{{previous_output}}`), “LLM for this agent” dropdown.

### Auth & i18n
- **Auth:** Supabase Auth; login/register; dashboard protected; Header shows avatar/initials, dropdown with email and logout.
- **i18n:** Persian (fa) default, English (en); RTL/LTR; Vazir for fa; language switcher; preference in DB or localStorage.

---

## Tech Stack

- **Framework:** Next.js 16, TypeScript
- **UI:** Tailwind CSS v4, dark neon theme (neon-purple, dark-800, etc.)
- **DB & Auth:** Supabase (PostgreSQL, RLS, Auth)
- **Agent builder:** ReactFlow (@xyflow/react)
- **Font:** Vazir (local WOFF2) for Persian

---

## Routes

| Path | Description | Auth |
|------|-------------|------|
| `/` | Home | Public |
| `/login`, `/register` | Auth | Public |
| `/questions` | Question list + create form | Public (create: logged-in) |
| `/questions/[id]` | Question detail + answers; edit if owner | Public |
| `/dashboard` | Agents, LLM configs, run logs | Logged-in |
| `/dashboard/agents/builder/[agentId]` | Flow Builder | Logged-in |

---

## API Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/questions` | List questions (sort, category) |
| POST | `/api/questions` | Create question, trigger workflow |
| GET | `/api/questions/[id]` | One question |
| PATCH | `/api/questions/[id]` | Update question (owner) |
| GET | `/api/questions/[id]/answers` | Answers for question (with agent name) |
| GET/POST | `/api/agents` | List / create agents |
| GET/PATCH/DELETE | `/api/agents/[id]` | One agent |
| GET/POST | `/api/agents/[id]/flows` | List / create flows (default nodes if empty) |
| GET/PATCH/DELETE | `/api/flows/[id]` | One flow |
| GET/POST | `/api/llm-config` | List / create LLM configs |
| GET/PATCH/DELETE | `/api/llm-config/[id]` | One LLM config |
| GET | `/api/agent-runs` | Run logs (query: question_id, agent_id, limit) |
| POST | `/api/webhooks/question-created` | Webhook to run workflow by question id |

---

## DB (main tables)

- **profiles** – user profile (username, display_name, avatar_url)
- **agents** – user’s agents (name, avatar_url, etc.)
- **flows** – per agent (trigger_type, is_active, nodes, edges JSONB)
- **questions** – title, content, category, status (pending|answered|closed)
- **answers** – question_id, agent_id, flow_id, content, is_ai
- **llm_configs** – user_id, name, api_base_url, api_key
- **agent_run_logs** – per LLM call (flow_run_id, question_id, flow_id, agent_id, node_id, status, model, system_prompt, user_content, response_content, error_message)

---

## Environment

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` – required for workflow (run workflows for question_created)

See `.env.example` and `.env.local.example`.

---

## Project structure (key)

- `src/app/` – pages, layout, API routes
- `src/components/` – Header, flow nodes, auth
- `src/contexts/` – AuthContext, I18nContext
- `src/lib/` – supabase (client, server), workflow/run.ts
- `src/messages/` – fa.json, en.json
- `supabase/migrations/` – schema, RLS, indexes

---

*Last updated: 2026-02-15*
