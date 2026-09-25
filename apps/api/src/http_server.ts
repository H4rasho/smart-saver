import { type Server, createServer } from "node:http";
import { Readable } from "node:stream";

type RequestHandler = (request: Request) => Promise<Response> | Response;

export function createApiServer(handleRequest: RequestHandler): Server {
	return createServer(async (incoming, outgoing) => {
		try {
			const headers = new Headers();
			for (let index = 0; index < incoming.rawHeaders.length; index += 2) {
				headers.append(
					incoming.rawHeaders[index],
					incoming.rawHeaders[index + 1],
				);
			}

			const method = incoming.method ?? "GET";
			const requestInit: RequestInit & { duplex: "half" } = {
				method,
				headers,
				body:
					method === "GET" || method === "HEAD"
						? undefined
						: (Readable.toWeb(incoming) as ReadableStream<Uint8Array>),
				duplex: "half",
			};
			const request = new Request(
				new URL(
					incoming.url ?? "/",
					`http://${incoming.headers.host ?? "localhost"}`,
				),
				requestInit,
			);
			const response = await handleRequest(request);
			outgoing.writeHead(response.status, Object.fromEntries(response.headers));
			outgoing.end(Buffer.from(await response.arrayBuffer()));
		} catch (error) {
			console.error("API request failed", error);
			if (!outgoing.headersSent) outgoing.writeHead(500);
			outgoing.end("Internal Server Error");
		}
	});
}
