# Open Cons - Project Summary

## Project Overview

**Open Cons** is a smart Q&A platform where users can ask questions and agents created by users (using ReactFlow) answer them.

### Core Features

1. **Questions Page** (`/questions`)
   - Similar to StackOverflow or Reddit (placeholder in place)
   - Planned: question submission, list, agent answers, realtime display

2. **Agent Builder Dashboard** (`/dashboard`)
   - Protected: only logged-in users can access; others redirect to `/login`
   - Using ReactFlow (to be implemented)
   - Three main node types: Trigger, Agent, Response

3. **Authentication**
   - Supabase Auth with login (`/login`) and register (`/register`)
   - Auth context and session management
   - Logged-in UI: username, avatar (or initials), dropdown with email and logout
   - Dashboard link in header only when authenticated; logout redirects to home

4. **Internationalization (i18n)**
   - Persian (fa) default, English (en)
   - Dynamic RTL/LTR and font switching (Vazir for Persian, system sans-serif for English)
   - Language switcher in header; preference stored in DB for logged-in users, localStorage for guests

5. **Architecture**
   - No direct database access from frontend
   - Next.js API Routes (planned for CRUD)
   - Supabase Realtime for live updates (planned)

### Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, dark neon theme
- **Database:** Supabase (PostgreSQL + Realtime)
- **Auth:** Supabase Auth
- **Agent Builder:** ReactFlow (@xyflow/react)
- **Font:** Vazir (local WOFF2); variable on `html`, `.font-vazir` utility
- **Direction:** RTL (fa) / LTR (en) via i18n
- **UI Languages:** Persian, English

### Routes

| Path        | Description                    | Auth        |
|------------|--------------------------------|-------------|
| `/`        | Home, hero, links              | Public      |
| `/login`   | Login form                     | Public      |
| `/register`| Register (username, email, pw) | Public      |
| `/questions`| Q&A list (placeholder)        | Public      |
| `/dashboard`| Agent dashboard                | Logged-in   |
| 404        | Custom not-found               | —           |

### Project Structure (Key)

- `src/app/` – Layout, ClientLayout, pages (page.tsx per route), globals.css
- `src/components/` – Header, LanguageSwitcher, auth/AuthButton
- `src/contexts/` – AuthContext, I18nContext
- `src/fonts/` – vazir.ts, Vazir-*.woff2
- `src/lib/supabase/` – client, server
- `src/messages/` – fa.json, en.json
- `supabase/migrations/` – initial schema, add_user_preferences

### Color Palette (Theme)

- neon-purple, neon-pink, neon-blue
- dark-900, dark-800, dark-700

---

*Last updated: 2026-02-15*
