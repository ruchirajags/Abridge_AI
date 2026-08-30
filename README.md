# AbridgeAI

> **From "I have an idea" to "I know exactly what to build."**

AbridgeAI is a standalone AI-powered project planning and feasibility studio that turns rough ideas into structured, build-ready project plans — entirely in your browser, with no backend, no authentication, and no external AI calls.

---

## What is AbridgeAI?

Developers often start with an idea without knowing:

- whether it is actually feasible to build
- how much to build for an MVP
- what technology stack fits their skills and timeline
- how to structure the implementation
- what to build first

AbridgeAI answers all of these questions by running a deterministic planning pipeline on your project inputs.

---

## The Workflow

```
Rough Project Idea
        ↓
Builder Profile (GitHub Signals)
        ↓
Research & Opportunity Analysis
        ↓
Feasibility Assessment
        ↓
Architecture Direction
        ↓
Tech Stack Recommendation
        ↓
Builder Plan & Starter Scaffold
        ↓
Implementation Plan
        ↓
Complete Project Brief (exportable .md)
```

---

## Features

- **7-stage planning pipeline** — deterministic, reproducible, runs entirely in your browser
- **Feasibility scoring** — a /100 score across five weighted axes (idea clarity, stack fit, scope, time realism, builder fit) with a GO / Proceed with caution / Rethink verdict
- **Builder profile** — personalizes recommendations based on public GitHub language signals
- **Custom stack support** — enter any combination (e.g. `FastAPI + React + PostgreSQL`)
- **Architecture blueprint** — module breakdown and data-flow pattern
- **Tech stack recommendation** — matched to your comfort level and project type
- **Starter scaffold** — downloadable as a `.zip` with `PLAN.md` included
- **Markdown export** — full project brief downloadable as `.md`
- **Project history** — saved to localStorage, restorable, deletable
- **Draft autosave** — form persists across reloads
- **Light & dark themes** — respects system preference, stored across sessions
- **Accessible** — keyboard navigable, ARIA labels, reduced-motion support
- **Zero backend** — everything runs client-side

---

## Architecture

Built with React + Vite (JavaScript/JSX). Clean separation of concerns:

```
src/
├── agents/          # Planning logic (deterministic, pure functions)
│   ├── githubAgent.js
│   ├── researchAgent.js
│   ├── feasibilityAgent.js
│   ├── architectureAgent.js
│   ├── techStackAgent.js
│   ├── builderAgent.js
│   └── briefAgent.js
├── components/      # React UI components
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── ProjectForm.jsx
│   ├── Pipeline.jsx
│   ├── OutputCard.jsx
│   ├── FeasibilityCard.jsx
│   ├── BuilderCard.jsx
│   ├── BriefCard.jsx
│   └── Toast.jsx
├── services/
│   └── github.js    # Public GitHub API + fallback
├── utils/
│   ├── hash.js      # djb2 + deterministic pick
│   ├── storage.js   # localStorage (history, draft, theme)
│   ├── scaffold.js  # ZIP builder + scaffold generator
│   └── export.js    # Markdown brief builder
├── App.jsx          # Main layout + pipeline runner
├── main.jsx
└── index.css        # Full design system
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## GitHub Privacy

AbridgeAI only uses **public** GitHub information via the unauthenticated GitHub API:

```
https://api.github.com/users/{username}
https://api.github.com/users/{username}/repos?per_page=100&sort=updated
```

- No OAuth, no tokens, no private repositories, no authentication
- The API is rate-limited at 60 requests/hour/IP for unauthenticated use
- If GitHub is unavailable, rate-limited, or the username doesn't exist, the pipeline gracefully falls back to bundled sample data and labels the card accordingly
- GitHub analysis is optional — leave the username blank to skip it

---

## Local Storage

AbridgeAI uses `localStorage` for:

| Key | Purpose |
|---|---|
| `abridgeai.history.v1` | Saved project runs (up to 12) |
| `abridgeai.draft.v1` | Form draft autosave |
| `abridgeai.theme.v1` | Light/dark theme preference |

Clearing browser data for the site resets everything.

---

## Limitations

- **Deterministic planning engine** — all outputs are computed deterministically from your inputs using hashed seeding. The same inputs always produce the same outputs. No live LLM is used.
- **GitHub analysis is high-level** — language tallies from public repos give a rough signal, not a precise skill assessment. Treat the builder profile as directional, not definitive.
- **Scaffold is a starting point** — the generated starter scaffold is not production-ready software. It provides a foundation with the right file structure and entry points, but requires real implementation work.
- **Feasibility score is a planning estimate** — the /100 score is a structured heuristic, not a scientifically precise measurement. Use it to guide scoping conversations.

---

## Team

- [Suzanne Daniel Thomas](https://github.com/suzannet-menon)
- [Ruchira Rajesh Jagshettiwar](https://github.com/ruchirajags)

## License

Licensed under the [Apache License, Version 2.0](LICENSE).
