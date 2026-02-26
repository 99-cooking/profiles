# Plan: ProfileXT Clone — "Profiles"
Date: 2026-02-26

## Stack
- **Runtime:** Bun
- **Backend:** Hono (lightweight, fast)
- **Frontend:** React 19 + Vite + Tailwind CSS
- **Database:** SQLite (via Drizzle ORM) — portable, no infra needed
- **Auth:** Simple session-based (admin panel)
- **Deployment:** Single `bun` process serves API + static frontend

## Architecture
```
packages/
  core/          — psychometric engine (IRT, scoring, matching)
  api/           — Hono REST API
  web/           — React frontend (assessment UI + admin dashboard)
  db/            — Drizzle schema + migrations
```

## Steps

### Phase 1: Foundation
1. Initialize monorepo with Bun workspaces
2. Set up DB schema (items, scales, assessments, responses, performance_models, candidates)
3. Build the STEN scoring engine (raw → STEN conversion with norm tables)
4. Build the IRT/CAT engine (3PL model, MLE ability estimation, adaptive item selection)

### Phase 2: Item Bank & Scales
5. Create item bank structure for all 3 domains (cognitive 77, behavioral 182, interests)
6. Implement the 9 behavioral trait scales with Likert + forced-choice scoring
7. Implement the 6 occupational interest scales (ipsative → normative conversion)
8. Implement the Distortion Scale (embedded items, loading detection, STEN thresholds)
9. Implement the Learning Index (composite of 4 cognitive scales)

### Phase 3: Assessment Flow
10. Build assessment session management (start, progress, complete)
11. Build adaptive test flow for cognitive section (CAT routing)
12. Build behavioral section flow (mixed Likert/MFC blocks)
13. Build interests section flow (forced-choice pairs)
14. Calculate final STEN profiles on completion

### Phase 4: Job Matching
15. Build Performance Model CRUD (create, edit, store target STEN ranges)
16. Implement Performance Model Library (pre-built templates)
17. Implement the distance decay Job Match algorithm (weighted 40/40/20)
18. Build Job Analysis Survey (JAS) questionnaire → model generation

### Phase 5: Reports & UI
19. Build Comprehensive Selection Report
20. Build Multiple Candidates comparison view
21. Build Multiple Positions / succession planning view
22. Build dynamic interview question generation (per STEN deviation)
23. Build Coaching Report & Team Report
24. Build candidate-facing assessment UI (clean, timed, accessible)
25. Build admin dashboard (manage models, view results, compare candidates)

### Phase 6: Validation & Polish
26. Implement Cronbach's Alpha calculation for scale reliability monitoring
27. Implement adverse impact analysis (Rule of 4/5ths)
28. Seed item bank with sample items (demonstrable, not production-validated)
29. Add sample Performance Models from O*NET categories
30. Write README with setup instructions

## Success Criteria
- [ ] Full assessment flow works end-to-end (take test → get STEN profile)
- [ ] Job Match % calculated correctly against Performance Models
- [ ] Reports generate with visual STEN mapping
- [ ] Dynamic interview questions generated for deviations
- [ ] Distortion Scale flags suspicious response patterns
- [ ] Admin can create/edit Performance Models
- [ ] CAT adapts difficulty based on responses
