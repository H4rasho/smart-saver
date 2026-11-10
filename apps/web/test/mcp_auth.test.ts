import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getMcpResourceUrl, selectPublicProfile } from "../lib/mcp-config";

const originalResourceUrl = process.env.MCP_RESOURCE_URL;

afterEach(() => {
	if (originalResourceUrl === undefined)
		Reflect.deleteProperty(process.env, "MCP_RESOURCE_URL");
	else process.env.MCP_RESOURCE_URL = originalResourceUrl;
});

test("MCP uses the localhost endpoint only in development", () => {
	Reflect.deleteProperty(process.env, "MCP_RESOURCE_URL");
	assert.equal(getMcpResourceUrl("development"), "http://localhost:3000/mcp");

	assert.throws(() => getMcpResourceUrl("production"), /MCP_RESOURCE_URL/);
});

test("MCP requires a canonical HTTPS endpoint in production", () => {
	process.env.MCP_RESOURCE_URL = "https://money.example.com/mcp";
	assert.equal(
		getMcpResourceUrl("production"),
		"https://money.example.com/mcp",
	);

	for (const invalidUrl of [
		"http://money.example.com/mcp",
		"https://money.example.com/mcp/",
		"https://money.example.com/mcp?x=1",
		"https://money.example.com/other",
	]) {
		process.env.MCP_RESOURCE_URL = invalidUrl;
		assert.throws(() => getMcpResourceUrl("production"), /MCP_RESOURCE_URL/);
	}
});

test("MCP returns only consented public profile fields", () => {
	const user = {
		id: "user_1",
		firstName: "Ada",
		lastName: "Lovelace",
		imageUrl: "https://example.com/ada.png",
		primaryEmailAddressId: "email_2",
		emailAddresses: [
			{ id: "email_1", emailAddress: "other@example.com" },
			{ id: "email_2", emailAddress: "ada@example.com" },
		],
		privateMetadata: { secret: "do not expose" },
	};
	const profile = selectPublicProfile(user);
	assert.deepEqual(profile, {
		id: "user_1",
		firstName: "Ada",
		lastName: "Lovelace",
		imageUrl: "https://example.com/ada.png",
		email: "ada@example.com",
	});
});
