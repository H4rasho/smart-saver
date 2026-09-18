export interface Environment {
	clerkSecretKey: string;
	databaseUrl: string;
	databaseAuthToken: string;
}

function getRequiredVariable(name: string): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} environment variable is required`);
	}

	return value;
}

export function getEnvironment(): Environment {
	return {
		clerkSecretKey: getRequiredVariable("CLERK_SECRET_KEY"),
		databaseUrl: getRequiredVariable("TURSO_DATABASE_URL"),
		databaseAuthToken: getRequiredVariable("TURSO_AUTH_TOKEN"),
	};
}
