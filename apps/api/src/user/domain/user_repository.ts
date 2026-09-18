import type { User } from "./user";
import type { UserEmail } from "./value_objects/user_email";
import type { UserId } from "./value_objects/user_id";

export interface UserRepository {
	findById(userId: UserId): Promise<User | null>;
	findByEmail(email: UserEmail): Promise<User | null>;
	save(user: User): Promise<boolean>;
}
