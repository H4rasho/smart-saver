import { CONFIG } from "@/config/config";
import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
	schema: "./app/core/**/model/*.ts",
	out: "./database/migrations",
	dialect: "turso",
	dbCredentials: {
		url: CONFIG.DATABASE_URL,
		authToken: CONFIG.DATABASE_AUTH_TOKEN,
	},
} satisfies Config;
