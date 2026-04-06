# DevQuest (RS School Final Project)

**Live Demo:** [https://olgaminaievawebdev.github.io/rs-tandem-devquest/](https://olgaminaievawebdev.github.io/rs-tandem-devquest/)

## 📖 О проекте

**DevQuest** — это геймифицированное веб-приложение, созданное для того, чтобы помочь начинающим разработчикам подготовиться к техническим собеседованиям. Игрок берет на себя роль Junior-разработчика, проходящего 7-дневный испытательный срок под руководством строгого ИИ-тимлида.

**Ключевые особенности:**

- **AI Team Lead (Gemini API):** Генерирует задачи с "багами", проверяет код игрока и дает резкий, но полезный фидбек.
- **RPG Механики:** У игрока есть два основных показателя - **Stress** (уровень стресса) и **Authority** (уровень авторитета). Ошибки повышают стресс, а чистый код — авторитет.
- **7-Day Marathon:** Цель — дожить до конца недели, не будучи "уволенным" из-за критического уровня стресса.

### 🎥 Демо-видео

[Смотреть демо-видео на YouTube](https://youtu.be/WFERhczrpLc)

### ⭐ Чем мы гордимся

- Мы с нуля спроектировали надежную архитектуру на Vanilla TypeScript без использования тяжелых фреймворков, реализовав собственные решения для управления состоянием (Store на базе паттерна Observer), маршрутизацией (Custom Hash Router) и обмена событиями (EventBus).
- Выстроили безопасную интеграцию с Gemini API через Supabase Edge Functions, что позволило скрыть API-ключи от клиентской части.
- Особое внимание уделили стабильности данных: разработали Offline-First подход с двойным сохранением прогресса (в `localStorage` и облако).
- Настроили синхронизацию состояния игры между несколькими открытыми вкладками браузера с помощью `BroadcastChannel`.
- Создали продуманный пользовательский интерфейс с кастомными модальными окнами (Smart Dialog на базе нативного `<dialog>`) и плавной системой всплывающих уведомлений (Toast) без использования сторонних библиотек.

## 🛠 Tech Stack

- **Frontend:** TypeScript, Vite, HTML5, SCSS
- **AI:** Google Gemini API (Edge Functions integration)
- **Data & Backend:** Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- **State Management:** Custom Store (Observer pattern), `localStorage`, `BroadcastChannel`
- **Testing & Tools:** Vitest, ESLint, Husky (pre-commit hooks)

## 👥 Команда (RS Tandem)

- **O. Minaieva** ([OlgaMinaievaWebDev](https://github.com/OlgaMinaievaWebDev)) — Team Lead. [Дневник разработки](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/tree/main/development-notes/OlgaMinaievaWebDev)
- **A. Aziz** ([AzizShik](https://github.com/AzizShik)) — Developer. [Дневник разработки](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/tree/main/development-notes/azizshik)
- **I. Saluk** ([isaluk](https://github.com/isaluk)) — Developer. [Дневник разработки](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/tree/main/development-notes/isaluk)

## 📋 Доска задач (Board)

Доску задач к сожалению мы не вели.

## 💻 Лучшие Pull Requests

1. [PR #80: Feature: implement core game loop, event-driven architecture, and quiz widget](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/80) — Переход приложения к полноценной событийно-ориентированной архитектуре (EventBus) и реализация системы дней (DayManager).
2. [PR #66: feat: implement sign out button and logout flow](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/66) — Добавление функционала выхода из аккаунта (Sign Out) с очисткой сессии и автоматическим редиректом через слушатель состояния Supabase.
3. [PR #76: feat: add gamePlayScreen](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/76) — Реализация интерактивного UI чата с AI-тимлидом (Probation Gameplay Screen) с поддержкой скролла и многострочного ввода.
4. [PR #50: feat: add dayMain with 7 days cards, add dayScreen](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/50) — Создание флоу выбора мини-игр и интеграция экрана дня с глобальным роутингом и макетом `DashboardLayout`.

## 📝 Meeting Notes

У команды была только одна встреча, записи о ней нет.

## 🔧 Установка и запуск (Деплой)

Приложение скоро будет доступно онлайн по ссылке: [Live Demo](https://olgaminaievawebdev.github.io/rs-tandem-devquest/)

На данный момент проект можно запустить локально, следуя этой инструкции:

1. Клонируем репозиторий.
2. Устанавливаем зависимости: `npm install`.
3. Запускаем проект: `npm run dev`.
