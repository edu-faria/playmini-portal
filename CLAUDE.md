# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PlayMini.io is a browser-based mini-games portal built with React + Vite. It hosts 9 self-contained games and is monetized via Google AdSense with GDPR consent management.

## Commands

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Production build → /dist
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

No test suite is configured.

## Architecture

**Routing** (React Router v7, defined in [src/App.jsx](src/App.jsx)):
- `/` → `HomePage` — game grid
- `/:gameId` → `GamePage` — looks up game component by ID and renders it
- `/privacy`, `/terms` — static pages

**Adding a new game** requires changes in two places:
1. [src/data/gamesData.js](src/data/gamesData.js) — add metadata entry `{ id, name, icon, description, path }`
2. [src/pages/GamePage.jsx](src/pages/GamePage.jsx) — add the component import to the `gameComponents` map

**Game components** ([src/games/](src/games/)) are fully self-contained: they manage their own state with `useState`/`useEffect`/`useRef`, run game loops via `setInterval`, and handle keyboard/touch events internally. There is no shared game state or context.

**Ad integration** — [src/components/AdSpace.jsx](src/components/AdSpace.jsx) is a reusable wrapper around Google AdSense `<ins>` tags. GDPR consent is handled by [src/components/AdSenseConsent.jsx](src/components/AdSenseConsent.jsx) using Google Funding Choices. AdSense credentials come from `.env`:
```
VITE_ADSENSE_CLIENT_ID
VITE_ADSENSE_FC_ID
VITE_ADSENSE_PUBLISHER_ID
```

**Layout** — `App.jsx` wraps all routes in an `ErrorBoundary`, renders a sticky `Header`, two `AdSpace` leaderboards (top/bottom), and a `Footer` around the route outlet.

## Tech Stack

- React 19 / JSX (no TypeScript)
- Tailwind CSS 3 (utility classes only; custom CSS limited to AdSense consent banner in `index.css`)
- Vite 7 with `@vitejs/plugin-react`
- ESLint 9 flat config

## Design Conventions

- Dark gradient theme (purple → blue → indigo), glass-morphism effects (`backdrop-blur`, semi-transparent backgrounds)
- Mobile responsiveness uses Tailwind breakpoints (`sm:`, `lg:`) — note: several games still have known mobile input issues (tracked in `backlog`)
- Icons from `lucide-react`
