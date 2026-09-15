## Why

Этап 01 FOUNDATION ТЗ: без каркаса, mock API и дерева невозможен ни один следующий этап. Закладываем структуру, на которую лягут таблица (02), live-обновления (03) и прод-сборка (04), чтобы потом ничего не переделывать.

## What Changes

- Scaffold: Vite + React 19 + TypeScript strict, абсолютные импорты `src/*` и `shared/*`, Biome, Vitest, pre-commit хук, скрипты `dev / build / typecheck / test / lint`.
- Общий контракт `shared/`: zod-схема узла и ответа `GET /api/org-tree`, пути API.
- Mock-сервер на `node:http` (Node 24 исполняет `.ts` напрямую): детерминированные 52 узла в 3 уровня, `ETag` / 304, env `MOCK_SCENARIO` для демонстрации состояний.
- Слой данных: fetch с `AbortSignal`, валидация схемой, TanStack Query со stale time 5 с, нормализация в `OrgModel` внутри `queryFn`.
- Дерево: раскрытие/скрытие, корни раскрыты по умолчанию, узел = название + headcount + индикатор performance; состояния загрузки / ошибки / пустого ответа.
- Тема styled-components на CSS-переменных (light + dark), глобальные стили, `ErrorBoundary`.
- Черновики docs: README (запуск, интерпретации), `architecture.md`, ADR-001 (кэш).

## Capabilities

### New Capabilities
- `mock-api`: контракт и поведение mock-сервера (REST-снапшот, кэш-заголовки, демо-сценарии)
- `org-data`: получение, валидация, кэширование, отмена и нормализация данных на клиенте
- `org-tree`: интерактивное дерево орг-структуры и его состояния

### Modified Capabilities
(нет — первый change проекта)

## Impact

Новый репозиторий: `package.json`, конфиги vite / ts / biome / vitest, `src/`, `server/`, `shared/`, `docs/`. Зависимости: react, react-dom, styled-components, @tanstack/react-query, zod, ws; dev: vite, @vitejs/plugin-react, typescript, @biomejs/biome, vitest, @types/*.
