# Lightkeeper

**Keeping watch, so you don't have to.**

Lightkeeper checks websites for you and sends one clear notification the moment the thing you're waiting for happens: exam results, admit cards, price drops, new job posts.

This repo is a monorepo. Right now it contains the app UI with mock data; the NestJS backend and shared types come next.

```
lightkeeper/
├── apps/
│   ├── mobile/        # Expo app: Android, web (and iOS later) from one codebase
│   └── api/           # NestJS backend (coming next)
└── packages/
    └── shared/        # shared TypeScript types (coming next)
```

## Run the app (UI with mock data)

You need **Node.js 22.13 or newer** (Node 24 LTS recommended) and Git. Check with `node -v`. Then:

```bash
cd apps/mobile
npm install          # installs Expo SDK 58
npm run setup        # installs every other package at the version that matches SDK 58
npm run web          # opens the web version in your browser
```

For Android:

- **Emulator:** start one in Android Studio, then `npm run android`.
- **Your phone:** install **Expo Go** from the Play Store, run `npm start`, and scan the QR code. Expo Go is fine for this UI phase; push notifications later need a development build.

If anything looks off after an install, run `npm run doctor`.

## What's in the UI

| Area | Screens |
| --- | --- |
| Onboarding | Welcome (3 slides on phones, landing page on wide screens), Sign in (Google, email link, Apple on iOS, **Try without signing in**), Notification permission |
| Core | Watches (list; list + detail split view on wide screens), New watch (up to 2 pages free, 3rd needs Pro), Confirm, Watch details (single and multi-site), Pro upsell |
| Browse | Explore ready-made sources with search and categories |
| Account | Settings with **Appearance: System / Light / Dark**, alert toggles, sign out |
| Guest mode | Guest home, Save-your-account sheet when a guest hits the 1-watch limit |
| Web | Sidebar instead of bottom tabs at 900px+, Install guide (iPhone Add to Home Screen, Android, computer) |

### Themes

Light and dark colour tokens live in `apps/mobile/src/theme/tokens.ts`. The choice (System, Light or Dark) is saved on the device. System follows the phone or computer setting.

### Plan rules in the mock

- Guest: 1 watch. Free: 3 active watches (paused ones don't count), 2 sites per watch.
- Pro (coming soon): 25 watches, 10 sites per watch, checks every 5–10 minutes.

Website addresses in the mock data are placeholders; use the real official URLs before launch.

## Next steps

1. NestJS API + PostgreSQL (Prisma) + BullMQ checker
2. Firebase Auth (Google, email link, anonymous guest) and FCM push (Android + Web Push)
3. Gemini for goal parsing and change summaries
4. Deploy: web on Netlify, API on Render + Neon (Oracle Cloud later)
