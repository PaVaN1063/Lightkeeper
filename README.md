# Lightkeeper

**Keeping watch, so you don't have to.**

Lightkeeper checks websites for you and sends one clear notification the moment the thing you're waiting for happens: exam results, admit cards, price drops, new job posts.

```
lightkeeper/
├── apps/
│   ├── mobile/   # Expo app: Android, web (and iOS later) from one codebase
│   └── api/      # NestJS backend: watches API + page checker, PostgreSQL via Prisma
```

You need **Node.js 22.13 or newer** (Node 24 LTS recommended), Git and **Docker Desktop**. Check with `node -v` and `docker --version`.

## 1. Start the backend

```bash
cd apps/api
copy .env.example .env      # macOS/Linux: cp .env.example .env
npm install                 # also generates the Prisma client
npm run db:up               # starts PostgreSQL in Docker
npm run db:push             # creates the tables
npm run dev                 # API on http://localhost:3000, checker runs every minute
```

Check it: open http://localhost:3000/health → `"database": "ok"`.

## 2. Start the app

In a second terminal:

```bash
cd apps/mobile
npm install
npm run web                 # browser
npm run android             # Android emulator (start one in Android Studio first)
```

- **Web** and the **Android emulator** find the API automatically.
- **A real phone** needs your laptop's address: copy `apps/mobile/.env.example` to `.env` and set `EXPO_PUBLIC_API_URL=http://<laptop-ip>:3000` (find the IP with `ipconfig`). Phone and laptop must be on the same Wi-Fi, and Windows may ask to allow Node through the firewall.

## 3. Try a real alert in two minutes

The API includes a fake results page you control.

1. In the app: **New watch** → link `http://localhost:3000/dev/test-page` (on a phone use `http://<laptop-ip>:3000/dev/test-page`) → goal **Tell me when the result is out** → Start watching.
2. Open http://localhost:3000/dev/control and click **Publish result**.
3. In the app, open the watch and tap **Check now** (or wait for the next scheduled check). It turns **Goal met**, and the timeline shows the alert with a direct link to the result.

Also try: goal **Tell me when the price drops below ₹50,000** on the same page, then **Drop price** twice; or **Tell me when this page changes** and **Add a notice**.

## How checking works

1. Every minute the checker finds pages whose watches are due (free plan: hourly).
2. It downloads the page, strips scripts and styles, and keeps the visible text, one line per block.
3. Same text as last time → nothing to do.
4. Otherwise each watch on that page is judged:
   - **Words** ("admit card", "result", "React"): alert when a **new** line mentions them. Words already on the page at the start don't trigger an alert; the timeline notes them.
   - **Price** ("below ₹50,000"): alert when the first ₹ price on the page is at or below the target.
   - **Any change**: alert when the visible text changes.
5. A goal met marks the watch **Goal met** and records the alert. A site failing 3 checks in a row is noted on the timeline; checks continue.

A page watched by many users is fetched once. Goals are understood by simple rules today (`apps/api/src/watches/goal-parser.ts`); Gemini can replace that later with the same output.

## What's real and what's still mock

| Part | Status |
| --- | --- |
| Watches, pages, timeline, feedback | Real, stored in PostgreSQL |
| Page checking and alerts | Real (server side), shown in the app |
| Explore ready-made watches | Real: starts a watch on the official URL |
| Plan limits (guest 1, free 3 active, 2 pages each) | Enforced by the API |
| Sign-in | **Mock**: a random id per install (`x-lightkeeper-client` header). Firebase Auth next; never deploy publicly like this |
| Push notifications | **Not yet**: alerts appear in the app; FCM next |
| AI goal parsing and summaries | **Rules for now**; Gemini next |

Amazon and Flipkart usually block automated checks; price watches work best on simple product pages until the affiliate APIs are added.

## API

| Method | Path | What it does |
| --- | --- | --- |
| GET | /health | Server and database status |
| POST | /watches/parse | Preview how a goal is understood (saves nothing) |
| GET | /watches | Your watches with pages and timeline |
| POST | /watches | Create from `{ urls, goal, intervalMin }` or `{ sourceId }` |
| GET | /watches/:id | One watch |
| PATCH | /watches/:id | `{ status: "paused" \| "watching" }` |
| DELETE | /watches/:id | Delete |
| POST | /watches/:id/check | Check now |
| POST | /events/:id/feedback | `{ value: "useful" \| "not_useful" \| null }` |
| GET | /sources | Ready-made watches |
