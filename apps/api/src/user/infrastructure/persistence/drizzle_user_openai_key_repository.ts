import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { decryptMovementField } from "../../../movement/infrastructure/persistence/movement_crypto.js";
import { users } from "./user_schema.js";

export class DrizzleUserOpenAIKeyRepository {
	constructor(private readonly database: LibSQLDatabase) {}

	async getKey(clerkId: string): Promise<string | null> {
		const [user] = await this.database
			.select({ key: users.openAiApiKey })
			.from(users)
			.where(eq(users.clerkId, clerkId))
			.limit(1);
		return user?.key ? decryptMovementField(user.key).trim() || null : null;
	}
}
