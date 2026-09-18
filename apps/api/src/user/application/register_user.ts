import { User } from "../domain/user";
import type { UserRepository } from "../domain/user_repository";
import { UserEmail } from "../domain/value_objects/user_email";
import { UserId } from "../domain/value_objects/user_id";
import { UserAlreadyRegisteredError } from "./user_already_registered_error";

export interface RegisterUserInput {
	id: string;
	name: string;
	email: string;
	currency: string;
}

export type RegisterUserOutput = {
	id: string;
	name: string;
	email: string;
	currency: string;
};

export class RegisterUser {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
		const userId = new UserId(input.id);
		const email = new UserEmail(input.email);
		const [userWithId, userWithEmail] = await Promise.all([
			this.userRepository.findById(userId),
			this.userRepository.findByEmail(email),
		]);

		if (userWithId || userWithEmail) {
			throw new UserAlreadyRegisteredError();
		}

		const user = User.create(input.id, input.name, input.email, input.currency);

		const wasSaved = await this.userRepository.save(user);

		if (!wasSaved) {
			throw new UserAlreadyRegisteredError();
		}

		return user.toPrimitives();
	}
}
