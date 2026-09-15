## ADDED Requirements

### Requirement: Эндпоинт разбора поиска
Сервер ДОЛЖЕН отвечать на `POST /api/search/parse` структурированным фильтром (200), 400 на пустой или невалидный запрос, 503 при отсутствии ключа и 504 при таймауте модели.

#### Scenario: Пустой запрос
- **WHEN** тело `{ "query": "" }`
- **THEN** ответ 400 с JSON `{ "message": "..." }`

#### Scenario: Нет ключа
- **WHEN** переменная `ANTHROPIC_API_KEY` не задана
- **THEN** ответ 503 с JSON `{ "message": "AI search is not configured" }`
