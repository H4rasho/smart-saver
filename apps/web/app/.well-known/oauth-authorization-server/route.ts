import {
	authServerMetadataHandlerClerk,
	metadataCorsOptionsRequestHandler,
} from "@clerk/mcp-tools/next";

const handler = authServerMetadataHandlerClerk();
const optionsHandler = metadataCorsOptionsRequestHandler();

export async function OPTIONS(): Promise<Response> {
	return optionsHandler();
}

export { handler as GET };
