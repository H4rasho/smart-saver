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
import { CreateMovementSchema } from "@/app/core/movements/types/movement-type";
import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
	createMcpHandler,
	experimental_withMcpAuth as withMcpAuth,
} from "@vercel/mcp-adapter";
import { z } from "zod";

const clerk = await clerkClient();

const handler = createMcpHandler((server) => {
	server.tool(
		"get-clerk-user-data",
		"Gets data about the Clerk user that authorized this request",
		{}, // tool parameters here if present
		async (_, context) => {
			// Try to read user id from authInfo; fallback to Clerk auth() if missing
			let userId = context?.authInfo?.extra?.userId as string | undefined;
			if (!userId) {
				const clerkAuth = await auth({ acceptsToken: "oauth_token" });
				userId = clerkAuth?.userId ?? undefined;
			}

			if (!userId) {
				return {
					content: [{ type: "text", text: "Unauthorized: missing user id" }],
				};
			}
			const userData = await clerk.users.getUser(userId);

			return {
				content: [{ type: "text", text: JSON.stringify(userData) }],
			};
		},
	);

	server.tool(
		"get-current-month-movements",
		"Gets all expenses and incomes movements of the current month for the user",
		{},
		async (_, context) => {
			let userId = context?.authInfo?.extra?.userId as string | undefined;
			if (!userId) {
				const clerkAuth = await auth({ acceptsToken: "oauth_token" });
				userId = clerkAuth?.userId ?? undefined;
			}
			if (!userId) {
				return {
					content: [{ type: "text", text: "Unauthorized: missing user id" }],
				};
			}
			const movements = await getCurrentMonthMovements(userId);
			return {
				content: [{ type: "text", text: JSON.stringify(movements) }],
			};
		},
	);

	server.tool(
		"get-all-movements",
		"Gets all historical expenses and incomes movements of the user",
		{},
		async (_, context) => {
			let userId = context?.authInfo?.extra?.userId as string | undefined;
			if (!userId) {
				const clerkAuth = await auth({ acceptsToken: "oauth_token" });
				userId = clerkAuth?.userId ?? undefined;
			}
			if (!userId) {
				return {
					content: [{ type: "text", text: "Unauthorized: missing user id" }],
				};
			}
			const movements = await getAllMovements(userId);
			return {
				content: [{ type: "text", text: JSON.stringify(movements) }],
			};
		},
	);

	server.tool(
		"get-movements-grouped-by-category",
		"Gets all historical expenses and incomes movements grouped by category for the user",
		{},
		async (_, context) => {
			let userId = context?.authInfo?.extra?.userId as string | undefined;
			if (!userId) {
				const clerkAuth = await auth({ acceptsToken: "oauth_token" });
				userId = clerkAuth?.userId ?? undefined;
			}
			if (!userId) {
				return {
					content: [{ type: "text", text: "Unauthorized: missing user id" }],
				};
			}
			const groupedMovements = await getMovementsGroupedByCategory(userId);
			return {
				content: [{ type: "text", text: JSON.stringify(groupedMovements) }],
			};
		},
	);

	server.tool(
		"get-user-categories",
		"Gets all categories of the user",
		{},
		async (_, context) => {
			let userId = context?.authInfo?.extra?.userId as string | undefined;
			if (!userId) {
				const clerkAuth = await auth({ acceptsToken: "oauth_token" });
				userId = clerkAuth?.userId ?? undefined;
			}
			if (!userId) {
				return {
					content: [{ type: "text", text: "Unauthorized: missing user id" }],
				};
			}
			const categories = await getUserCategoriesAction(userId);
			return {
				content: [{ type: "text", text: JSON.stringify(categories) }],
			};
		},
	);

	server.tool(
		"create-category",
		"Creates a new category for the authorized user",
		{
			name: z.string().min(1, "Category name is required"),
		},
		async (params, context) => {
			try {
				let userId = context?.authInfo?.extra?.userId as string | undefined;
				if (!userId) {
					const clerkAuth = await auth({ acceptsToken: "oauth_token" });
					userId = clerkAuth?.userId ?? undefined;
				}
				if (!userId) {
					return {
						content: [{ type: "text", text: "Unauthorized: missing user id" }],
					};
				}

				const result = await createCategory(userId, params.name as string);

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(result),
						},
					],
				};
			} catch (error) {
				console.error(error);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: false,
								message:
									error instanceof Error
										? error.message
										: "Error creating category",
							}),
						},
					],
				};
			}
		},
	);

	server.tool(
		"get-movement-types",
		"Gets all available movement types",
		{},
		async () => {
			try {
				const movementTypes = await getMovementTypes();
				return {
					content: [{ type: "text", text: JSON.stringify(movementTypes) }],
				};
			} catch (error) {
				console.error(error);
				return {
					content: [{ type: "text", text: "Error getting movement types" }],
				};
			}
		},
	);

	server.tool(
		"create-movement",
		"Creates a movement for the authorized user",
		{
			movement: CreateMovementSchema,
		},
		async (params, context) => {
			try {
				let userId = context?.authInfo?.extra?.userId as string | undefined;
				if (!userId) {
					const clerkAuth = await auth({ acceptsToken: "oauth_token" });
					userId = clerkAuth?.userId ?? undefined;
				}
				if (!userId) {
					return {
						content: [{ type: "text", text: "Unauthorized: missing user id" }],
					};
				}

				const movementData = params.movement;

				console.log({ movementData });

				// Validate the movement data
				validateMovementData(movementData);

				// Create the movement
				const createdMovement = await createMovementForUser(
					movementData,
					userId,
				);

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: true,
								movement: createdMovement,
								message: "Movement created successfully",
							}),
						},
					],
				};
			} catch (error) {
				console.error(error);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: false,
								error:
									error instanceof Error
										? error.message
										: "Error creating movement",
							}),
						},
					],
				};
			}
		},
	);

	server.tool(
		"update-movement",
		"Updates an existing movement for the authorized user",
		{
			id: z.number().int().positive("ID must be a positive integer"),
			name: z.string().min(1, "Name is required"),
			amount: z.number(),
			category_id: z.number().int().positive().nullable(),
			transaction_date: z.string().nullable(),
		},
		async (params, context) => {
			try {
				let userId = context?.authInfo?.extra?.userId as string | undefined;
				if (!userId) {
					const clerkAuth = await auth({ acceptsToken: "oauth_token" });
					userId = clerkAuth?.userId ?? undefined;
				}
				if (!userId) {
					return {
						content: [{ type: "text", text: "Unauthorized: missing user id" }],
					};
				}

				// Verify movement belongs to user
				const userMovements = await getAllMovements(userId);
				const movement = userMovements.find((m) => m.id === params.id);

				if (!movement) {
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify({
									success: false,
									message: "Movement not found or does not belong to user",
								}),
							},
						],
					};
				}

				await updateMovement(params.id, {
					name: params.name,
					amount: params.amount,
					category_id: params.category_id,
					transaction_date: params.transaction_date,
				});

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: true,
								message: "Movement updated successfully",
							}),
						},
					],
				};
			} catch (error) {
				console.error(error);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: false,
								message:
									error instanceof Error
										? error.message
										: "Error updating movement",
							}),
						},
					],
				};
			}
		},
	);
});

const authHandler = withMcpAuth(
	handler,
	async (_, token) => {
		const clerkAuth = await auth({ acceptsToken: "oauth_token" });
		// Note: OAuth tokens are machine tokens. Machine token usage is free
		// during our public beta period but will be subject to pricing once
		// generally available. Pricing is expected to be competitive and below
		// market averages.
		return verifyClerkToken(clerkAuth, token);
	},
	{
		required: true,
		resourceMetadataPath: "/.well-known/oauth-protected-resource/mcp",
	},
);

export { authHandler as GET, authHandler as POST };
