# Code Conventions

## General

- Use TypeScript in strict mode.
- Use tabs for indentation, double quotes, and semicolons.
- Let Biome organize imports and format supported files.
- Use `unknown` instead of `any` when a value's type is not known.
- Declare explicit types for function parameters and return values.
- Use `type` for simple aliases and `interface` for object shapes.
- Use `import type` for type-only imports.

The executable formatting rules for all workspaces are defined in [`biome.json`](../../biome.json). The web ESLint configuration is under `apps/web/eslint.config.mjs`.

## Naming

| Element | Convention | Example |
| --- | --- | --- |
| Files | snake_case | `user_actions.ts` |
| Variables | camelCase | `userId` |
| Functions | camelCase | `getUserById` |
| Types and interfaces | PascalCase | `Movement` |
| Components | PascalCase | `MovementForm` |
| Constants | UPPER_SNAKE_CASE | `MAX_AMOUNT` |
| Database tables | plural snake_case | `movement_types` |

## Imports

Organize imports in this order:

1. External libraries.
2. Internal absolute imports using `@/`.
3. Relative imports.
4. Type-only imports.

```typescript
import { useState } from "react";
import { getUserById } from "@/app/core/user/actions/user-actions";
import { Button } from "@/components/ui/button";
import type { User } from "@/app/core/user/types/user-types";
```
