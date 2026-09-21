# Domain Entity Conventions

Use this structure when implementing domain entities in the backend. Domain
entities encapsulate their state with Value Objects and do not depend on
frameworks, persistence libraries, aggregate root base classes, or domain
events.

## User Example

```typescript
import { UserCurrency } from "./user_currency";
import { UserEmail } from "./user_email";
import { UserId } from "./user_id";
import { UserName } from "./user_name";

export type UserPrimitives = {
	id: string;
	name: string;
	email: string;
	currency: string;
};

export class User {
	private constructor(
		public readonly id: UserId,
		private readonly name: UserName,
		private readonly email: UserEmail,
		private readonly currency: UserCurrency,
	) {}

	static create(
		id: string,
		name: string,
		email: string,
		currency: string,
	): User {
		return new User(
			new UserId(id),
			new UserName(name),
			new UserEmail(email),
			new UserCurrency(currency),
		);
	}

	static fromPrimitives(primitives: UserPrimitives): User {
		return new User(
			new UserId(primitives.id),
			new UserName(primitives.name),
			new UserEmail(primitives.email),
			new UserCurrency(primitives.currency),
		);
	}

	toPrimitives(): UserPrimitives {
		return {
			id: this.id.value,
			name: this.name.value,
			email: this.email.value,
			currency: this.currency.value,
		};
	}
}
```

## Rules

- Keep the constructor private so entities can only be created through named
  factory methods.
- Use `create` for new entities and enforce domain invariants through Value
  Objects.
- Use `fromPrimitives` to rebuild an existing entity from persistence.
- Use `toPrimitives` at system boundaries without exposing Value Objects.
- Keep entity state private and immutable unless the domain defines an explicit
  behavior that changes it.
- Do not extend a generic `AggregateRoot`, `Entity`, or `ValueObject` base class.
- Do not introduce domain events until the application has a concrete use case
  that requires them.
- Keep domain code independent from Node.js, Clerk, Drizzle, Zod, and HTTP.
- Name TypeScript files with `snake_case`.
