import type {
	AuthenticatedUser,
	IdentityProvider,
} from "../../application/identity_provider";
import type { RegisterUser } from "../../application/register_user";
import { UserAlreadyRegisteredError } from "../../application/user_already_registered_error";

interface RegisterUserRouteDependencies {
	identityProvider: IdentityProvider;
	registerUser: RegisterUser;
}

function jsonResponse(body: object, status: number): Response {
	return Response.json(body, { status });
}

function getBearerToken(request: Request): string | null {
	const authorization = request.headers.get("Authorization");

	if (!authorization?.startsWith("Bearer ")) {
		return null;
	}

	const token = authorization.slice("Bearer ".length).trim();

	return token || null;
}

async function getCurrency(request: Request): Promise<string | null> {
	try {
		const body: unknown = await request.json();

		if (
			typeof body !== "object" ||
			body === null ||
			!("currency" in body) ||
			typeof body.currency !== "string"
		) {
			return null;
		}

		return body.currency;
	} catch {
		return null;
	}
}

export function createRegisterUserRoute({
	identityProvider,
	registerUser,
}: RegisterUserRouteDependencies): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		const accessToken = getBearerToken(request);

		if (!accessToken) {
			return jsonResponse({ message: "Unauthorized" }, 401);
		}

		let authenticatedUser: AuthenticatedUser | null;

		try {
			authenticatedUser = await identityProvider.getUser(accessToken);
		} catch {
			return jsonResponse({ message: "Internal server error" }, 500);
		}

		if (!authenticatedUser) {
			return jsonResponse({ message: "Unauthorized" }, 401);
		}

		const currency = await getCurrency(request);

		if (!currency) {
			return jsonResponse({ message: "Currency is required" }, 422);
		}

		try {
			const user = await registerUser.execute({
				id: authenticatedUser.id,
				name: authenticatedUser.name,
				email: authenticatedUser.email,
				currency,
			});

			return jsonResponse(user, 201);
		} catch (error) {
			if (error instanceof UserAlreadyRegisteredError) {
				return jsonResponse({ message: "User already registered" }, 409);
			}

			if (error instanceof Error) {
				return jsonResponse({ message: "Invalid user data" }, 422);
			}

			throw error;
		}
	};
}
