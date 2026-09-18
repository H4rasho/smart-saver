export class UserId {
	public readonly value: string;

	constructor(value: string) {
		const normalizedValue = value.trim();

		if (normalizedValue.length === 0) {
			throw new Error("User ID cannot be empty");
		}

		this.value = normalizedValue;
	}
}
