# Application Patterns

## Components

- Use functional components with TypeScript.
- Declare components with `function`, not arrow functions.
- Reuse shadcn/ui primitives from `components/ui/`.
- Use `cn()` from `@/lib/utils` to merge class names.

```tsx
import { cn } from "@/lib/utils";

function Example({ className, ...props }: ExampleProps): React.ReactNode {
	return <div className={cn("base-styles", className)} {...props} />;
}
```

## Server Actions

- Add `"use server"` at the beginning of Server Action modules.
- Catch operational failures and return result objects instead of throwing errors to the UI.
- Call `revalidatePath()` after mutations when cached route data must be refreshed.

```typescript
"use server";

export async function updateUserCurrency(
	currency: string,
): Promise<{ success: boolean; message: string }> {
	try {
		await saveUserCurrency(currency);
		revalidatePath("/settings");
		return { success: true, message: "Moneda actualizada" };
	} catch (error) {
		console.error("Failed to update user currency", error);
		return { success: false, message: "No se pudo actualizar la moneda" };
	}
}
```

## Errors

- Use descriptive error messages.
- Keep messages displayed to users in Spanish.
- Do not expose internal error details to the UI.
- Log enough context for server-side diagnosis.

## Database

- Access Drizzle through repositories under `app/core/<feature>/repository/`.
- Define tables under `app/core/<feature>/model/` and related domain types under `app/core/<feature>/types/`.
- Prefer Drizzle query builders over raw SQL.
- Use raw SQL only when the query builder cannot express the required operation clearly.

```typescript
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.clerk_id, clerkId));

	return user ?? null;
}
```
