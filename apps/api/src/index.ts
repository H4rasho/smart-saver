import { handleRequest } from "./server";

const server = Bun.serve({
	port: 3001,
	fetch: handleRequest,
});

console.log(`API listening on ${server.url}`);
