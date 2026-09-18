import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

import type { User } from "../../domain/user";
import type { UserRepository } from "../../domain/user_repository";
import type { UserEmail } from "../../domain/value_objects/user_email";
import type { UserId } from "../../domain/value_objects/user_id";
import { toDomainUser } from "./user_mapper";
import { users } from "./user_schema";

export class DrizzleUserRepository implements UserRepository {
	constructor(private readonly database: LibSQLDatabase) {}

	async findById(userId: UserId): Promise<User | null> {
		const [row] = await this.database
			.select({
				clerkId: users.clerkId,
				name: users.name,
				email: users.email,
				currency: users.currency,
			})
			.from(users)
			.where(eq(users.clerkId, userId.value));

		return row ? toDomainUser(row) : null;
	}

	async findByEmail(email: UserEmail): Promise<User | null> {
		const [row] = await this.database
			.select({
				clerkId: users.clerkId,
				name: users.name,
				email: users.email,
				currency: users.currency,
			})
			.from(users)
			.where(eq(users.email, email.value));

		return row ? toDomainUser(row) : null;
	}

	async save(user: User): Promise<boolean> {
		const primitives = user.toPrimitives();

		const result = await this.database
			.insert(users)
			.values({
				clerkId: primitives.id,
				name: primitives.name,
				email: primitives.email,
				currency: primitives.currency,
			})
			.onConflictDoNothing()
			.run();

		return result.rowsAffected > 0;
	}
}
