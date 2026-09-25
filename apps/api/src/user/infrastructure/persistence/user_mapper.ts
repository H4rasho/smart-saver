import { User } from "../../domain/user.js";

export type UserRow = {
	clerkId: string;
	name: string;
	email: string;
	currency: string;
};

export function toDomainUser(row: UserRow): User {
	return User.fromPrimitives({
		id: row.clerkId,
		name: row.name,
		email: row.email,
		currency: row.currency,
	});
}
