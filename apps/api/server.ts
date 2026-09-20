import { handleRequest } from "./src/server";

Bun.serve({
	fetch: handleRequest,
});
