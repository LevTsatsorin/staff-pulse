---
name: assignment-tradeoffs
description: Decisions, interpretations of ambiguous requirements and known pitfalls for the Staff Pulse assignment — cache layer, aggregation model, WebSocket patch flow, tree/table UX semantics (expand defaults, sorting by click/double-click, filter, keyboard navigation, fade animation), styling constraints, docker/nginx, AI search fallback. Load this whenever implementing or changing ANY feature of this dashboard, writing docs/ADRs/README for it, or when unsure how a requirement should be read. Do not re-decide what is written here; update this file when a decision changes.
---

# Staff Pulse: decisions and trade-offs

The assignment leaves several things "на усмотрение". Every choice below is final unless the author
changes it; the README section «Интерпретации» must list the items marked (README).

## 1. Interpretations of the assignment

| Topic | Decision | Why |
|---|---|---|
| «Второй уровень открыт по умолчанию» (README) | Root nodes (divisions) are expanded, so two levels are visible; departments stay collapsed. Constant `DEFAULT_EXPANDED_DEPTH = 0` (expand nodes with depth ≤ 0). | Shows the structure without dumping all 52 nodes; one constant flips it. |
| `headcount` / `performance` in the tree node (README) | Subtree totals: aggregated headcount and headcount-weighted average performance. Own values in the row `title` tooltip. | Own values on a parent read as wrong numbers («дивизион — 5 чел.» above a team of 15); a hierarchy is read top-down as sums. Aggregates therefore exist from step 1. |
| Sorting: click vs double click (README) | Click on another column → that column with its default direction. Click on the active column → no-op. Double click → reverse direction. Keyboard: Enter/Space on the active header reverses. | `dblclick` always arrives after two `click` events, so click must be idempotent. |
| Default sort direction (README) | Ascending for every column. Click on a new column = asc, double click reverses, so a double click on an inactive column always ends desc. | Per-type defaults (text asc, numbers desc) were tried and rejected by the author: switching columns and double clicking gave different results per column. |
| Default table order (README) | No active sort: tree pre-order (division, its departments, their teams). Every sort breaks ties by tree order. | Mirrors the tree on first view; stable order keeps hierarchy readable. |
| Filter vs aggregates (README) | Filter only hides rows; aggregates are never recomputed from filtered data. | Aggregates describe the org, not the view. |
| Patch contract (README) | A patch changes only `headcount`, `budget`, `performance` (+ `updatedAt`). No `parentId` or `name` changes. | One ancestor chain to recompute; no cycle checks on the hot path. |
| Level column | Number 1/2/3 plus label Дивизион / Отдел / Команда. Depth is computed from the data, not from names. | Data may have more levels; label is cosmetic. |
| Average performance with total headcount 0 | `null` → rendered as «—», always sorted last in either direction. | Weighted average is undefined. |
| Layout | Split view (tree + table) at ≥1280px AND a segmented toggle Дерево / Таблица below that width. Pure CSS: both panels always mounted, a `width < 1280px` media query hides the inactive one by `data-view`; no `useMediaQuery`. | Covers both readings; no resize subscription; state survives switching. |
| Failed background refetch (README) | Keep last data on screen, header says «не удалось обновить». Error screen only when there is no data at all. | TanStack keeps `data` on refetch error; replacing the dashboard with an error would lose context. |
| Multiple roots | Allowed (forest). Mock data has 4 divisions. | Real org trees have several top-level units. |
| Live transport | WebSocket. | The deliverables list names a "WebSocket patch contract". |
| Cache layer | TanStack Query v5, not a hand-written cache. | "stale time" is literally its API; abort via `signal`; `structuralSharing` gives "invalidate only on real change". Own cache = 100+ lines of races. → ADR-001 |
| Height animation without inline CSS | `display: grid; grid-template-rows: 0fr → 1fr; transition` on the wrapper, inner `overflow: hidden; min-height: 0`. Collapsed content gets `inert`. | Measuring `scrollHeight` and setting `style.height` is inline CSS by another name. → ADR-004 |
| AI search provider and model | OpenAI Responses API with structured outputs, `OPENAI_MODEL` env (default `gpt-5.6-terra`, final pick by measuring luna/terra/sol on 15–20 queries), `reasoning.effort: "low"`, 5 s timeout. Server-side call only. | Author's call: paid OpenAI access, no Anthropic key; the assignment names no provider. One module owns the provider call. Reviewer likely runs without a key, so the fallback must look intentional. |

## 2. Architecture decisions

### Data model lives in the query cache, already aggregated
`queryFn` = fetch → zod validate → `buildOrgModel(dtos)` → `OrgModel`. The cache never holds the raw
array. Shape (plain objects only, `structuralSharing` does not understand `Map`):

```ts
type OrgModel = {
  nodes: Record<string, OrgNode>;          // OrgNode = dto + depth
  childrenIds: Record<string, string[]>;
  rootIds: string[];
  aggregates: Record<string, Aggregate>;   // { totalHeadcount, totalBudget, perfWeightedSum, avgPerformance: number | null }
  version: number;                         // from ETag of the snapshot / last applied patch
};
```

