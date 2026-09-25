import { describe, expect, test } from "vitest";

import { User } from "../../../src/user/domain/user";

describe("User", () => {
	test("normalizes its primitive values", () => {
		const user = User.create(
			" user_123 ",
			" Ada Lovelace ",
			" ADA@EXAMPLE.COM ",
			" clp ",
		);

		expect(user.toPrimitives()).toEqual({
			id: "user_123",
			name: "Ada Lovelace",
			email: "ada@example.com",
			currency: "CLP",
		});
	});

	test("rejects an invalid email", () => {
		expect(() => User.create("user_123", "Ada", "invalid", "CLP")).toThrow(
			"User email is invalid",
		);
	});
});
