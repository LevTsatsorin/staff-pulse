---
name: code-style
description: Code conventions for the Staff Pulse repo (React 19 + Vite + TypeScript strict + styled-components + TanStack Query + zod 4, Biome, Vitest, node:http mock server). Use this skill before writing or reviewing ANY code in this repo — components, hooks, providers, utils, tests, server, configs — even for a one-line edit, so file layout, naming, exports, styling, validation and test style stay consistent with the rest of the project.
---

# Staff Pulse code style

Conventions for this repo: a single-page dashboard
with a mock server. Follow them as written; where two options existed the choice is already made.

## 1. Structure: top level by artifact type, second level by domain

```
src/
  api/            fetch client, per-endpoint request functions, queryClient
  components/
    common/       Spinner, Skeleton, EmptyState, ErrorState, ErrorBoundary — no domain knowledge
    layout/       Header, DashboardLayout, ConnectionBadge
    orgTree/      OrgTree, OrgTreeNode, PerformanceIndicator
    orgTable/     OrgTable, OrgTableRow, OrgTableToolbar
  hooks/
    common/       useDebouncedValue, useMediaQuery, useRovingRows
    orgTree/      useOrgTree, useRevealNode
    orgTable/     useTableRows, useSortState
    live/         useOrgLiveUpdates
  providers/      React Context, 4 files each (see §4)
  pages/          DashboardPage.tsx — composition only, no business logic
  utils/          pure functions + colocated tests (tree/, table/, format/)
  types/          cross-domain types: orgModel.ts, sort.ts, helpers.ts
  constants/      api.ts, cache.ts, ui.ts — literals, defaults, timings
  styles/         GlobalStyle.ts, theme.ts, styled.d.ts, mixins.ts
  errors/         ApiError.ts, ApiValidationError.ts, OrgDataError.ts
  config.ts       the ONLY place that reads import.meta.env
  App.tsx  main.tsx  vite-env.d.ts
server/           mock API; imports from shared/ only
shared/           zod schemas + types + API paths shared by client and server
docs/             architecture.md, data-model.md, adr/NNN-name.md
```

- Logic lives in hooks and pure utils, markup in components, pages only compose providers + components.
- A util is a pure function: no React, no fetch. Only utils get unit tests.
- Providers are a separate folder, not a sibling of the component that uses them.
- Barrels (`index.ts` with `export * from`) only at domain level (`components/orgTree/index.ts`,
  `hooks/common/index.ts`). No one-line barrels per component folder.

## 2. Naming

| Artifact | Rule | Example |
|---|---|---|
| Component | folder `PascalCase/` + `PascalCase.tsx`; `types.ts`, `constants.ts`, `styles.ts` inside when they grow | `components/orgTable/OrgTable/OrgTable.tsx` |
| Nested component | `components/` inside the parent folder | `OrgTable/components/SortableHeader/` |
| Domain folder | `camelCase` | `hooks/orgTree/` |
| Hook | `useXxx.ts`, one hook per file, reads like a sentence | `useOrgTree.ts`, `useTableRows.ts` |
| Provider | `XxxContext.tsx`, `XxxProvider.tsx`, `types.ts`, `index.ts` | `providers/SelectionProvider/` |
| Util | `camelCase.ts`, a big one gets its own file named after the function | `utils/tree/applyPatch.ts` |
| Test | `*.test.ts` next to the source (Vitest) | `applyPatch.test.ts` |
| Page | `XxxPage.tsx` in `pages/xxx/` | `pages/dashboard/DashboardPage.tsx` |

Identifiers:
- Components and types `PascalCase`; props `<Component>Props`; generics prefixed `T` (`TRecord`, `TKey`).
- Module constants `SCREAMING_SNAKE_CASE` (`STALE_TIME_MS`, `DEBOUNCE_MS`).
- Handlers: `handleXxx` inside a component, `onXxx` in props.
- Booleans `isXxx` / `hasXxx` / `shouldXxx`.
- `type` for data objects, `interface` for component props. Do not mix.

## 3. Component file canon

```tsx
import React from 'react';
import styled from 'styled-components';

import type { OrgNode } from 'src/types/orgModel';

interface OrgTreeNodeProps {
  node: OrgNode;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export const OrgTreeNode: React.FC<OrgTreeNodeProps> = ({ node, onSelect, isSelected = false }) => {
  const handleClick = () => onSelect?.(node.id);
  return <Row $selected={isSelected} onClick={handleClick}>{node.name}</Row>;
};

const Row = styled.li<{ $selected: boolean }>`
  background: ${({ $selected, theme }) => ($selected ? theme.colors.selection : 'transparent')};
`;
```

- Named exports everywhere. No `export default` (Vite entry and config files excepted).
- Prop defaults in destructuring, never `defaultProps`.
- Helpers that do not need props or state live outside the component: no re-creation per render,
  no `useCallback` needed.
- Styled components and small helpers go BELOW the component. Shared styles → `styles.ts` next to it.
- Transient props (`$tone`, `$selected`) so nothing leaks into the DOM. Dynamic props take a
  FINITE set of values (`'low' | 'mid' | 'high'`), never numbers, ids or timestamps: every distinct
  value generates a new CSS class.
