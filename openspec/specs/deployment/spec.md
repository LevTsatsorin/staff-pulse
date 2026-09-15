# deployment Specification

## Purpose
Запуск приложения в production-конфигурации одной командой: контейнеры клиента и сервера, обратный прокси и ограничение размера бандла.

## Requirements

### Requirement: Запуск одной командой
`docker-compose up` ДОЛЖЕН собрать и поднять клиент и сервер; настройки (порты, интервал патчей, ключ AI) читаются из `.env`, для которого есть `.env.example`.

#### Scenario: Чистый запуск
- **WHEN** выполнено `cp .env.example .env && docker-compose up`
- **THEN** дашборд открывается на порту из `.env`, данные загружены, индикатор соединения в состоянии «live»

### Requirement: Nginx
Nginx ДОЛЖЕН отдавать статику с gzip (включая js, css, json, svg), возвращать `index.html` на неизвестные пути и проксировать `/api` и `/ws` на сервер, включая WebSocket-upgrade.

#### Scenario: Сжатие
- **WHEN** запрошен основной js-бандл с `Accept-Encoding: gzip`
- **THEN** ответ содержит `Content-Encoding: gzip`

#### Scenario: WebSocket за прокси
- **WHEN** клиент за nginx открывает `/ws`
- **THEN** соединение установлено и патчи приходят

### Requirement: Бюджет бандла
Production-сборка клиента ДОЛЖНА быть не более 200 КБ gzip суммарно по js и css.

#### Scenario: Проверка размера
- **WHEN** выполнено `pnpm build`
- **THEN** сумма gzip-размеров из вывода сборки ≤ 200 КБ, значение записано в README
