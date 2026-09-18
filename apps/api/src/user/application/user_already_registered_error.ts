export class UserAlreadyRegisteredError extends Error {
	constructor() {
		super("User is already registered");
		this.name = "UserAlreadyRegisteredError";
	}
}
