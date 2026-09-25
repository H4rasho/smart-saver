import "dotenv/config";

import { createApiServer } from "./http_server.js";
import { handleRequest } from "./server.js";

const port = Number(process.env.PORT ?? 3001);

const server = createApiServer(handleRequest);

server.listen(port, () => {
	console.log(`API listening on http://localhost:${port}`);
});