- `React.memo` only for list rows that re-render on every patch (`OrgTableRow`, `OrgTreeNode`), and
  only after the props are stable by construction.
- Keys are always `node.id`, never the array index.
- Clickable things are `<button>` or a row with `tabIndex` + keyboard handling, never a bare `<li onClick>`.

## 4. Context: four files per provider

```
providers/SelectionProvider/
  SelectionContext.tsx   createContext + DEFAULT_SELECTION_CONTEXT_VALUE (full object, no-op fns)
  SelectionProvider.tsx  state + useMemo(contextValue) + <SelectionContext value={...}>
  types.ts               SelectionContextValue, SelectionProviderProps
  index.ts               export * from './SelectionContext'; export * from './SelectionProvider';
```

- Default value is a complete typed object, not `undefined`: no `if (!ctx) throw`.
- `contextValue` always in `useMemo` with an honest dependency list.
- The consumer hook lives in `hooks/`, not in `providers/`: `hooks/common/useSelection.ts` =
  `React.use(SelectionContext)` (React 19: `use`, not `useContext`).
- Keep server data OUT of context. TanStack Query cache is the single source of truth for data;
  context holds UI state only (selection, expanded ids, view mode).

## 5. Hooks and data

- Query hooks return a flat object `{ data, status, error, refetch, isFetching }` and nothing else.
- Derived data goes through `useMemo` with explicit deps; API → view-model mapping happens once in a
  hook, components receive ready rows.
- Query keys and variables are computed in `useMemo` (or a dedicated `useXxxQueryVariables`) so
  the cache key is stable across renders.
- Render previous data while refetching (`placeholderData: keepPreviousData` or TanStack default
  behaviour with `staleTime`), never a spinner over existing content.
- A hook longer than ~80 lines or with 8+ deps in one `useMemo` gets split: variables hook +
  data hook + pure mapper.
- No `// biome-ignore ... useExhaustiveDependencies`. If a dep is unwanted, move the function out
  of the component or hold it in a ref.

## 6. Types and constants

- `import type` for types. Shared helpers in `types/helpers.ts` (`ValueOf<T> = T[keyof T]`);
  add a helper when the first caller needs it, not in advance.
- `satisfies` to keep literal inference: `} satisfies SortState;`, `as const satisfies …`.
- No `enum`. Literal unions from `as const` objects:
  ```ts
  export const SortDirection = { Asc: 'asc', Desc: 'desc' } as const;
  export type SortDirection = ValueOf<typeof SortDirection>;
  ```
- Magic numbers go to `constants/` with a name: `STALE_TIME_MS = 5_000`, `SEARCH_DEBOUNCE_MS = 250`,
  `RECONNECT_BASE_DELAY_MS`, `PERFORMANCE_THRESHOLDS`.
- API paths in `shared/api.ts`, used by both client and server, so strings never drift.
- Locale for formatting (`'ru-RU'`) is a constant in `constants/ui.ts`; `Intl.NumberFormat` is
  created once at module level, never per cell.

## 7. Validation and errors (zod 4)

- Schema names end with `Schema`: `orgNodeSchema`, `orgTreeResponseSchema`, `livePatchSchema`.
- Bind to TS type without losing inference: `) satisfies z.ZodType<OrgNodeDto>;`.
- Use v4 top-level helpers: `z.iso.datetime()`, `z.uuid()`, `z.int()`.
- Cross-field rules via `.refine` (one) / `.superRefine` + `ctx.addIssue` (several).
- Parse with `safeParse` and throw a domain error; never `parse` inside render.
- Own error classes in `errors/` with a `code` in `cause`; one `toUserMessage(error)` util maps any
  error (network, HTTP status, validation, data integrity) to a Russian user-facing string.
- `AbortError` is not an error: never show it in `ErrorState`.

## 8. Styling (styled-components 6)

- Design tokens are CSS custom properties declared in `createGlobalStyle` (light + dark via
  `prefers-color-scheme`); `theme.ts` references them (`colors.textMuted: 'var(--color-text-muted)'`),
  `styled.d.ts` types `DefaultTheme`.
- Reusable fragments are `css` mixins in `styles/mixins.ts` (focus ring, tabular numbers,
  reduced-motion guard).
- No `style={}` anywhere in `src/` (assignment rule). Dynamic state → transient prop or `data-*`
  attribute with a finite set of values.
- Animations: CSS `@keyframes` and `transition`, restarted by React `key` changes, not JS timers.
- Loading placeholders mirror the real layout (row height, columns, badges) and use the `skeletonFill`
  mixin; a generic stack of grey bars is not a skeleton.
- `@media (prefers-reduced-motion: reduce)` disables transitions and animations globally.
- Any grid or flex item that contains a scroll container needs `min-width: 0` AND `min-height: 0`
  (grid tracks: `minmax(0, 1fr)`). The default `min-width: auto` stops the item from shrinking
  below its content, so inner `overflow: auto` never kicks in and the content overflows the layout.

