# EduDrop — Project Context & Repository Rules

Apply these project-wide defaults whenever working anywhere in the EduDrop repository (including docs, deployment configs, CORS origins, and portfolio/resume summaries).

## 1. Canonical Project URLs
- **Live Frontend (Production):** `https://edudrop-platform.vercel.app/`
- **GitHub Repository:** `https://github.com/BadgerSIO/edudrop-platform`
- Always use `https://edudrop-platform.vercel.app/` as the canonical live frontend URL when referencing EduDrop or configuring frontend origin checks; do not guess preview URLs or omit the live link.

## 2. Documentation & README Maintenance
- Always check whether [README.md](README.md) needs updates after modifying features, tech stack versions, routes, project structure, scripts, seed collections, or environment variables, and update [README.md](README.md) as part of the task when out of sync.

## 3. Active Stack & Subdirectory Rules
- **Frontend (`frontend/`):** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4. Follow [frontend/GEMINI.md](frontend/GEMINI.md) for design tokens, UI primitives, and Next.js 16 invariants.
- **Backend (`backend/`):** Node.js, Express, TypeScript, MongoDB & Mongoose, JWT, Zod, Sharp. Follow [backend/GEMINI.md](backend/GEMINI.md) for auth, seed normalization, and media cleanup invariants.
