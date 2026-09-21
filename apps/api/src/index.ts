import "dotenv/config";

import { createApiServer } from "./http_server";
import { handleRequest } from "./server";

const port = Number(process.env.PORT ?? 3001);

const server = createApiServer(handleRequest);

server.listen(port, () => {
	console.log(`API listening on http://localhost:${port}`);
});
