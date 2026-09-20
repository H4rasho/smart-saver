export interface Environment {
	clerkSecretKey: string;
	databaseUrl: string;
	databaseAuthToken: string;
	shortcutApiKey: string | null;
	shortcutOwnerUserId: string | null;
}

function getRequiredVariable(name: string): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} environment variable is required`);
	}

	return value;
}

function getOptionalVariable(name: string): string | null {
	return process.env[name] || null;
}

export function getEnvironment(): Environment {
	return {
		clerkSecretKey: getRequiredVariable("CLERK_SECRET_KEY"),
		databaseUrl: getRequiredVariable("TURSO_DATABASE_URL"),
		databaseAuthToken: getRequiredVariable("TURSO_AUTH_TOKEN"),
		shortcutApiKey: getOptionalVariable("SMARTSAVER_SHORTCUT_API_KEY"),
		shortcutOwnerUserId: getOptionalVariable(
			"SMARTSAVER_SHORTCUT_OWNER_CLERK_USER_ID",
		),
	};
}
