# user-profile-web

React frontend for user profile management with Firebase phone authentication.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

App runs at http://localhost:5173

## Docker Compose

Use Docker Compose from **nc-user-profile-api** (repos must be siblings):

```bash
cd ../nc-user-profile-api
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8080
- Emulator UI: http://localhost:4000

SMS codes: `curl http://localhost:9099/emulator/v1/projects/demo-project/verificationCodes`
