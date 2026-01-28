# user-profile-web

Frontend for user profile management. React, TypeScript, Vite, Firebase Auth.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

App runs at `http://localhost:5173`.

## Docker Compose (recommended)

Use Docker Compose from the **nc-user-profile-api** repo. Both repos must be siblings:

```
parent/
  nc-user-profile-api/
  nc-user-profile-web/
```

```bash
cd ../nc-user-profile-api
docker compose up --build
```

- API: http://localhost:8080
- Frontend: http://localhost:3000
- Emulator UI: http://localhost:4000

Get SMS verification codes:

```bash
curl http://localhost:9099/emulator/v1/projects/demo-project/verificationCodes
```

## Testing

```bash
pnpm test
```
