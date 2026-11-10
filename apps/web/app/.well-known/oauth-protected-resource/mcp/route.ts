import { REQUIRED_SCOPES, getMcpResourceUrl } from "@/lib/mcp-config";
import {
	metadataCorsOptionsRequestHandler,
	protectedResourceHandlerClerk,
} from "@clerk/mcp-tools/next";

function handler(request: Request): Response {
	return protectedResourceHandlerClerk({
		resource: getMcpResourceUrl(),
		scopes_supported: REQUIRED_SCOPES,
	})(request);
}

const optionsHandler = metadataCorsOptionsRequestHandler();

export async function OPTIONS(): Promise<Response> {
	return optionsHandler();
}

export { handler as GET };
