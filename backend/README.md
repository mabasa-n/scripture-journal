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

The current implementation includes health routes, Google auth routes, session cookie setup, and the Drizzle schema.

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
