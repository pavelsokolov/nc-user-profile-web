# user-profile-web

Frontend for user profile management. Built with React, TypeScript, Vite, and Firebase Auth (phone number). Deployed to Firebase Hosting.

## Prerequisites

- Node.js 22+
- pnpm
- A Firebase project with Authentication (phone provider) enabled

## Local setup

```bash
git clone <repo-url> && cd nc-user-profile-web
pnpm install
cp .env.example .env
```

Edit `.env` and fill in your Firebase config values. You can find them in the Firebase Console under **Project Settings → General → Your apps → Web app**.

```
VITE_API_BASE_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Run with pnpm

```bash
pnpm dev
```

Opens at `http://localhost:5173`.

### Run with Docker Compose (both services)

See `docker-compose.yml` in the **nc-user-profile-api** repo. Both repos must be cloned as siblings. From the API repo:

```bash
docker compose up --build
```

- API: `http://localhost:8080`
- Frontend: `http://localhost:3000`

### Run frontend standalone with Docker

```bash
docker build -t user-profile-web \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  --build-arg VITE_FIREBASE_API_KEY=your-api-key \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com \
  --build-arg VITE_FIREBASE_PROJECT_ID=your-project-id \
  .

docker run --rm -p 3000:80 user-profile-web
```

Opens at `http://localhost:3000`.

> **Note:** Vite inlines `VITE_*` env vars at build time, so they must be passed as `--build-arg` during `docker build`, not at `docker run`.

## Testing

```bash
pnpm test
```

## Deployment

Deployed to Firebase Hosting. Build output is the `dist/` directory. SPA routing is handled by `firebase.json` rewrites.
