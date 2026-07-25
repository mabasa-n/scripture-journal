# Scripture

Scripture is a React and Fastify application with Google sign-in, a JWT session stored in an HttpOnly cookie, and a Postgres-backed schema prepared for user-owned scripture entries.

## Structure

```text
.
├── backend
│   ├── migrations
│   └── src
│       ├── config
│       ├── db
│       ├── middleware
│       ├── modules
│       │   └── auth
│       ├── routes
│       ├── services
│       ├── tests
│       └── utils
├── frontend
│   └── src
│       ├── api
│       ├── app
│       ├── auth
│       ├── components
│       ├── config
│       ├── hooks
│       ├── pages
│       ├── styles
│       └── tests
└── .github
    └── workflows
```

## Current Scope

The current implementation includes:

- Google login in the frontend.
- Backend verification of the Google credential.
- A signed JWT session token stored in an HttpOnly cookie.
- A logout endpoint.
- A health endpoint.
- Protected REST API CRUD routes for user-owned scripture entries.
- Drizzle schema definitions for users and scripture entries.

Scripture entry frontend pages are not implemented yet.

The placeholder directories are intentionally empty until the existing feature set grows into them.

## Environment

Copy `backend/.env.example` to `backend/.env` for backend and database settings.

Copy `frontend/.env.example` to `frontend/.env` for Vite frontend settings.

## Local Development

Start Postgres:

```sh
docker compose up -d postgres_db
```

Run the backend:

```sh
cd backend
npm run dev
```

Run the frontend:

```sh
cd frontend
npm run dev
```

## Database

The Drizzle schema lives in `backend/src/db/schema.ts`.

Generate migrations:

```sh
cd backend
npm run db:generate
```

Run migrations:

```sh
cd backend
npm run db:migrate
```

## Backend API

Authentication:

- `POST /api/auth/login`
- `POST /api/auth/logout`

Scripture entries require the `session` HttpOnly cookie:

- `POST /api/scripture-entries`
- `GET /api/scripture-entries`
- `GET /api/scripture-entries/:id`
- `PUT /api/scripture-entries/:id`
- `PATCH /api/scripture-entries/:id`
- `DELETE /api/scripture-entries/:id`

## Production Build

Backend:

```sh
cd backend
npm run build
npm start
```

Frontend:

```sh
cd frontend
npm run build
```

Containerized production-style compose:

```sh
docker compose --env-file frontend/.env -f docker-compose.prod.yml up --build
```
