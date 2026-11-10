import { getUserCategoriesAction } from "@/app/core/categories/actions/categories-actions";
import { createCategory } from "@/app/core/categories/repository/categories-repository";
import { getMovementTypes } from "@/app/core/movement-types.ts/repository/movement-type-repository";
import {
	createMovementForUser,
	validateMovementData,
} from "@/app/core/movements/functions/movement-function";
import {
	getAllMovements,
	getCurrentMonthMovements,
	getMovementsGroupedByCategory,
	updateMovement,
} from "@/app/core/movements/repository/movements-repository";
import { getUserProfile, verifyMcpToken } from "@/lib/mcp-auth";
import {
	REQUIRED_SCOPES,
	RESOURCE_METADATA_PATH,
	getMcpResourceUrl,
} from "@/lib/mcp-config";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod-mcp";

const McpCreateMovementSchema = z.object({
	name: z.string(),
	amount: z.number(),
	category_id: z.number().int().positive().nullable(),
	movement_type_id: z.number().int().positive(),
	created_at: z.string(),
	transaction_date: z.string().nullable(),
});

interface ToolContext {
	http?: { authInfo?: { extra?: Record<string, unknown> } };
}

function authenticatedUserId(context: ToolContext): string {
	const userId = context.http?.authInfo?.extra?.userId;
	if (typeof userId !== "string" || !userId) {
		throw new Error("Missing authenticated user");
	}
	return userId;
}

function textResult(value: unknown) {
	return { content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

function errorResult(error: unknown, message: string) {
	console.error(message, error);
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify({ success: false, message }),
			},
		],
		isError: true,
	};
}

const handler = createMcpHandler((server) => {
	server.registerTool(
		"get-clerk-user-data",
		{ description: "Gets the authorized user's profile and primary email" },
		async (context) =>
			textResult(await getUserProfile(authenticatedUserId(context))),
	);

	server.registerTool(
		"get-current-month-movements",
		{ description: "Gets the authorized user's current-month movements" },
		async (context) =>
			textResult(await getCurrentMonthMovements(authenticatedUserId(context))),
	);

	server.registerTool(
		"get-all-movements",
		{ description: "Gets the authorized user's historical movements" },
		async (context) =>
			textResult(await getAllMovements(authenticatedUserId(context))),
	);

	server.registerTool(
		"get-movements-grouped-by-category",
		{ description: "Gets the authorized user's movements grouped by category" },
		async (context) =>
			textResult(
				await getMovementsGroupedByCategory(authenticatedUserId(context)),
			),
	);

	server.registerTool(
		"get-user-categories",
		{ description: "Gets the authorized user's categories" },
		async (context) =>
			textResult(await getUserCategoriesAction(authenticatedUserId(context))),
	);

	server.registerTool(
		"create-category",
		{
			description: "Creates a category for the authorized user",
			inputSchema: z.object({ name: z.string().min(1) }),
		},
		async ({ name }, context) => {
			try {
				return textResult(
					await createCategory(authenticatedUserId(context), name),
				);
			} catch (error) {
				return errorResult(error, "No se pudo crear la categoría");
			}
		},
	);

	server.registerTool(
		"get-movement-types",
		{ description: "Gets the available movement types" },
		async (context) => {
			authenticatedUserId(context);
			try {
				return textResult(await getMovementTypes());
			} catch (error) {
				return errorResult(
					error,
					"No se pudieron obtener los tipos de movimiento",
				);
			}
		},
	);

	server.registerTool(
		"create-movement",
		{
			description: "Creates a movement for the authorized user",
			inputSchema: z.object({ movement: McpCreateMovementSchema }),
		},
		async ({ movement }, context) => {
			try {
				const userId = authenticatedUserId(context);
				validateMovementData(movement);
				const createdMovement = await createMovementForUser(movement, userId);
				return textResult({ success: true, movement: createdMovement });
			} catch (error) {
				return errorResult(error, "No se pudo crear el movimiento");
			}
		},
	);

	server.registerTool(
		"update-movement",
		{
			description: "Updates an existing movement for the authorized user",
			inputSchema: z.object({
				id: z.number().int().positive(),
				name: z.string().min(1),
				amount: z.number(),
				category_id: z.number().int().positive().nullable(),
				transaction_date: z.string().nullable(),
			}),
		},
		async (params, context) => {
			try {
				const userId = authenticatedUserId(context);
				const userMovements = await getAllMovements(userId);
				if (!userMovements.some((movement) => movement.id === params.id)) {
					return {
						...textResult({
							success: false,
							message: "Movimiento no encontrado",
						}),
						isError: true,
					};
				}
				if (params.category_id !== null) {
					const categories = await getUserCategoriesAction(userId);
					if (
						!categories.some((category) => category.id === params.category_id)
					) {
						return {
							...textResult({ success: false, message: "Categoría no válida" }),
							isError: true,
						};
					}
				}
				await updateMovement(params.id, {
					name: params.name,
					amount: params.amount,
					category_id: params.category_id,
					transaction_date: params.transaction_date,
				});
				return textResult({ success: true, message: "Movimiento actualizado" });
			} catch (error) {
				return errorResult(error, "No se pudo actualizar el movimiento");
			}
		},
	);
});

async function authHandler(request: Request): Promise<Response> {
	const resourceUrl = getMcpResourceUrl();
	return withMcpAuth(handler, verifyMcpToken, {
		required: true,
		requiredScopes: REQUIRED_SCOPES,
		resourceUrl: new URL(resourceUrl).origin,
		resourceMetadataPath: RESOURCE_METADATA_PATH,
	})(request);
}

export { authHandler as GET, authHandler as POST };
