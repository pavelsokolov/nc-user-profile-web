# nc-user-profile-web

React SPA for user profile management with Firebase phone auth.

**Related:** backend repo — [nc-user-profile-api](https://github.com/pavelsokolov/nc-user-profile-api)

## Tech stack

React 19, TypeScript 5.6, Vite 6, Firebase SDK 11 (phone auth + reCAPTCHA), Bootstrap 5.3, CSS Modules, react-international-phone, ESLint 9, Prettier 3, pnpm.

## Structure

```
src/
├── components/
│   ├── LoginForm.tsx          # Phone auth (send code → verify)
│   └── ProfileForm.tsx        # Profile editing (name, email)
├── styles/                    # CSS Modules
├── App.tsx                    # Auth state, conditional rendering
├── api.ts                     # API client (Bearer token)
├── config.ts                  # Env var loader
├── firebase.ts                # Firebase init + emulator support
└── main.tsx
```

## Setup (local)

```bash
pnpm install
cp .env.example .env
pnpm dev  # http://localhost:5173
```

## Environment variables

Required: `VITE_API_BASE_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`

Firebase values are found in the [Firebase Console](https://console.firebase.google.com/) → Project Settings → General → "Your apps" → Web app config snippet. For the emulator workflow, use any placeholder project ID (e.g. `demo-project`).

Optional: `VITE_FIREBASE_AUTH_EMULATOR_URL` — set to the Auth emulator URL (e.g. `http://localhost:9099`) to bypass real SMS verification during local development.

## Scripts

- `pnpm dev` — dev server with hot reload
- `pnpm build` — tsc + production build → `dist/`
- `pnpm preview` — preview production build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier (auto-fix)
- `pnpm format:check` — Prettier (check only)

## Setup (Docker Compose)

Alternatively, run the full stack (frontend + API + Firebase emulator) from the sibling `nc-user-profile-api` repo:

```bash
cd ../nc-user-profile-api && docker compose up --build
```

Frontend: `:3000` | API: `:8080` | Emulator UI: `:4000` | Auth emulator: `:9099`

SMS verification codes: `curl http://localhost:9099/emulator/v1/projects/demo-project/verificationCodes`

## Deployment (Firebase Hosting)

```bash
pnpm build
firebase deploy --only hosting
```

Requires the [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`) and being logged in (`firebase login`). The `firebase.json` is pre-configured to serve `dist/` with SPA rewrites.
