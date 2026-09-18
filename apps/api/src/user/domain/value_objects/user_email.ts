const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserEmail {
	public readonly value: string;

	constructor(value: string) {
		const normalizedValue = value.trim().toLowerCase();

		if (!EMAIL_PATTERN.test(normalizedValue)) {
			throw new Error("User email is invalid");
		}

		this.value = normalizedValue;
	}
}
