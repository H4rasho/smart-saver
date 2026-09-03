const HEALTH_RESPONSE_BODY = '{"status":"ok"}';

export function handleRequest(request: Request): Response {
	const url = new URL(request.url);

	if (request.method === "GET" && url.pathname === "/health") {
		return new Response(HEALTH_RESPONSE_BODY, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	return new Response("Not Found", { status: 404 });
}
