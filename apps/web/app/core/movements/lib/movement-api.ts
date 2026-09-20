import type { MovementWithCategoryAndMovementType } from "@/app/core/movements/types/movement-type";
import { auth } from "@clerk/nextjs/server";

interface NewMovementRequest {
	name: string;
	amount: number;
	category_id: number | null;
	movement_type_id: number;
	transaction_date: string;
}

async function movementRequest(
	method: "GET" | "POST",
	body?: NewMovementRequest,
): Promise<Response> {
	const { getToken, userId } = await auth();
	if (!userId) throw new Error("User not authenticated");
	const token = await getToken();
	if (!token) throw new Error("User session token not found");
	const apiUrl = (process.env.API_URL ?? "http://localhost:3001").replace(
		/\/$/,
		"",
	);
	const response = await fetch(`${apiUrl}/movements`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			...(body ? { "Content-Type": "application/json" } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
		cache: "no-store",
	});
	if (!response.ok)
		throw new Error(
			`Movement API request failed with status ${response.status}`,
		);
	return response;
}

export async function createMovementViaApi(
	movement: NewMovementRequest,
): Promise<void> {
	await movementRequest("POST", movement);
}

export async function listMovementsViaApi(): Promise<
	MovementWithCategoryAndMovementType[]
> {
	const response = await movementRequest("GET");
	return (await response.json()) as MovementWithCategoryAndMovementType[];
}
