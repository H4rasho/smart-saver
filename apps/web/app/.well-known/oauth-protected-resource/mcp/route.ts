import {
	metadataCorsOptionsRequestHandler,
	protectedResourceHandlerClerk,
} from "@clerk/mcp-tools/next";

const handler = protectedResourceHandlerClerk({
	scopes_supported: ["profile", "email"],
});

const optionsHandler = metadataCorsOptionsRequestHandler();

export async function OPTIONS(): Promise<Response> {
	return optionsHandler();
}

export { handler as GET };
