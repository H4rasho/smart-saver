import { createHash, timingSafeEqual } from "node:crypto";

import {
	InvalidMovementReferenceError,
	type Movements,
} from "../../application/movements.js";
import { validateNewMovement } from "../../domain/movement.js";

export const SHORTCUT_API_KEY_HEADER = "X-SmartSaver-Shortcut-Key";

interface Dependencies {
	apiKey: string;
	ownerUserId: string;
	movements: Movements;
}

function hasValidApiKey(
	providedApiKey: string | null,
	configuredApiKey: string,
): boolean {
	if (!providedApiKey || !configuredApiKey) return false;

	const providedDigest = createHash("sha256").update(providedApiKey).digest();
	const configuredDigest = createHash("sha256")
		.update(configuredApiKey)
		.digest();

	return timingSafeEqual(providedDigest, configuredDigest);
}

export function createShortcutMovementRoute({
	apiKey,
	ownerUserId,
	movements,
}: Dependencies): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return Response.json({ message: "Method not allowed" }, { status: 405 });
		}

		if (!hasValidApiKey(request.headers.get(SHORTCUT_API_KEY_HEADER), apiKey)) {
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}
		if (ownerUserId.trim().length === 0) {
			return Response.json(
				{ message: "Shortcut authentication is not configured" },
				{ status: 503 },
			);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			body = null;
		}
		const movement = validateNewMovement(body);
		if (!movement) {
			return Response.json(
				{ message: "Invalid movement data" },
				{ status: 422 },
			);
		}

		try {
			return Response.json(
				(await movements.create(ownerUserId, movement)).toPrimitives(),
				{ status: 201 },
			);
		} catch (error) {
			if (error instanceof InvalidMovementReferenceError) {
				return Response.json({ message: error.message }, { status: 422 });
			}
			throw error;
		}
	};
}
