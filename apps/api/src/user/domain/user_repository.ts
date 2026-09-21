import type { User } from "./user.js";
import type { UserEmail } from "./value_objects/user_email.js";
import type { UserId } from "./value_objects/user_id.js";

export interface UserRepository {
	findById(userId: UserId): Promise<User | null>;
	findByEmail(email: UserEmail): Promise<User | null>;
	save(user: User): Promise<boolean>;
}
