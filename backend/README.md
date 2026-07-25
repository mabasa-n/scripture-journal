# Scripture Backend

Fastify, TypeScript, Drizzle, and Postgres backend for the Scripture application.

## Structure

```text
src/
├── config
├── db
├── middleware
├── modules
│   └── auth
├── routes
├── services
├── tests
└── utils
```

The current implementation includes health routes, Google auth routes, a signed JWT stored in an HttpOnly session cookie, protected scripture entry CRUD routes, and the Drizzle schema.

## API

Authentication:

```text
POST /api/auth/login
POST /api/auth/logout
```

Scripture entries require the `session` HttpOnly cookie:

```text
POST /api/scripture-entries
GET /api/scripture-entries
GET /api/scripture-entries/:id
PUT /api/scripture-entries/:id
PATCH /api/scripture-entries/:id
DELETE /api/scripture-entries/:id
```

## Scripts

```sh
npm run dev
npm run build
npm start
npm run typecheck
npm run db:generate
npm run db:migrate
```

## Environment

Use `backend/.env.example` as the service-level environment template.