## 9. Tooling

### tsconfig — one base, thin project configs
`tsconfig.base.json` holds the strict set and aliases once: `target ES2023`, `strict`,
`noImplicitOverride`, `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch`, `isolatedModules`,
`verbatimModuleSyntax`, `noEmit`, `skipLibCheck`, `paths: { "src/*", "shared/*" }`.
`tsconfig.json` (solution root), `tsconfig.app.json`, `tsconfig.node.json`, `tsconfig.server.json` extend it
and add only what differs (lib, module resolution, jsx, types). The root extends the base too, so tools
that read only `tsconfig.json` (graphify, editors) resolve the aliases.
Vite and Vitest read the aliases from tsconfig via `resolve.tsconfigPaths: true`; never repeat them in
`vite.config.ts`. Aliases resolve only in files a tsconfig includes (`src/`, `shared/`): a throwaway script
at the repo root must use relative imports or live under `src/`.
Server: `module NodeNext`, `erasableSyntaxOnly`, `types: ["node"]`, `allowImportingTsExtensions`, and
`paths: {}` so typecheck rejects `src/*` imports that Node could not resolve at runtime.

### Biome — one tool for lint + format
`lineWidth 100`, single quotes in TS, double in JSX, semicolons always, trailing commas all,
`arrowParentheses asNeeded`. `.editorconfig`: 2 spaces, LF, UTF-8, final newline.
Rules worth enabling: `noExplicitAny warn`, `noConsole error` (override off for `server/`),
`noUnusedImports error`, `useExhaustiveDependencies warn`, `noAccumulatingSpread warn`,
`noEnum warn`, `useNodejsImportProtocol error`, `useExhaustiveSwitchCases error`.

### Import order (blank line between groups)
```
node:*  →  react  →  external packages  →  src/* aliases  →  shared/*  →  ../  →  ./
```

### package.json
Scripts: `dev` (client + server), `dev:client`, `dev:server`, `build`, `start` (preview),
`typecheck`, `test`, `lint`, `lint:fix`, `prepare` (sets `core.hooksPath .git-hooks`).
Exact versions, no `^`. `engines.node` and `packageManager` pinned.
Client libraries are `devDependencies` (bundled by Vite); `dependencies` hold only what the server
image needs at runtime (`ws`, `zod`, `@anthropic-ai/sdk`).

### Env
`src/config.ts` is the only reader of `import.meta.env`; `vite-env.d.ts` types `ImportMetaEnv`.
The client calls relative `/api` and `/ws`, so it needs no env at all. `.env.example` documents
server variables (`PORT`, `MOCK_SCENARIO`, `PATCH_INTERVAL_MS`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`).

### Growth and duplication checks
- `graphify update .` refreshes the code-only knowledge graph in `graphify-out/` (gitignored, AST only,
  no LLM). `.graphifyignore` keeps docs and planning files out. Read `graphify-out/GRAPH_REPORT.md`:
  import cycles must stay «None», new god nodes and cross-community edges deserve a look.
- `npx -y jscpd@4 src server shared --min-tokens 25 --min-lines 4 --reporters console` finds copy-paste.
  Clones in production code are findings; repeated arrange blocks in tests are acceptable.

## 10. Tests (Vitest)

- `*.test.ts` next to the source. Only pure functions: aggregation, patch application, sorting,
  filtering, formatting, tone thresholds. No component tests unless asked.
- `describe('functionName')` → `it('should …')`, arrange / act / assert separated by blank lines.
- Name cases by behaviour and include edge cases: empty input, single element, zero headcount
  (weighted average division by zero), orphan `parentId`, cyclic `parentId`, duplicate `id`.
- The strongest test for incremental logic is equivalence: apply N random patches incrementally
  and compare with a full rebuild from scratch.

## 11. Git and docs

- Conventional Commits with optional scope, English subject: `feat: step 01 — scaffold, mock API, tree`,
  `fix(server): …`, `chore: …`, `docs: …`. Types limited to feat / fix / chore / docs / refactor.
- One commit per assignment stage, tagged `step/1` … `step/4`. The author commits, never the AI.
  Tags are lightweight, so `git push --follow-tags` does NOT push them: always `git push origin step/N`.
- No `--no-verify`.
- ADR files `docs/adr/NNN-название.md` with fixed sections: Контекст / Решение / Альтернативы / Последствия.

## 12. Anti-patterns to avoid

- `if (isLoading || !data) return <Spinner />` — an error becomes an infinite spinner. Branch on
  `status` explicitly: pending / error / success, plus separate "empty response" and "filter found nothing".
- Sort direction that depends on column type or lives in global state. One pure
  `sortRows(rows, { key, direction })` with a comparator per column, state local to the table.
- Color derived from ids or a 30-case switch. Tone is derived from the value through thresholds.
- Two "tables" made of independent grids aligned by hard-coded widths. Use a real `<table>`.
- `mutate()` / full refetch after a live patch. Patches are applied to the cache directly.
- Barrel per folder, `@deprecated` re-exports, two validation libraries, `any` in public types,
  `eslint-disable`-style suppressions.
