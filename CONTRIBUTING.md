# Contributing to Open Consultant

Welcome! This guide helps you understand how to contribute to the Open Consultant project.

## Getting Started

### 1. Read Project Documentation

Before starting, read these files to understand the project:

- **`summerize.md`** - Project overview, features, tech stack, and architecture
- **`document.md`** - Current tasks and their status

### 2. Select a Task

Check `document.md` for pending tasks. Tasks with status `Pending` are available to work on.

When you select a task:
- Update the task status to `In Progress`
- Add yourself as the owner if applicable

### 3. Work on Your Task

- Make your changes in a dedicated branch
- Follow the project's tech stack and conventions
- Ensure RTL and Persian language for all UI text

### 4. Push Your Changes

**Always push to the `dev` branch:**

```bash
git checkout -b your-branch-name
# make your changes
git add .
git commit -m "Description of changes"
git push origin your-branch-name
```

Then create a pull request to merge into `dev`.

## Project Conventions

- **Language:** Persian (فارسی) for all UI text
- **Direction:** RTL (right-to-left)
- **Font:** Vazir
- **No direct database access** - Use API routes in Next.js
- **Authentication:** Supabase Auth

## Need Help?

If you have questions about the project, check `summerize.md` first for architecture and design decisions.