- `aggregate` = own values + Σ children aggregates; `avgPerformance = perfWeightedSum / totalHeadcount`
  or `null`. Computed once in `buildOrgModel` (`utils/tree/aggregate.ts`, since step 1: the tree shows totals).
- `applyPatch(model, changes)` copies only the changed nodes and their ancestor chain, recomputing
  each ancestor **from its direct children** (no `+= delta`, floats drift). Untouched references are
  preserved so memoized rows skip re-render. → ADR-002
- Integrity checks in `buildOrgModel`: duplicate id, orphan parentId, cycle → `OrgDataError` → ErrorState.
- Equivalence test: 1000 random patches applied incrementally must equal a full rebuild.

### Versions, ETag, WebSocket
- Server keeps `version` (monotonic). `GET /api/org-tree` sends `ETag: "<version>"`,
  `Cache-Control: no-cache`, answers 304 to a matching `If-None-Match`.
- WS on connect: `{ type: 'hello', version }`. Any mismatch with `model.version` (newer: missed patches, older: restarted server) → one refetch; equal → no request.
- Patch: `{ type: 'patch', version, changes: [{ id, fields: { headcount?, budget?, performance? }, updatedAt }] }`.
  Validated by the same zod discipline as REST. `version <= model.version` → ignore;
  `version === model.version + 1` → `setQueryData(applyPatch)`; gap or unknown id → one `invalidateQueries`.
- Refetch goes through `invalidateQueries(..., { cancelRefetch: false })` so bursts of gaps do not restart an in-flight snapshot. Decisions live in the pure `resolveLiveMessage`. Server scenarios `empty|error|invalid` run no ticker.
- Backoff: `min(30_000, 1_000 · 2^attempt) · random(0.5…1)`; reset attempt on `open`; `online` event
  reconnects immediately. Status: `connecting | live | reconnecting (in N s) | offline`.
- StrictMode mounts effects twice: cleanup closes the socket, clears the timer, sets `disposed` so a
  late `onclose` never schedules a reconnect. Otherwise dev applies every patch twice.

### Fade of updated cells (~1.5 s)
- `FlashValue` keeps `{ value, generation }` in state and bumps the generation during render when the value
  really changes; the generation is the `key` of the inner `<span>`, so only changed cells remount and replay
  the CSS `@keyframes`. First mounts (initial load, expand, filter) stay at generation 0 and never flash.
  No `snapshotVersion`, no timers. Rejected: toggling an animation class by model version, which would
  start the animation on every existing cell at the first patch.
- Reduced motion: the flash holds for 1.5 s with `steps(1, end)` instead of fading.

### Re-render budget on patches
- `applyPatch` keeps references of untouched nodes/aggregates; `OrgTableRow` memo compares row fields
  (`isSameRow`); `useRevealNode` returns a stable callback (model read from a ref, parentId never changes).

### Table
- Real `<table>`, `<th aria-sort>` with a `<button>` inside, sticky header, numeric columns right
  aligned with `font-variant-numeric: tabular-nums`, `user-select: none` on headers (double click).
- Name cell shows the parent path in muted small text («Коммерция · Продажи») because a flat sorted
  table loses hierarchy. Match is highlighted with `<mark>`.
- Filter: controlled input, `useDebouncedValue(value, 250)`, compare with `toLocaleLowerCase('ru')`.
- Sorting logic is the pure `getNextSort(prev, key, 'click' | 'reverse')`. Keyboard activation of the header button is a click with `event.detail === 0` → treated as `reverse`.
- Clearing the filter bypasses the debounce (`appliedQuery = query.trim() ? debounced : ''`).
- Keyboard: roving tabindex, one tab stop; ↑/↓, Home/End move the active row, Enter selects.
  Active row is stored by **id**, not index; if it disappears (filter), fall back to the first row.
- Budget: `new Intl.NumberFormat('ru-RU')` once per module + ` руб.`; the group separator is a
  non-breaking space (U+00A0) — assert that in the test, it also prevents line wrapping.
- Sorting a column that a patch changes moves the row; focus stays on the id, so keyboard nav survives.

### Tree
- Nested `<ul role="tree">` / `<li role="treeitem" aria-expanded aria-level aria-selected>`; indentation
  comes from nesting, no `$depth` prop, no padding math.
- Expanded state is a `Set<id>` held in `SelectionProvider` together with `selectedId`, so it survives
  patches, filter, view toggle. Only the chevron `<button>` toggles; clicking the label selects.
- Selecting from the table expands all ancestors and `scrollIntoView({ block: 'nearest' })`
  (`behavior: 'smooth'` only without reduced motion). Selection is bidirectional.
- Indent guides: each `ul[role=group]` paints a tinted band + line under the parent's chevron column, color per nesting
  level via CSS custom properties set by nesting selectors in `OrgTree` (indent-rainbow style, no depth prop).
- Branches animate via `Collapsible` (grid rows 0fr -> 1fr, children always mounted, collapsed part `inert`);
  scroll to a revealed node waits `EXPAND_ANIMATION_MS`.
