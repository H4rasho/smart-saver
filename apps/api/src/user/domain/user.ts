import { UserCurrency } from "./value_objects/user_currency.js";
import { UserEmail } from "./value_objects/user_email.js";
import { UserId } from "./value_objects/user_id.js";
import { UserName } from "./value_objects/user_name.js";

export type UserPrimitives = {
	id: string;
	name: string;
	email: string;
	currency: string;
};

export class User {
	private constructor(
		public readonly id: UserId,
		private readonly name: UserName,
		private readonly email: UserEmail,
		private readonly currency: UserCurrency,
	) {}

	static create(
		id: string,
		name: string,
		email: string,
		currency: string,
	): User {
		return new User(
			new UserId(id),
			new UserName(name),
			new UserEmail(email),
			new UserCurrency(currency),
		);
	}

	static fromPrimitives(primitives: UserPrimitives): User {
		return new User(
			new UserId(primitives.id),
			new UserName(primitives.name),
			new UserEmail(primitives.email),
			new UserCurrency(primitives.currency),
		);
	}

	toPrimitives(): UserPrimitives {
		return {
			id: this.id.value,
			name: this.name.value,
			email: this.email.value,
			currency: this.currency.value,
		};
	}
}
