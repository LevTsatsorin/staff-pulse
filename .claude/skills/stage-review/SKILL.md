---
name: stage-review
description: Acceptance review of a finished Staff Pulse stage (step-1 … step-4) before the author commits and tags it. Use whenever the user asks to review, check, audit or accept a stage, an openspec change, the current diff, or says «ревью этапа», «проверь этап», «можно коммитить?». Runs the verification commands, checks the openspec tasks and specs against the working tree, reviews the code for over-engineering and convention drift, and reports findings only — it never edits code.
---

# Stage review

Goal: catch what the hiring reviewer would catch, before the commit exists. Output is a findings
list; fixes are a separate request. Load `code-style` and `assignment-tradeoffs` first; they are
the rulebook this review enforces.

## 1. Mechanical gate (run, do not reason about)

```bash
pnpm typecheck && pnpm lint && pnpm test --run && pnpm build
grep -rn "style=" src/                 # must be empty (assignment: no inline CSS)
grep -rn "export default" src/ server/ shared/   # only vite/config entry files allowed
git status --short                     # staff_pulse_*.md and notes/ must NOT appear
openspec status --change <step-N-…>    # every task ticked
```

Any red line here is a blocking finding. Record the gzip sizes from `pnpm build`.

## 2. Spec conformance

For every `#### Scenario` in `openspec/changes/<step>/specs/**/spec.md`, state how it was verified:
unit test, manual check with `MOCK_SCENARIO=…`, DevTools observation, or **not verified**. Unverified
scenarios are findings, not footnotes. Pay attention to the ones that are easy to skip: abort on
unmount, no refetch within stale time, StrictMode single connection, reduced motion, keyboard flow.

## 3. Code review (read the diff, then the touched files whole)

Look for, in this order of severity:
- **Correctness:** error branch that turns into an infinite loader; keys by index; aggregates
  recomputed on filter/sort; patch applied twice; `dblclick` handled without idempotent `click`;
  focus stored by index; `Map` inside the query cache; `AbortError` shown as an error.
- **Assignment rules:** inline `style`, UI library sneaking in, comments narrating obvious code,
  `import.meta.env` outside `config.ts`, `^` in versions.
- **Over-engineering:** interface with one implementation, provider holding server data, barrel per
  folder, config for constants that never change, helper reimplementing stdlib/Intl, abstractions
  "for later". Suggest the deletion.
- **Conventions:** file placement, naming, named exports, styles below the component, transient
  props with finite values, tests only on pure functions, import order.
- **Accessibility:** `role="tree"` / `treeitem` / `aria-expanded`, `aria-sort`, focus ring visible,
  `inert` on collapsed content, text next to colour.

## 4. Deliverables for this stage

Check the stage's tasks group «Docs»: README sections, `docs/*.md`, ADR files with the four
sections (Контекст / Решение / Альтернативы / Последствия), `notes/ai-log.md` entry with concrete
«что сгенерировано / что переписано / почему». Vague log entries are a finding.

## Output format

```
## Ревью <step-N> — <blocking count> блокирующих, <n> замечаний
### Блокирующие
- path:line — проблема. Что сделать.
### Замечания
- path:line — проблема. Что сделать.
### Не проверено
- <scenario> — как проверить.
### Готово к коммиту: да / нет
Коммит: `<conventional message>` · тег `step/N`
```

One line per finding, no praise, no restating what is fine. If nothing is found in a section, drop
the section.
