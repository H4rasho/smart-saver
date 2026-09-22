export interface Environment {
	clerkSecretKey: string;
	databaseUrl: string;
	databaseAuthToken: string;
	shortcutApiKey: string | null;
	shortcutOwnerUserId: string | null;
	shortcutTimeZone: string;
	openaiApiKey: string | null;
	shortcutOpenaiModel: string;
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

export function resolveShortcutTimeZone(value?: string | null): string {
	const timeZone = value ?? "America/Santiago";
	try {
		new Intl.DateTimeFormat("en", { timeZone }).format();
	} catch {
		throw new Error(
			"SMARTSAVER_SHORTCUT_TIME_ZONE must be a valid IANA time zone",
		);
	}
	return timeZone;
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
		shortcutTimeZone: resolveShortcutTimeZone(
			getOptionalVariable("SMARTSAVER_SHORTCUT_TIME_ZONE"),
		),
		openaiApiKey: getOptionalVariable("OPENAI_API_KEY"),
		shortcutOpenaiModel:
			getOptionalVariable("SMARTSAVER_SHORTCUT_OPENAI_MODEL") ?? "gpt-5.4",
	};
}
