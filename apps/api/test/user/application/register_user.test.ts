import { describe, expect, test } from "bun:test";

import { RegisterUser } from "../../../src/user/application/register_user";
import { UserAlreadyRegisteredError } from "../../../src/user/application/user_already_registered_error";
import type { User } from "../../../src/user/domain/user";
import type { UserRepository } from "../../../src/user/domain/user_repository";
import type { UserEmail } from "../../../src/user/domain/value_objects/user_email";
import type { UserId } from "../../../src/user/domain/value_objects/user_id";

class InMemoryUserRepository implements UserRepository {
	private readonly users: User[] = [];

	constructor(private readonly shouldSave = true) {}

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
		if (!this.shouldSave) {
			return false;
		}

		this.users.push(user);
		return true;
	}
}

describe("RegisterUser", () => {
	test("registers a user", async () => {
		const registerUser = new RegisterUser(new InMemoryUserRepository());

		const user = await registerUser.execute({
			id: "user_123",
			name: "Ada Lovelace",
			email: "ada@example.com",
			currency: "CLP",
		});

		expect(user).toEqual({
			id: "user_123",
			name: "Ada Lovelace",
			email: "ada@example.com",
			currency: "CLP",
		});
	});

	test("rejects a user that is already registered", async () => {
		const registerUser = new RegisterUser(new InMemoryUserRepository());
		const input = {
			id: "user_123",
			name: "Ada Lovelace",
			email: "ada@example.com",
			currency: "CLP",
		};

		await registerUser.execute(input);

		await expect(registerUser.execute(input)).rejects.toBeInstanceOf(
			UserAlreadyRegisteredError,
		);
	});

	test("rejects a conflicting concurrent registration", async () => {
		const registerUser = new RegisterUser(new InMemoryUserRepository(false));

		await expect(
			registerUser.execute({
				id: "user_123",
				name: "Ada Lovelace",
				email: "ada@example.com",
				currency: "CLP",
			}),
		).rejects.toBeInstanceOf(UserAlreadyRegisteredError);
	});
});
