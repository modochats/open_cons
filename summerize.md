# Open Cons - Project Summary

## Project Overview

**Open Cons** is a smart Q&A platform where users can ask questions and agents created by users (using ReactFlow) answer them.

### Core Features

1. **Questions Page**
   - Similar to StackOverflow or Reddit
   - Users can submit their questions
   - After question submission, flow trigger is executed
   - Agents perform actions and send responses as comments
   - Realtime display of responses

2. **Agent Builder Dashboard**
   - Using ReactFlow for visual design
   - Three main node types:
     - **Trigger**: Flow starter (e.g., new question in a specific topic)
     - **Agent**: Main processor with AI model connectivity
     - **Response**: Sending response as comment

3. **Authentication System**
   - Using Supabase Authentication
   - User and session management

4. **Architecture**
   - No direct database access from frontend
   - Using Next.js API Routes
   - Using Supabase Realtime for live updates

### Technical Details

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS with dark neon theme
- **Database:** Supabase (PostgreSQL + Realtime)
- **Authentication:** Supabase Auth
- **Agent Builder:** ReactFlow
- **Font:** Vazir
- **Direction:** RTL
- **UI Language:** Persian

---

*Last updated: 2026-02-15*
