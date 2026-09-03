# Project Architecture

SmartSaver is a pnpm monorepo. The Next.js application is under `apps/web`, and
the Bun API is under `apps/api`. Organize web business logic by feature under
`apps/web/app/core/`.

```text
apps/
├── api/
│   ├── src/               # Bun server
│   └── test/              # Bun tests
└── web/
    ├── app/               # Next.js routes and feature logic
    ├── components/ui/     # Shared shadcn/ui primitives
    ├── database/          # Drizzle configuration and migrations
    ├── e2e/               # Playwright end-to-end tests
    ├── lib/               # Shared web utilities and integrations
    └── schemas/           # Shared web Zod schemas
```

Feature directories may contain the following layers when needed:

```text
apps/web/app/core/<feature>/
├── actions/               # Server Actions
├── components/            # Feature-specific UI
├── const/                 # Feature constants and cache tags
├── functions/             # Domain operations
├── lib/                   # Feature utilities
├── model/                 # Drizzle table definitions
├── repository/            # Database access
└── types/                 # Feature types
```

Do not create empty layers. Place shared UI primitives in `components/ui/`; keep feature-specific components with their feature.

## Common Changes

### Add a UI component

Use an existing shadcn/ui primitive from `apps/web/components/ui/` or add one through the shadcn CLI from `apps/web`. Keep composed, feature-specific components under `apps/web/app/core/<feature>/components/`.

### Add a database model

1. Define the schema under `apps/web/app/core/<feature>/model/`.
2. Add domain types under `apps/web/app/core/<feature>/types/`.
3. Add database operations under `apps/web/app/core/<feature>/repository/`.
4. Run `pnpm db:generate` and then `pnpm db:migrate`.

### Add a page

1. Create the route in `apps/web/app/<route>/page.tsx`.
2. Put feature logic and Server Actions under `apps/web/app/core/<feature>/`.
3. Keep reusable primitives under `apps/web/components/ui/`.
