# Project Architecture

SmartSaver uses the Next.js App Router. Organize business logic by feature under `app/core/`.

```text
app/
├── api/                   # API routes
├── core/                  # Feature-oriented business logic and UI
├── globals.css            # Global styles
├── layout.tsx             # Root layout
└── page.tsx               # Main entry page
components/
└── ui/                    # Shared shadcn/ui primitives
database/                  # Drizzle configuration and migrations
e2e/                       # Playwright end-to-end tests
lib/                       # Shared utilities and integrations
schemas/                   # Shared Zod schemas
```

Feature directories may contain the following layers when needed:

```text
app/core/<feature>/
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

Use an existing shadcn/ui primitive from `components/ui/` or add one through the shadcn CLI. Keep composed, feature-specific components under `app/core/<feature>/components/`.

### Add a database model

1. Define the schema under `app/core/<feature>/model/`.
2. Add domain types under `app/core/<feature>/types/`.
3. Add database operations under `app/core/<feature>/repository/`.
4. Run `pnpm db:generate` and then `pnpm db:migrate`.

### Add a page

1. Create the route in `app/<route>/page.tsx`.
2. Put feature logic and Server Actions under `app/core/<feature>/`.
3. Keep reusable primitives under `components/ui/`.
