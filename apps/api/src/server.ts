import { Movements } from "./movement/application/movements.js";
import { DrizzleMovementRepository } from "./movement/infrastructure/persistence/drizzle_movement_repository.js";
import { createMovementRoute } from "./movement/presentation/http/movement_route.js";
import { createShortcutMovementRoute } from "./movement/presentation/http/shortcut_movement_route.js";
import { getEnvironment } from "./shared/config/environment.js";
import { createDatabase } from "./shared/database/database.js";
import { RegisterUser } from "./user/application/register_user.js";
import { ClerkIdentityProvider } from "./user/infrastructure/auth/clerk_identity_provider.js";
import { DrizzleUserRepository } from "./user/infrastructure/persistence/drizzle_user_repository.js";
import { createRegisterUserRoute } from "./user/presentation/http/register_user_route.js";

const HEALTH_RESPONSE_BODY = '{"status":"ok"}';

let registerUserRoute: ((request: Request) => Promise<Response>) | undefined;
let movementRoute: ((request: Request) => Promise<Response>) | undefined;
let shortcutMovementRoute:
	| ((request: Request) => Promise<Response>)
	| undefined;

function getMovementRoute(): (request: Request) => Promise<Response> {
	if (!movementRoute) {
		const environment = getEnvironment();
		movementRoute = createMovementRoute({
			identityProvider: new ClerkIdentityProvider(environment.clerkSecretKey),
			movements: new Movements(
				new DrizzleMovementRepository(
					createDatabase(
						environment.databaseUrl,
						environment.databaseAuthToken,
					),
				),
			),
		});
	}
	return movementRoute;
}

function getShortcutMovementRoute(): (request: Request) => Promise<Response> {
	if (!shortcutMovementRoute) {
		const environment = getEnvironment();
		shortcutMovementRoute = createShortcutMovementRoute({
			apiKey: environment.shortcutApiKey ?? "",
			ownerUserId: environment.shortcutOwnerUserId ?? "",
			movements: new Movements(
				new DrizzleMovementRepository(
					createDatabase(
						environment.databaseUrl,
						environment.databaseAuthToken,
					),
				),
			),
		});
	}
	return shortcutMovementRoute;
}

function getRegisterUserRoute(): (request: Request) => Promise<Response> {
	if (!registerUserRoute) {
		const environment = getEnvironment();
		const userRepository = new DrizzleUserRepository(
			createDatabase(environment.databaseUrl, environment.databaseAuthToken),
		);

		registerUserRoute = createRegisterUserRoute({
			identityProvider: new ClerkIdentityProvider(environment.clerkSecretKey),
			registerUser: new RegisterUser(userRepository),
		});
	}

	return registerUserRoute;
}

export async function handleRequest(request: Request): Promise<Response> {
	const url = new URL(request.url);

	if (request.method === "GET" && url.pathname === "/health") {
		return new Response(HEALTH_RESPONSE_BODY, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	if (request.method === "POST" && url.pathname === "/users") {
		return getRegisterUserRoute()(request);
	}
	if (request.method === "POST" && url.pathname === "/movements/shortcut") {
		return getShortcutMovementRoute()(request);
	}
	if (
		(request.method === "GET" || request.method === "POST") &&
		url.pathname === "/movements"
	) {
		return getMovementRoute()(request);
	}

	return new Response("Not Found", { status: 404 });
}
