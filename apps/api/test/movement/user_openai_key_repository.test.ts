import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { expect, it, vi } from "vitest";
import { encryptMovementField } from "../../src/movement/infrastructure/persistence/movement_crypto.js";
import { DrizzleUserOpenAIKeyRepository } from "../../src/user/infrastructure/persistence/drizzle_user_openai_key_repository.js";

it("decrypts only the configured owner's key and observes removal", async () => {
	vi.stubEnv("ENCRYPTION_KEY", "ab".repeat(32));
	const client = createClient({ url: "file::memory:" });
	try {
		await client.execute(
			"CREATE TABLE users (clerk_id TEXT, openai_api_key TEXT)",
		);
		await client.execute({
			sql: "INSERT INTO users VALUES (?, ?), (?, ?)",
			args: [
				"owner",
				encryptMovementField("sk-owner"),
				"other",
				encryptMovementField("sk-other"),
			],
		});
		const repository = new DrizzleUserOpenAIKeyRepository(drizzle(client));
		await expect(repository.getKey("owner")).resolves.toBe("sk-owner");
		await expect(repository.getKey("missing")).resolves.toBeNull();
		await client.execute(
			"UPDATE users SET openai_api_key = NULL WHERE clerk_id = 'owner'",
		);
		await expect(repository.getKey("owner")).resolves.toBeNull();
		await client.execute(
			"UPDATE users SET openai_api_key = 'invalid:cipher:text' WHERE clerk_id = 'owner'",
		);
		await expect(repository.getKey("owner")).rejects.toThrow();
	} finally {
		client.close();
		vi.unstubAllEnvs();
	}
});
