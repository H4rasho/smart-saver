# AGENTS.md - SmartSaver Development Guide

## Project Overview

SmartSaver is a personal finance management application built with Next.js 15, TypeScript, Drizzle ORM, and Playwright for testing.

## Build, Lint, and Test Commands

### Package Manager
This project uses **pnpm** as the package manager.

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter (ESLint + Next.js)
pnpm lint
```

### Running Tests

```bash
# Run all Playwright tests
pnpm test

# Run a single test file
pnpm playwright test e2e/homepage.spec.ts

# Run tests matching a pattern (grep)
pnpm playwright test --grep "homepage"

# Run tests in headed mode (see browser)
pnpm playwright test --headed

# Run tests for a specific project (browser)
pnpm playwright test --project=chromium

# Run tests with UI mode
pnpm playwright test --ui
```

### Database Commands

```bash
# Generate Drizzle schema
pnpm db:generate

# Run migrations
pnpm db:migrate

# Run migrations in production
pnpm db:migrate:prod

# Open Drizzle Studio
pnpm db:studio
```

### Pre-commit Hooks
Lefthook is configured to run Biome on staged files before commits.

---

## Code Style Guidelines

### General Principles

- **Language**: TypeScript with strict mode
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 with shadcn/ui components

### Formatting (Biome)

Configuration is in `biome.json`:

- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes in JavaScript/TypeScript
- **Semicolons**: Required at the end of statements
- **Organize imports**: Enabled (auto-sort imports)

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | snake_case | `user_actions.ts`, `movement_repository.ts` |
| Variables | camelCase | `const userId = ...` |
| Functions | camelCase | `function getUserById()` |
| Types/Interfaces | PascalCase | `interface User`, `type Movement` |
| Components | PascalCase | `function Button()` |
| Constants | UPPER_SNAKE_CASE | `const MAX_AMOUNT = 1000` |
| Database tables | snake_case (plural) | `movements`, `categories` |

### Import Organization

Organize imports in the following order (use Biome to auto-sort):

1. External libraries (React, Next.js, Clerk, etc.)
2. Internal absolute imports (`@/app/core/...`)
3. Internal relative imports (`../`, `./`)
4. Type imports (`import type { ... }`)

```typescript
// Example import order
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserById } from "@/app/core/user/actions/user-actions";
import type { User } from "@/app/core/user/types/user-types";
```

### TypeScript Guidelines

- **Always use explicit types** for function parameters and return values
- Use `type` for simple type aliases, `interface` for object shapes
- Use `import type` for type-only imports
- Avoid `any` - use `unknown` when type is truly unknown

```typescript
// Good
function getUserById(id: number): Promise<User | null> { ... }

// Avoid
function getUserById(id) { ... }
```

### Component Patterns

- Use functional components with TypeScript
- Use `function` declarations (not arrow functions) for components
- Use shadcn/ui components from `components/ui/`
- Use `cn()` utility from `@/lib/utils` for className merging

```typescript
// Component example
import { cn } from "@/lib/utils";

function MyComponent({
  className,
  variant = "default",
  ...props
}: MyComponentProps) {
  return (
    <div className={cn("base-classes", variant === "default" && "default-style", className)}>
      ...
    </div>
  );
}
```

### Server Actions

- Mark server-side code with `"use server"` at the top of the file
- Handle errors with try/catch and return error objects
- Use `revalidatePath()` when mutating data

```typescript
"use server";

export async function updateUserCurrency(
  currency: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // ... mutation logic
    revalidatePath("/settings");
    return { success: true, message: "Updated" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to update" };
  }
}
```

### Error Handling

- Throw descriptive errors in Spanish (project language)
- Wrap async operations in try/catch
- Return error objects from server actions, don't throw to UI

```typescript
// Good - returns error object
return { success: false, message: "No se pudo guardar el movimiento" };

// Also acceptable - throw with message
throw new Error("No clerk id found");
```

### Database (Drizzle ORM)

- Use repository pattern in `app/core/*/repository/`
- Define schemas in `app/core/*/model/`
- Types in `app/core/*/types/`
- Use query builders (not raw SQL unless necessary)

```typescript
// Repository example
export async function getUserByClerkId(clerkId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerk_id, clerkId));
  return user ?? null;
}
```

### Testing (Playwright)

- E2E tests go in `e2e/` directory
- Use `test.describe` to group related tests
- Use `test.beforeEach` for setup
- Use Playwright's built-in assertions (`expect`)

```typescript
test.describe("Movements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/movements");
  });

  test("should create a new movement", async ({ page }) => {
    await page.getByRole("button", { name: "Add Movement" }).click();
    // ...
  });
});
```

---

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── core/              # Business logic (features)
│   │   ├── categories/
│   │   ├── movements/
│   │   ├── user/
│   │   └── ...
│   ├── layout.tsx
│   └── page.tsx           # Homepage
├── components/
│   └── ui/                # shadcn/ui components
├── database/             # Drizzle configuration
├── e2e/                   # Playwright tests
├── lib/                   # Utilities
└── schemas/              # Zod schemas
```

---

## Cursor Rules (Applied)

This project includes Cursor-specific rules (in `.cursor/rules/`):

- `project-structure.mdc`: Directory organization guidelines
- `typescript-style.mdc`: TypeScript conventions

---

## Common Tasks

### Adding a new UI component
Use shadcn/ui CLI or copy from existing components in `components/ui/`.

### Adding a new database model
1. Create schema in `app/core/*/model/`
2. Add types in `app/core/*/types/`
3. Create repository functions in `app/core/*/repository/`
4. Run `pnpm db:generate` then `pnpm db:migrate`

### Adding a new page
1. Create route in `app/[route]/page.tsx`
2. Add Server Actions in `app/core/*/actions/`
3. Create components in `components/`
