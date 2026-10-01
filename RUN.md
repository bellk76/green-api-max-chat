# Инструкция по локальному запуску

Приложение: «Чат MAX через GREEN-API» — SPA для отправки и получения текстовых сообщений
в мессенджере **MAX** через сервис **GREEN-API**. Стек: React 19 + TypeScript, сборка Vite.

---

## 1. Что понадобится

- **Node.js 20+** и npm (проверено на Node.js 24).
- **Аккаунт и инстанс GREEN-API** — регистрация на `console.green-api.com` (тариф «MAX Developer», 0 ₽).
- **Аккаунт MAX** и инстанс, авторизованный в MAX (см. шаг 5) — иначе сообщения не доставляются.
- Для проверки ответа получателя — второй аккаунт MAX.

## 2. Установить Node.js

Скачать с https://nodejs.org (кнопка LTS) или поставить через winget:

```powershell
winget install OpenJS.NodeJS.LTS
```

Проверить:

```powershell
node -v
npm -v
```

npm ставится вместе с Node.js — отдельно ничего устанавливать не нужно.

## 3. Получить проект

```powershell
git clone <адрес-репозитория>
cd green-api-max-chat
```

Либо распаковать архив с проектом и перейти в его папку.

## 4. Установить зависимости и запустить

```powershell
npm install
npm run dev
```

Vite выведет адрес, например:

```
  ➜  Local:   http://localhost:5173/
```

Открыть этот адрес в браузере.

## 5. Подготовить GREEN-API и авторизовать инстанс в MAX

Без этого шага интерфейс работает, но сообщения реально не уходят (попадают в очередь).

1. Зарегистрироваться в личном кабинете GREEN-API: `console.green-api.com`.
2. Создать **инстанс** (`console.green-api.com/instanceList`) на тарифе **MAX Developer**.
3. Скопировать из карточки инстанса три значения:
   - **apiUrl** (например `https://3100.api.green-api.com`),
   - **idInstance**,
   - **apiTokenInstance**.
4. Зарегистрировать аккаунт MAX (мобильное или десктопное приложение; веб-версия для регистрации
   не подходит), понадобится номер телефона и код из SMS.
5. Авторизовать инстанс в MAX:
   - в кабинете GREEN-API нажать «Получить QR-код для авторизации»;
   - в приложении MAX: `Профиль → Устройства → Войти по QR-коду` → отсканировать QR.
   - Пароль входа в MAX должен быть отключён.
6. Проверить в кабинете, что состояние инстанса — `authorized`.

## 6. Как пользоваться приложением

1. На странице `http://localhost:5173/` заполнить форму входа: `apiUrl`, `idInstance`, `apiTokenInstance`.
   Значения сохраняются только в браузере (`localStorage`).
2. В шапке должен появиться индикатор **«авторизован»** (зелёная точка).
3. Ввести номер телефона получателя (РФ — `79991234567`, РБ — `375291234567`) и нажать «Создать чат».
   Приложение через метод `checkAccount` получает внутренний `chatId` получателя в MAX.
4. Написать текст и нажать «Отправить» — сообщение уйдёт получателю в MAX.
5. Попросить получателя ответить в MAX — ответ появится в ленте (опрос уведомлений идёт каждые 5 секунд).

## 7. Сборка и проверки

```bash
npm run build      # production-сборка (tsc -b + vite build) → папка dist
npm run preview    # локальный просмотр собранной версии
npm test           # тесты (Vitest + Testing Library, сеть через мок fetch)
npm run test:watch # тесты в режиме наблюдения
npm run lint       # линтер oxlint
npm run typecheck  # проверка типов (tsc -b)
```

## 8. Частые проблемы

| Симптом | Причина и решение |
| --- | --- |
| В шапке «не авторизован» | Инстанс не привязан к MAX — выполнить шаг 5 (QR). Сообщения стоят в очереди до 24 ч. |
| Ошибка `HTTP 429` | Превышен лимит частоты запросов (у `getStateInstance` — 1/сек). Подождать секунду и повторить. |
| «Аккаунт MAX с таким номером не найден» | Номера нет в MAX или неверный формат (нужно 11–12 цифр, начало `7` или `375`). |
| Отправка «успешна», но сообщение не пришло | Инстанс не авторизован — сообщение в очереди, а не у получателя. |
| Порт занят | Vite предложит другой порт, либо задать: `npm run dev -- --port 3000`. |

## 9. Структура проекта

```
src/
  api/greenApi.ts             — клиент GREEN-API (sendMessage, receive/deleteNotification, checkAccount, getStateInstance)
  components/LoginForm.tsx    — экран ввода учётных данных
  components/Chat.tsx         — чат: создание по номеру, шапка с состоянием
  components/MessageList.tsx  — лента сообщений
  components/MessageInput.tsx — поле ввода и отправки
  hooks/useChat.ts            — состояние сообщений и цикл опроса уведомлений
  types.ts                    — типы API и сообщений
  App.tsx, main.tsx, index.css
```

## 10. Используемые методы GREEN-API

- `sendMessage` — https://green-api.com/v3/docs/api/sending/SendMessage/
- `receiveNotification` / `deleteNotification` — https://green-api.com/v3/docs/api/receiving/technology-http-api/
- `checkAccount` — https://green-api.com/v3/docs/api/service/CheckAccount/
- `getStateInstance` — https://green-api.com/v3/docs/api/account/GetStateInstance/

## Ограничения тарифа MAX Developer

- 1 инстанс, взаимодействие максимум с 3 чатами.
- Часть сервисных методов (в т.ч. `checkAccount`) имеет месячные лимиты.
