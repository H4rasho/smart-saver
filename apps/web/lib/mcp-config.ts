export const REQUIRED_SCOPES = ["profile", "email"];
export const RESOURCE_METADATA_PATH =
	"/.well-known/oauth-protected-resource/mcp";

export function getMcpResourceUrl(
	environment: string | undefined = process.env.NODE_ENV,
): string {
	const configuredUrl = process.env.MCP_RESOURCE_URL;
	if (!configuredUrl && environment !== "development") {
		throw new Error("MCP_RESOURCE_URL must be configured for the MCP server");
	}

	const resourceUrl = configuredUrl ?? "http://localhost:3000/mcp";
	const parsedUrl = new URL(resourceUrl);
	if (
		parsedUrl.pathname !== "/mcp" ||
		parsedUrl.search ||
		parsedUrl.hash ||
		(parsedUrl.protocol !== "https:" &&
			!(parsedUrl.protocol === "http:" && parsedUrl.hostname === "localhost"))
	) {
		throw new Error("MCP_RESOURCE_URL must be the exact HTTPS /mcp endpoint");
	}
	return parsedUrl.href;
}

interface ProfileSource {
	id: string;
	firstName: string | null;
	lastName: string | null;
	imageUrl: string;
	primaryEmailAddressId: string | null;
	emailAddresses: Array<{ id: string; emailAddress: string }>;
}

export function selectPublicProfile(user: ProfileSource) {
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		imageUrl: user.imageUrl,
		email:
			user.emailAddresses.find(
				(address) => address.id === user.primaryEmailAddressId,
			)?.emailAddress ?? null,
	};
}
