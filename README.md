# Anilibrix Plus Web

> PWA for watching anime powered by [Anilibria](https://anilibria.tv), [AnimeVost](https://animevost.org), and more. Material Design 3, mobile support, installable to home screen.

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4-42b883?style=flat-square&logo=vue.js" alt="Vue">
  <img src="https://img.shields.io/badge/PWA-ready-5a0fc8?style=flat-square&logo=pwa" alt="PWA">
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Material%20Design-3-6750a4?style=flat-square&logo=material-design" alt="Material Design 3">
  <img src="https://img.shields.io/badge/GSAP-3.15-88ce02?style=flat-square&logo=greensock" alt="GSAP">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel" alt="Vercel">
</p>

---

## Features

- **Catalog** — browse all Anilibria releases with search, genre/year/type filters, grid/list toggle
- **Schedule** — daily release schedule with animated tab indicators
- **Trending** — top anime by MyAnimeList rating, sortable by score/popularity/rank, grid/list view
- **Multi-Studio Search** — search across AnimeVost, AniLib, YummyAnime, and Dream Cast with a dedicated player
- **Player** — custom HTML5 player built on HLS.js:
  - Opening/ending skip
  - Auto-advance to next episode
  - Subtitles (SRT/VTT) with style configuration
  - Picture-in-Picture (PiP)
  - Quality selection (480p / 720p / 1080p)
  - Playback speed (0.5x–2x)
  - Keyboard shortcuts
  - Touch gestures on mobile
- **Library** — favorites, watch later, viewing history, playlists, sync with Anilibria account
- **User Ratings** — rate anime and persist ratings locally
- **Animation System** — GSAP-powered page transitions, stagger card animations, parallax scrolling, scroll reveal, count-up animations, fly-to-detail transitions
- **Toast Notifications** — non-intrusive success/error/info toasts
- **Keyboard Shortcuts Modal** — view all global shortcuts from any page
- **Two Themes** — dark (cinematic) and light (Material You)
- **PWA** — installable to home screen, offline access via Service Worker
- **Local Files** — select local series folder via File System Access API (Chrome)
- **Authentication** — sign in with Anilibria account, sync favorites and history
- **Changelog** — inline release history fetched from GitHub
- **Web Share API** — share title links

---

## Live Demo

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flonxzsy%2Fanilibrix-plus-web)

Or open in browser after deployment — install on your phone via "Add to Home Screen".

---

## Installation & Setup

### Requirements

- Node.js **18+**
- npm / yarn / pnpm

### Development

```bash
git clone https://github.com/lonxzsy/anilibrix-plus-web.git
cd anilibrix-plus-web
npm install
npm run dev
```

Dev server starts at `http://localhost:5173`.

### Build

```bash
npm run build
```

Static output in `dist/`. Deploy to any hosting provider.

### Preview Production Build

```bash
npm run preview
```

---

## Deploy to Vercel (Recommended)

### Automatic (via GitHub)

