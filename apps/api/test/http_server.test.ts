import {
	type ClientRequest,
	type Server,
	request as httpRequest,
} from "node:http";

import { describe, expect, test } from "vitest";

import { createApiServer } from "../src/http_server";
import { handleRequest } from "../src/server";

async function listen(server: Server): Promise<number> {
	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			server.off("error", reject);
			resolve();
		});
	});
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("No port");
	return address.port;
}

describe("local Node HTTP server", () => {
	test("answers health before an unfinished chunked request body ends", async () => {
		const server = createApiServer(handleRequest);
		const port = await listen(server);

		let client: ClientRequest | undefined;
		try {
			const response = await new Promise<{ status: number; body: string }>(
				(resolve, reject) => {
					client = httpRequest({
						host: "127.0.0.1",
						port,
						path: "/health",
						method: "GET",
						headers: { "Transfer-Encoding": "chunked" },
					});
					client.setTimeout(1000, () =>
						client?.destroy(new Error("Timed out")),
					);
					client.on("error", reject);
					client.on("response", async (incoming) => {
						let body = "";
						for await (const chunk of incoming) body += chunk;
						resolve({ status: incoming.statusCode ?? 0, body });
					});
					client.write("unfinished");
				},
			);
			expect(response).toEqual({ status: 200, body: '{"status":"ok"}' });
		} finally {
			client?.destroy();
			server.closeAllConnections();
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
	});

	test("streams a POST body to the request handler", async () => {
		const server = createApiServer(async (request) =>
			Response.json({ body: await request.text() }),
		);
		const port = await listen(server);

		try {
			const response = await new Promise<{ status: number; body: string }>(
				(resolve, reject) => {
					const client = httpRequest({
						host: "127.0.0.1",
						port,
						path: "/echo",
						method: "POST",
					});
					client.on("error", reject);
					client.on("response", async (incoming) => {
						let body = "";
						for await (const chunk of incoming) body += chunk;
						resolve({ status: incoming.statusCode ?? 0, body });
					});
					client.write("first ");
					client.end("second");
				},
			);
			expect(response).toEqual({
				status: 200,
				body: '{"body":"first second"}',
			});
		} finally {
			server.closeAllConnections();
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
	});
});
