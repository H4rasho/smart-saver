import { describe, expect, test } from "vitest";

import type {
	AuthenticatedUser,
	IdentityProvider,
} from "../../../src/user/application/identity_provider";
import { RegisterUser } from "../../../src/user/application/register_user";
import type { User } from "../../../src/user/domain/user";
import type { UserRepository } from "../../../src/user/domain/user_repository";
import type { UserEmail } from "../../../src/user/domain/value_objects/user_email";
import type { UserId } from "../../../src/user/domain/value_objects/user_id";
import { createRegisterUserRoute } from "../../../src/user/presentation/http/register_user_route";

class InMemoryUserRepository implements UserRepository {
	private readonly users: User[] = [];

	async findById(userId: UserId): Promise<User | null> {
		return this.users.find((user) => user.id.value === userId.value) ?? null;
	}

	async findByEmail(email: UserEmail): Promise<User | null> {
		return (
			this.users.find((user) => user.toPrimitives().email === email.value) ??
			null
		);
	}

	async save(user: User): Promise<boolean> {
		this.users.push(user);
		return true;
	}
}

class StaticIdentityProvider implements IdentityProvider {
	constructor(private readonly user: AuthenticatedUser | null) {}

	async getUser(): Promise<AuthenticatedUser | null> {
		return this.user;
	}
}

function createRoute(): (request: Request) => Promise<Response> {
	return createRegisterUserRoute({
		identityProvider: new StaticIdentityProvider({
			id: "user_123",
			name: "Ada Lovelace",
			email: "ada@example.com",
		}),
		registerUser: new RegisterUser(new InMemoryUserRepository()),
	});
}

function createRequest(body: object, token = "token"): Request {
	return new Request("http://localhost:3001/users", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
}

describe("POST /users", () => {
	test("registers the authenticated user", async () => {
		const response = await createRoute()(createRequest({ currency: "clp" }));

		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({
			id: "user_123",
			name: "Ada Lovelace",
			email: "ada@example.com",
			currency: "CLP",
		});
	});

	test("rejects an unauthenticated request", async () => {
		const request = new Request("http://localhost:3001/users", {
			method: "POST",
			body: JSON.stringify({ currency: "CLP" }),
		});

		const response = await createRoute()(request);

		expect(response.status).toBe(401);
	});

	test("rejects a request without a currency", async () => {
		const response = await createRoute()(createRequest({}));

		expect(response.status).toBe(422);
	});

	test("rejects an existing user", async () => {
		const route = createRoute();

		await route(createRequest({ currency: "CLP" }));
		const response = await route(createRequest({ currency: "CLP" }));

		expect(response.status).toBe(409);
	});
});
