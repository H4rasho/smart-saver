export default {
	async fetch(): Promise<Response> {
		try {
			await import("../src/server");
			return Response.json({ status: "imported" });
		} catch (error) {
			console.error("API server import failed", error);
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
