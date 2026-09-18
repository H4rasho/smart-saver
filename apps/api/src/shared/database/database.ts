import { createClient } from "@libsql/client";
import { type LibSQLDatabase, drizzle } from "drizzle-orm/libsql";

export function createDatabase(
	databaseUrl: string,
	databaseAuthToken: string,
): LibSQLDatabase {
	const client = createClient({
		url: databaseUrl,
		authToken: databaseAuthToken,
	});

	return drizzle(client);
}