1. Create a repository and push the code
2. Go to [vercel.com](https://vercel.com) → `Add New Project`
3. Import the repository
4. Vercel auto-detects Vite — no configuration needed
5. Click `Deploy`

### Via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### CI/CD (pre-configured)

`.github/workflows/deploy.yml` — auto-deploys on push to `main`.  
Add these GitHub Secrets:
- `VERCEL_TOKEN` — [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` — from `vercel link`
- `VERCEL_PROJECT_ID` — from `vercel link`

---

## Project Structure

```
anilibrix-plus-web/
├── public/
│   └── icons/              # PWA icons
├── src/
│   ├── api/                 # API client
│   │   ├── client.ts        # Anilibria API (Axios)
│   │   └── decoder.ts       # Multi-studio decoder API
│   ├── components/
│   │   ├── AuthModal.vue
│   │   ├── BottomNav.vue         # Mobile bottom navigation
│   │   ├── HeroCarousel.vue
│   │   ├── NavigationRail.vue    # Desktop sidebar
│   │   ├── SearchBar.vue
│   │   ├── ShortcutsModal.vue    # Keyboard shortcuts overlay
│   │   ├── SubtitleOverlay.vue
│   │   ├── TitleCard.vue
│   │   ├── ToastContainer.vue    # Toast notifications
│   │   └── UpdateSnackbar.vue
│   ├── composables/         # Reusable composition functions
│   │   ├── useGsap.ts            # GSAP animations (page transitions, stagger, parallax, etc.)
│   │   ├── useScrollReveal.ts    # Scroll-triggered reveal animations
│   │   └── useToast.ts           # Toast notification state
│   ├── db/                  # IndexedDB via Dexie.js
│   │   └── database.ts
│   ├── stores/              # Pinia stores
│   │   ├── auth.ts
│   │   ├── decoder.ts            # Multi-studio search state
│   │   ├── library.ts            # Favorites, watch later, ratings
│   │   └── titles.ts
│   ├── styles/
│   │   ├── m3-tokens.scss        # Material Design 3 tokens
│   │   ├── light-theme.scss      # Light theme
│   │   ├── responsive.scss       # Breakpoint mixins
│   │   └── global.scss
│   ├── utils/
│   │   ├── external-search.ts    # Jikan (MyAnimeList) API search
│   │   ├── file-system.ts        # File System Access API
│   │   ├── helpers.ts
│   │   ├── search.ts             # Fuse.js fuzzy search with transliteration
│   │   └── subtitles.ts
│   ├── views/
│   │   ├── Catalog.vue
│   │   ├── Changelog.vue         # Release history
│   │   ├── Home.vue
│   │   ├── Library.vue
│   │   ├── Player.vue
│   │   ├── Profile.vue
│   │   ├── Schedule.vue
│   │   ├── StudioEpisodes.vue    # Studio anime episodes
│   │   ├── StudioPlayer.vue      # Custom video player for studio sources
│   │   ├── StudioSearch.vue      # Multi-studio search page
│   │   ├── TitleDetail.vue
│   │   └── Trending.vue          # MyAnimeList top anime
│   ├── types.ts
│   ├── router.ts
│   └── main.ts
├── .github/workflows/       # CI/CD
│   ├── ci.yml
│   └── deploy.yml
├── vercel.json
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Responsive Breakpoints

- **< 600px** — Bottom Navigation Bar, 2-column catalog, full-screen player
- **600–1024px** — Tablet layout, collapsible sidebar
- **> 1024px** — Full desktop with NavigationRail

PWA can be installed on your phone via "Add to Home Screen" — works like a native app.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` / `K` | Play / Pause |
| `←` / `→` | Rewind / Forward 10s |
| `↑` / `↓` | Volume |
| `F` | Fullscreen |
| `M` | Mute |
| `N` | Next episode |
| `?` | Show shortcuts modal |
| `Ctrl+K` | Focus search bar |

---

## Technologies

| Technology | Purpose |
|---|---|
| [Vue 3](https://vuejs.org/) + Composition API | UI framework |
| [Vite](https://vitejs.dev/) | Build tool |
| [Pinia](https://pinia.vuejs.org/) | State management |
| [Vue Router](https://router.vuejs.org/) | Routing (hash-based) |
| [GSAP](https://gsap.com/) | Animations (page transitions, stagger, scroll, parallax) |
| [Dexie.js](https://dexie.org/) | IndexedDB — local storage |
| [HLS.js](https://github.com/video-dev/hls.js/) | HLS streaming |
| [Fuse.js](https://fusejs.io/) | Fuzzy search with transliteration |
| [Axios](https://axios-http.com/) | HTTP client |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | PWA + Service Worker |
| [Sass/SCSS](https://sass-lang.com/) | Styling |
| [Material Design 3](https://m3.material.io/) | Design system |

---

## Migration from Electron

This project was ported from the [original Electron version](https://github.com/lonxzsy/anilibrix-plus):

- `electron-store` → `Dexie.js` (IndexedDB)
- `Discord RPC` — removed (not needed in browser)
- `local://` protocol → `File System Access API`
- IPC bridges → direct Pinia + Dexie calls
- Added PWA Service Worker
- Added responsive layout
- Added Bottom Navigation Bar
- Added GSAP animation system
- Added multi-studio search (AnimeVost, AniLib, YummyAnime, Dream Cast)
- Added Trending page with MyAnimeList integration
- Added toast notifications
- Added keyboard shortcuts modal

---

## License

MIT

> **Disclaimer:** Anilibrix Plus is an unofficial client. All content rights belong to [Anilibria](https://anilibria.tv) and respective publishers.
