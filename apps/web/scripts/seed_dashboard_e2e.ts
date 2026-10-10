import { readFile, readdir } from "node:fs/promises";
import { createClient } from "@libsql/client";
import { encrypt, encryptNumber } from "../lib/encryption";
async function main(): Promise<void> {
	const url = process.env.TURSO_DATABASE_URL;
	const user = process.env.DASHBOARD_E2E_USER_ID;
	if (
		!url?.startsWith("file:") ||
		!url.includes("dashboard-e2e") ||
		!user ||
		!process.env.ENCRYPTION_KEY
	) {
		throw new Error(
			"Use a dedicated dashboard-e2e local SQLite file, a Clerk test user and a test encryption key",
		);
	}
	const client = createClient({ url });
	try {
		const migrations = (await readdir("database/migrations"))
			.filter((name) => name.endsWith(".sql"))
			.sort();
		for (const file of migrations)
			await client.executeMultiple(
				await readFile(`database/migrations/${file}`, "utf8"),
			);
		await client.execute({
			sql: "INSERT INTO users (email,name,currency,clerk_id) VALUES (?,?,?,?)",
			args: ["dashboard@example.test", "Dashboard Fixture", "CLP", user],
		});
		await client.execute({
			sql: "INSERT INTO users (email,name,currency,clerk_id) VALUES (?,?,?,?)",
			args: [
				"other@example.test",
				"Other Fixture",
				"CLP",
				"dashboard-other-fixture",
			],
		});
		await client.executeMultiple(
			"INSERT OR IGNORE INTO movement_types (id,name) VALUES (901,'INCOME'),(902,'EXPENSE'),(903,'FIXED_EXPENSE');",
		);
		for (const [owner, date, amount, type] of [
			[user, "2024-01-01", 100000, 901],
			[user, "2024-01-31", 25000, 903],
			[user, "2024-02-01", 300000, 901],
			[user, "2024-02-29", 50000, 902],
			["dashboard-other-fixture", "2024-01-01", 999999, 901],
		] as const) {
			await client.execute({
				sql: "INSERT INTO movements (clerk_id,name,amount,movement_type_id,transaction_date,is_recurring) VALUES (?,?,?,?,?,0)",
				args: [
					owner,
					encrypt("Synthetic dashboard fixture"),
					encryptNumber(amount),
					type,
					date,
				],
			});
		}
		console.log("Created isolated dashboard fixtures");
	} finally {
		client.close();
	}
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
