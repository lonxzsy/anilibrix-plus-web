# Anilibrix Plus Web

> PWA для просмотра аниме на базе [Anilibria](https://anilibria.tv). Material Design 3, мобильная поддержка, установка на экран дома.

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4-42b883?style=flat-square&logo=vue.js" alt="Vue">
  <img src="https://img.shields.io/badge/PWA-ready-5a0fc8?style=flat-square&logo=pwa" alt="PWA">
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Material%20Design-3-6750a4?style=flat-square&logo=material-design" alt="Material Design 3">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel" alt="Vercel">
</p>

---

## Возможности

- **Каталог** — просмотр всех релизов Anilibria с поиском, фильтрами по жанру/году/типу, переключением сетка/список
- **Расписание** — ежедневное расписание выхода новых серий с анимированными вкладками
- **Плеер** — кастомный HTML5 плеер на HLS.js:
  - Пропуск опенинга / эндинга
  - Автопереключение на следующую серию
  - Субтитры (SRT/VTT) с настройкой стиля
  - Картинка-в-картинке (PiP)
  - Выбор качества (480p / 720p / 1080p)
  - Скорость воспроизведения (0.5x–2x)
  - Горячие клавиши
  - Touch-жесты на мобильных
- **Библиотека** — избранное, история просмотров, плейлисты, синхронизация с аккаунтом Anilibria
- **Две темы** — тёмная (кинематографичная) и светлая (Material You)
- **PWA** — установка на экран дома, офлайн-доступ через Service Worker
- **Локальные файлы** — выбор папки с сериалами через File System Access API (Chrome)
- **Авторизация** — вход через аккаунт Anilibria, синхронизация избранного и истории
- **Web Share API** — поделиться ссылкой на тайтл

---

## Живой демо

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flonxzsy%2Fanilibrix-plus-web)

Либо открой в браузере после деплоя — установи на телефон через "Добавить на экран дома".

---

## Установка и запуск

### Требования

- Node.js **18+**
- npm / yarn / pnpm

### Разработка

```bash
git clone https://github.com/lonxzsy/anilibrix-plus-web.git
cd anilibrix-plus-web
npm install
npm run dev
```

Dev-сервер запустится на `http://localhost:5173`.

### Сборка

```bash
npm run build
```

Готовая статика в папке `dist/`. Можно залить на любой хостинг.

### Превью собранного

```bash
npm run preview
```

---

## Деплой на Vercel (рекомендуется)

### Автоматически (через GitHub)

1. Создай репозиторий и запушь код
2. Зайди на [vercel.com](https://vercel.com) → `Add New Project`
3. Импортируй репозиторий
4. Vercel сам определит Vite — ничего менять не нужно
5. Нажми `Deploy` — готово

### Через CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### CI/CD (уже настроен)

В `.github/workflows/deploy.yml` — автодеплой при пуше в `main`.  
Добавь в GitHub Secrets:
- `VERCEL_TOKEN` — [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` — из `vercel link`
- `VERCEL_PROJECT_ID` — из `vercel link`

---

## Структура проекта

```
anilibrix-plus-web/
├── public/
│   └── icons/            # Иконки PWA
├── src/
│   ├── api/              # API клиент Anilibria (Axios)
│   ├── components/       # Vue-компоненты
│   │   ├── AuthModal.vue
│   │   ├── BottomNav.vue       # Навигация для мобильных
│   │   ├── HeroCarousel.vue
│   │   ├── NavigationRail.vue  # Боковая панель (десктоп)
│   │   ├── SearchBar.vue
│   │   ├── SubtitleOverlay.vue
│   │   └── TitleCard.vue
│   ├── db/               # IndexedDB (Dexie.js)
│   │   └── database.ts
│   ├── stores/           # Pinia stores
│   │   ├── auth.ts
│   │   ├── library.ts
│   │   └── titles.ts
│   ├── styles/
│   │   ├── m3-tokens.scss       # Material Design 3 токены
│   │   ├── light-theme.scss     # Светлая тема
│   │   ├── responsive.scss      # Брейкпоинты
│   │   └── global.scss
│   ├── utils/
│   │   ├── file-system.ts       # File System Access API
│   │   ├── helpers.ts
│   │   └── subtitles.ts
│   ├── views/
│   │   ├── Home.vue
│   │   ├── Catalog.vue
│   │   ├── TitleDetail.vue
│   │   ├── Player.vue
│   │   ├── Schedule.vue
│   │   ├── Library.vue
│   │   └── Profile.vue
│   ├── types.ts
│   ├── router.ts
│   └── main.ts
├── .github/workflows/    # CI/CD
│   ├── ci.yml
│   └── deploy.yml
├── vercel.json
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Адаптация под мобильные

- **< 600px** — Bottom Navigation Bar, 2 колонки в каталоге, плеер на весь экран
- **600–1024px** — Tablet layout, сворачиваемый сайдбар
- **> 1024px** — Полноценный десктоп с NavigationRail

PWA можно установить на телефон через "Add to Home Screen" — работает как нативное приложение.

---

## Горячие клавиши (плеер)

| Клавиша | Действие |
|---|---|
| `Пробел` / `K` | Плей / Пауза |
| `←` / `→` | Назад / Вперёд на 10 сек |
| `↑` / `↓` | Громкость |
| `F` | Полноэкранный режим |
| `M` | Звук вкл/выкл |
| `N` | Следующая серия |

---

## Технологии

| Технология | Назначение |
|---|---|
| [Vue 3](https://vuejs.org/) + Composition API | UI фреймворк |
| [Vite](https://vitejs.dev/) | Сборка |
| [Pinia](https://pinia.vuejs.org/) | Управление состоянием |
| [Vue Router](https://router.vuejs.org/) | Роутинг (hash-based) |
| [Dexie.js](https://dexie.org/) | IndexedDB — локальное хранилище |
| [HLS.js](https://github.com/video-dev/hls.js/) | HLS-стриминг |
| [Axios](https://axios-http.com/) | HTTP-клиент |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | PWA + Service Worker |
| [Sass/SCSS](https://sass-lang.com/) | Стилизация |
| [Material Design 3](https://m3.material.io/) | Дизайн-система |

---

## Миграция с Electron

Проект был портирован с [оригинальной Electron-версии](https://github.com/lonxzsy/anilibrix-plus):

- `electron-store` → `Dexie.js` (IndexedDB)
- `Discord RPC` — удалён (не нужен в браузере)
- `local://` протокол → `File System Access API`
- IPC bridges → прямые вызовы Pinia + Dexie
- Добавлен PWA Service Worker
- Добавлена адаптивная вёрстка
- Добавлен Bottom Navigation Bar

---

## Лицензия

MIT

> **Disclaimer:** Anilibrix Plus — неофициальный клиент. Все права на контент принадлежат [Anilibria](https://anilibria.tv).