- Tree keyboard (WAI-ARIA tree, done in step 4): `useRovingTree` + pure `getVisibleTreeIds` / `getTreeKeyAction`; one
  tab stop on `treeitem`, inner buttons `tabIndex={-1}`, Enter/Space select only when the item itself has focus so
  a focused chevron keeps its native click. `useRovingFocus` is shared with the table.
  Tree items are nested, so React `onFocus` bubbles from a child item to every ancestor item: the item handler
  must `stopPropagation()`, otherwise the ancestor overwrites the active id one step later. A new `selectedId`
  (table click or Enter) resets the active id via the adjust-state-during-render pattern.
  Safari/Firefox on macOS never focus a clicked button, so the item focuses itself on `mousedown`
  (with `preventDefault` + `stopPropagation`); otherwise arrows do nothing after a mouse click there.
- Performance indicator: `getPerformanceTone(value)` → `'low' | 'mid' | 'high'` with thresholds
  `< 50`, `< 80`, `≥ 80` in `constants/ui.ts`; number is shown next to the color and an `aria-label`
  «Эффективность 73%» exists for screen readers / colour-blind users.

### States
- Branch on `status` (pending / error / success). Loading → skeleton rows of the real row height;
  spinner only if loading exceeds ~200 ms.
- Two different empty states: API returned `[]` («Структура пуста») vs filter found nothing («Сбросить фильтр»).
- Error → `toUserMessage(error)` + «Повторить» (`refetch`). Render errors → `ErrorBoundary`.
- Background refetch: data stays, quiet «обновляется…» hint in the header.

### Mock server
- `node:http` + `ws`, no framework. Node 24 runs `server/index.ts` directly (type stripping);
  `erasableSyntaxOnly` in the server tsconfig keeps the syntax Node can strip.
- Deterministic data: seeded PRNG, 4 divisions × 3 departments × 3 teams = 52 nodes, Russian names,
  every node has its own headcount (not only leaves).
- Ticker: every 1–3 s mutate 1 random node; every ~5th tick a batch of 2–4 nodes (tests batching).
- `MOCK_SCENARIO=empty|error|slow|invalid` env reproduces client states; the client knows nothing about it.

### Deployment (step 4)
- Client image: build stage → `nginx:alpine`. `nginx.conf`: `gzip on` + `gzip_types` (js/css/json/svg),
  `try_files $uri /index.html`, `location /api` → server, `location /ws` with
  `proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";`.
- Server image: `node:24-alpine`, `pnpm install --prod` (only `dependencies`), `node server/index.ts`.
- Client uses relative `/api` and `/ws` → no client env, one image works everywhere. `.env` is for
  the server and compose only.
- Budget ≤200 KB gzip: `vite build` prints sizes; `manualChunks` vendor split; `zod/mini` if needed.

### AI search (step 4)
- `POST /api/search/parse { query }` → `openai` SDK `responses.parse` with `zodTextFormat` (the shared zod schema of the
  filter) → `{ text?, levels?, headcount?: {min?,max?}, budget?: {min?,max?}, performance?: {min?,max?}, sort?: { key, direction } }`.
- Parsing runs on Enter or the «AI-разбор» button, never per keystroke (paid call, 1.5–2.5 s); the same field keeps
  filtering by name in real time. `useAiSearch` wraps `useMutation`; per-call callbacks keep a slow old answer from
  winning. Success clears the field and moves conditions into chips; `sort` from the answer sets the table sort.
  A 503 is remembered until reload (button disabled). Ranges are inclusive; all filter keys are nullable for strict mode.
- Model: `gpt-5.6-terra` by measurement (18/18 correct, p95 2.5 s); luna is cheaper but slower, sol nears the 5 s timeout.
- Mock scenario bodies (`empty|error|invalid`) are `no-store` without ETag: they must not share cache entries with real data.
- Client validates the response with the shared zod schema, shows the parsed filter as removable chips,
  applies it on top of the same row pipeline. Any failure (no key → 503, timeout 5 s, invalid JSON)
  → silent fallback to text search + badge «AI недоступен».
- Check current OpenAI docs through Context7 before writing the server call; never print the key from `.env`.

## 3. Deliverables checklist (assignment «Что сдавать»)
- Commits `step/1`…`step/4` (author does them; `git push --tags`).
- README: one-command run (`pnpm i && pnpm dev`; `docker-compose up`), «Интерпретации», «AI в разработке»
  (from `notes/ai-log.md`), screenshots/GIF: split view, fade after a patch, reconnecting badge, all
  three empty/error states.
- Unit tests: aggregation, applyPatch equivalence, sortRows, formatMoney, getPerformanceTone.
- `docs/architecture.md` (layers, data flow API → cache → hooks → UI), `docs/data-model.md`
  (tree, aggregation algorithm, WS patch contract), `docs/adr/`:
  001 TanStack Query as cache, 002 aggregates inside the cache + incremental recompute,
  003 WebSocket over SSE/polling + resync after reconnect, 004 height animation via grid rows,
  005 AI search with graceful fallback.
