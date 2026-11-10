import { createClerkClient } from "@clerk/backend";
import { verifyClerkToken } from "@clerk/mcp-tools/server";
import {
	RESOURCE_METADATA_PATH,
	getMcpResourceUrl,
	selectPublicProfile,
} from "./mcp-config";

function getClerkClient() {
	return createClerkClient({
		secretKey: process.env.CLERK_SECRET_KEY,
		publishableKey:
			process.env.CLERK_PUBLISHABLE_KEY ??
			process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
		apiUrl: process.env.CLERK_API_URL,
	});
}

export async function verifyMcpToken(request: Request) {
	try {
		const requestState = await getClerkClient().authenticateRequest(request, {
			acceptsToken: "oauth_token",
			audience: getMcpResourceUrl(),
		});
		if (!requestState.isAuthenticated) return undefined;

		const authInfo = verifyClerkToken(
			requestState.toAuth(),
			requestState.token,
		);
		return authInfo
			? {
					...authInfo,
					resourceMetadataUrl: new URL(
						RESOURCE_METADATA_PATH,
						getMcpResourceUrl(),
					).href,
				}
			: undefined;
	} catch (error) {
		console.error("MCP access token verification failed", error);
		return undefined;
	}
}

export async function getUserProfile(userId: string) {
	const user = await getClerkClient().users.getUser(userId);
	return selectPublicProfile(user);
}
