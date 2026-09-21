import type {
	AuthenticatedUser,
	IdentityProvider,
} from "../../../user/application/identity_provider.js";
import {
	InvalidMovementReferenceError,
	type Movements,
} from "../../application/movements.js";
import { validateNewMovement } from "../../domain/movement.js";

interface Dependencies {
	identityProvider: IdentityProvider;
	movements: Movements;
}

export function createMovementRoute({
	identityProvider,
	movements,
}: Dependencies): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		const authorization = request.headers.get("Authorization");
		const token = authorization?.startsWith("Bearer ")
			? authorization.slice(7).trim()
			: "";
		if (!token)
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		let user: AuthenticatedUser | null;
		try {
			user = await identityProvider.getUser(token);
		} catch {
			return Response.json(
				{ message: "Internal server error" },
				{ status: 500 },
			);
		}
		if (!user)
			return Response.json({ message: "Unauthorized" }, { status: 401 });

		if (request.method === "GET") {
			return Response.json(
				(await movements.list(user.id)).map((movement) =>
					movement.toPrimitives(),
				),
			);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			body = null;
		}
		const movement = validateNewMovement(body);
		if (!movement)
			return Response.json(
				{ message: "Invalid movement data" },
				{ status: 422 },
			);
		try {
			return Response.json(
				(await movements.create(user.id, movement)).toPrimitives(),
				{
					status: 201,
				},
			);
		} catch (error) {
			if (error instanceof InvalidMovementReferenceError) {
				return Response.json({ message: error.message }, { status: 422 });
			}
			throw error;
		}
	};
}
