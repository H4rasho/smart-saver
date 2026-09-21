export default {
	async fetch(): Promise<Response> {
		try {
			await import("../src/server");
			return Response.json({ status: "imported" });
		} catch (error) {
			const details =
				typeof error === "object" && error !== null
					? (error as Record<string, unknown>)
					: {};
			console.error("API server import failed", {
				name: details.name,
				code: details.code,
				specifier: details.specifier,
				referrer: details.referrer,
				message: details.message,
				text: String(error),
			});
			return Response.json(
				{
					status: "import_failed",
					error_name: error instanceof Error ? error.name : "UnknownError",
				},
				{ status: 500 },
			);
		}
	},
};
