# Self-Assessment — Aziz Shik

**Дата:** 06.04.2026 **GitHub:** [AzizShik](https://github.com/AzizShik) **PR:**
[Pull Request](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/86)

## Таблица реализованных фич (Personal Features)

| Категория            | Фича                                                             | Баллы | Ссылка на код / PR                                                                                                                                                                                | Комментарий                            |
| -------------------- | ---------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **My Components**    | Complex Component: AI Team Lead Chat (Probation Gameplay Screen) | 25    | [`src/ui/screens/gamePlayScreen.ts`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/76) / [`Pull Request`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/76)       | Основной игровой чат                   |
| **My Components**    | Complex Component: ResultDialogWidget (Smart Dialog)             | 25    | [`src/ui/widgets/ResultDialogWidget.ts`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/84) / [`Pull Request`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/84)   | Динамический результат дня / Game Over |
| **My Components**    | Complex Component: DebugChallengeWidget (EventLoop)              | 25    | [`src/ui/widgets/DebugChallengeWidget.ts`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/94) / [`Pull Request`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/94) | Drag&Drop игра с Event Loop            |
| **UI & Interaction** | Toast Notification System                                        | 10    | [`src/ui/components/toast.ts`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/79) / [`Pull Request`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/79)             | Замена всех alert()                    |
| **Architecture**     | Custom Hash Router                                               | 10    | [`src/router/router.ts`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/33) / [`Pull Request`](https://github.com/OlgaMinaievaWebDev/rs-tandem-devquest/pull/33)                   | Навигация по приложению                |

**Итого заявлено:** **95 баллов**

### 2 главных личных Feature Component

**1. AI Team Lead Chat (Probation Gameplay Screen)** Это основной игровой экран
общения с AI Team Lead. Я реализовал:

- чат, интегрированный в dashboard
- отправку сообщений (кнопка + Ctrl+Enter)
- разное оформление сообщений босса и пользователя
- подсветку кода
- плавный автоскролл с корректной работой после добавления сообщений

**2. ResultDialogWidget (Smart Dialog)** Полноценный динамический модальный
компонент на базе нативного `<dialog>`. Используется для показа результатов
задания, завершения дня, провала и Game Over. Реализовал:

- динамический контент через props
- разные визуальные состояния (успех / провал)
- использование `::backdrop`
- интеграцию через EventBus
- правильную очистку элемента после закрытия

**3. DebugChallengeWidget (Event Loop Drag & Drop)** Интерактивный виджет для
проверки понимания event loop в JavaScript. Пользователь перетаскивает выводы
консоли в правильном порядке.

Реализовал:

- Полноценную drag‑and‑drop механику с использованием нативного HTML5 Drag &
  Drop API.
- Логику **swap**: при перетаскивании элемента на занятую ячейку элементы
  меняются местами (поддержка перемещения между ячейками и обратно в исходный
  контейнер).
- Исправление бага с мерцанием `drag‑over` класса при наведении на дочерние
  элементы (через `relatedTarget` и `contains`).
- Интеграцию с **AI‑генерацией** задач: динамический prompt с масштабированием
  сложности от 1 до 7 дня (от простого sync/micro/macro до вложенных промисов,
  async/await и рекурсивных микрозадач).
- **Fallback‑механизм**: если AI не отвечает или возвращает некорректный JSON,
  подгружается локальный массив из 7 предустановленных задач возрастающей
  сложности.
- Загрузчик (`Loader`) с сообщением «AI Lead is creating a debug challenge…» и
  обработку ошибок через `toast`.
- Оценку результата: сбор порядка элементов из DOM, сравнение с ожидаемым
  массивом, отправка события `TASK_FINISHED` через EventBus.

## Описание моей работы

В рамках проекта DevQuest я в основном работал над фронтенд-частью — созданием
игровых экранов и интерактивных компонентов.

Большую часть кода я писал с активной помощью ИИ (Grok). Обычно я формулировал
задачу, получал решение, разбирал его, вносил правки, адаптировал под стиль
проекта и тестировал. Такой подход позволил двигаться быстрее, но при этом я
старался понимать, как работает каждая часть.

Самостоятельно (с наибольшим погружением) я работал над тремя компонентами:

- AI Team Lead Chat
- ResultDialogWidget
- DebugChallengeWidget

В этих компонентах я глубже разбирался с архитектурой, решал проблемы со
скроллом, анимациями, жизненным циклом элементов, drag&drop и интеграцией с EventBus.

**Технологии и инструменты:**

- Vanilla TypeScript
- Классовая архитектура компонентов
- SCSS
- Native Web API (`<dialog>`, `requestAnimationFrame`, EventBus)
- highlight.js
- Drag & Drop API

**Что было сложным:**

- Добиться стабильного и плавного автоскролла чата при динамическом добавлении
  сообщений
- Сделать гибкий и переиспользуемый ResultDialogWidget с разными сценариями и
  стилизацией
- Правильная обработка событий `dragstart`, `dragover`, `dragleave`, `drop` без
  конфликтов с нативным перетаскиванием текста.
- Реализация swap‑логики с запоминанием исходного родителя
  (`draggetNodeParent`).
- Предотвращение срабатывания `dragleave` при заходе на дочерний элемент внутри
  ячейки.
- Поддерживать единый стиль кода проекта при добавлении новых фич

Я осознаю, что мой текущий уровень — это в первую очередь умение работать с ИИ,
быстро прототипировать и доводить решения до рабочего состояния. Глубокого опыта
написания сложного кода «с нуля» без помощи пока нет, но я стараюсь
анализировать и понимать код, который использую.

---

Готов к обратной связи и вопросам.
