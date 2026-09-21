import { handleRequest } from "../src/server.js";

const REWRITE_PATH_PARAMETER = "__smartsaver_path";
const ROUTE_PATHS = new Set([
	"/health",
	"/users",
	"/movements",
	"/movements/shortcut",
]);

export function restoreRouteRequest(request: Request): Request | null {
	const url = new URL(request.url);
	const rewrittenPaths = url.searchParams.getAll(REWRITE_PATH_PARAMETER);

	if (rewrittenPaths.length > 1) return null;

	if (url.pathname === "/api/index") {
		const routePath = rewrittenPaths[0];
		if (!routePath || !ROUTE_PATHS.has(routePath)) return null;
		url.pathname = routePath;
	} else if (
		!ROUTE_PATHS.has(url.pathname) ||
		(rewrittenPaths.length === 1 && rewrittenPaths[0] !== url.pathname)
	) {
		return null;
	}

	if (rewrittenPaths.length === 0) return request;

	url.searchParams.delete(REWRITE_PATH_PARAMETER);
	return new Request(url.toString(), request);
}

export default {
	fetch(request: Request): Promise<Response> | Response {
		const routeRequest = restoreRouteRequest(request);
		return routeRequest
			? handleRequest(routeRequest)
			: new Response("Not Found", { status: 404 });
	},
};
