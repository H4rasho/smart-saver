import { CONFIG } from "@/config/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

async function runMigrations() {
	console.log("🚀 Starting database migrations...");

	try {
		const client = createClient({
			url: CONFIG.DATABASE_URL,
			authToken: CONFIG.DATABASE_AUTH_TOKEN,
		});

		const db = drizzle(client);

		await migrate(db, {
			migrationsFolder: "./database/migrations",
		});

		console.log("✅ Migrations completed successfully!");

		await client.close();
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
}

runMigrations();
