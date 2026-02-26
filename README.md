# Profiles

A "Total Person" psychometric assessment platform (ProfileXT clone). Measures cognitive abilities, behavioral traits, and occupational interests, then matches candidates against Performance Models for job fit prediction.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Backend:** [Hono](https://hono.dev) REST API
- **Frontend:** React 19 + Vite + Tailwind CSS + React Router
- **Database:** SQLite via [Drizzle ORM](https://orm.drizzle.team)
- **Monorepo:** Bun workspaces (`packages/core`, `packages/db`, `packages/api`, `packages/web`)

## Install

```bash
bun install
```

## Setup Database

```bash
bun run db:push    # create tables
bun run db:seed    # seed item bank, scales, sample performance models
```

## Development

```bash
# Terminal 1 — API server (port 3000)
cd packages/api && bun run src/index.ts

# Terminal 2 — Frontend dev server (port 5173, proxies /api → :3000)
cd packages/web && bun run dev
```

Open http://localhost:5173

## Taking an Assessment

1. Open the dashboard at `/`
2. Click **Start Assessment**, enter name and email
3. Answer questions one at a time:
   - **Cognitive** — multiple choice (adaptive difficulty)
   - **Behavioral** — Likert scale (1–5) and forced choice
   - **Interests** — A/B forced choice pairs
4. On completion, view your STEN profile at `/results/:id`
5. Select a Performance Model to see job match % and per-scale fit

## Project Structure

```
packages/
  core/    — Psychometric engine (IRT/CAT, STEN scoring, interview questions)
  db/      — Drizzle schema, migrations, seed data
  api/     — Hono REST API (assessments, models, matching, reports)
  web/     — React frontend (dashboard, assessment UI, results, models)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scales` | List measurement scales |
| GET | `/api/candidates` | List candidates |
| POST | `/api/candidates` | Create candidate |
| POST | `/api/assessments` | Create assessment session |
| POST | `/api/assessments/:id/start` | Start assessment |
| GET | `/api/assessments/:id/next` | Get next item (adaptive) |
| POST | `/api/assessments/:id/respond` | Submit response |
| POST | `/api/assessments/:id/complete` | Finalize & compute STEN |
| GET | `/api/scores/:assessmentId` | Get STEN scores |
| GET | `/api/performance-models` | List performance models |
| GET | `/api/performance-models/library` | Template library |
| POST | `/api/match` | Calculate job match % |
| GET | `/api/reports/selection` | Selection report (match %, per-scale data) |
| GET | `/api/reports/interview` | Interview questions for deviations |
| GET | `/api/reports/compare` | Compare multiple candidates |

## Assessment Domains

- **Cognitive** (4 scales + Learning Index composite): Verbal Skill, Verbal Reasoning, Numerical Ability, Numeric Reasoning
- **Behavioral** (9 trait scales): Energy Level, Assertiveness, Sociability, Manageability, Attitude, Decisiveness, Accommodating, Independence, Objective Judgment
- **Interests** (6 Holland-based scales): Enterprising, Financial/Administrative, People Service, Technical, Mechanical, Creative

Job Match = 40% Cognitive + 40% Behavioral + 20% Interests
