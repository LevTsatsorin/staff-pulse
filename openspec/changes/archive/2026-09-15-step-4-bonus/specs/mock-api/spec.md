## ADDED Requirements

### Requirement: Проверка готовности
Сервер ДОЛЖЕН отвечать на `GET /api/health` статусом 200 и телом `{ "ok": true, "version": number }` без кэширования.

#### Scenario: Healthcheck контейнера
- **WHEN** compose опрашивает `/api/health`
- **THEN** ответ 200, и клиентский контейнер стартует только после первого успешного ответа

### Requirement: Эндпоинт разбора поиска
Сервер ДОЛЖЕН отвечать на `POST /api/search/parse` структурированным фильтром (200), 400 на пустой или невалидный запрос, 503 при отсутствии ключа, 504 при таймауте модели и 502 при ошибке или отказе провайдера.

#### Scenario: Пустой запрос
- **WHEN** тело `{ "query": "" }`
- **THEN** ответ 400 с JSON `{ "message": "..." }`

#### Scenario: Нет ключа
- **WHEN** переменная `OPENAI_API_KEY` не задана
- **THEN** ответ 503 с JSON `{ "message": "AI search is not configured" }`
