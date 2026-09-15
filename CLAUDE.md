# Staff Pulse

Org-structure dashboard (divisions → departments → teams): interactive tree, analytics table
with aggregates, live updates over WebSocket. Built as a hiring test assignment: the reviewer
reads the repo, so structure and process matter as much as the code.

The original assignment text is kept locally as `staff_pulse_assignment.md` (untracked). Read it
before planning anything. Decisions derived from it live in the project skills, not here.

## Stack
React 19 · Vite · TypeScript strict · styled-components 6 · TanStack Query 5 · zod 4 · Biome 2 ·
Vitest. Mock server: `node:http` + `ws`, executed by Node 24 directly (no transpiler). pnpm, one
package. Forbidden by the assignment: UI libraries, inline CSS, auth, DB.

## Layout
- `src/` client: `api/ components/ hooks/ providers/ pages/ utils/ types/ constants/ styles/ config.ts`
- `server/` mock API + WebSocket ticker
- `shared/` contract used by both sides: zod schemas, DTO types, API paths
- `docs/` architecture.md, data-model.md, adr/
- `openspec/` changes `step-1-foundation` … `step-4-bonus` mirror the assignment stages
- `notes/ai-log.md` local-only log of AI work; it becomes the README section «AI в разработке»

## Commands
`pnpm dev` (client + server) · `build` · `start` · `typecheck` · `test` · `lint` · `lint:fix`.
Before handing work back: `pnpm typecheck && pnpm lint && pnpm test --run && pnpm build`.

## Workflow
1. Work inside the current openspec change: `openspec status --change step-N-…`; tick tasks as they land.
2. Load `.claude/skills/code-style` before writing any code and `.claude/skills/assignment-tradeoffs`
   before touching tree, table, cache, live updates, docker or AI search. They hold the decisions;
   do not re-decide them, update them if a decision changes.
3. Model roles: implementation sessions run on Opus 5 (`/model opus`); stage acceptance and
   decision reviews run on Fable (`/model fable`) via `.claude/skills/stage-review`. Note the model
   used in each `notes/ai-log.md` entry.
4. After each chunk of work append to `notes/ai-log.md`: what was generated, what was rewritten by
   hand, why, which model. Specific and honest; vague entries are useless for the README.
5. Never commit, tag or push. The author commits: one commit per stage, tagged `step/N`, on the
   branch `step/0-plan` → merged to `main` by the author. Prepare the commit message for them.
   `staff_pulse_*.md` and `notes/` are excluded via `.git/info/exclude`; never stage them.
6. Do not reference the untracked files from committed content, and never name other projects or
   companies anywhere in the repo.

## Code rules (short form; details in the code-style skill)
- Comments only where the decision is non-obvious. No narration, no JSDoc on trivial things.
- Named exports, `React.FC<Props>`, styles below the component, transient props with finite values.
- Logic in hooks and pure utils, markup in components, pages only compose.
- Exact dependency versions, no `^`.
- UI copy, docs, README, ADRs, openspec artifacts: Russian. Code, identifiers, comments: English.
