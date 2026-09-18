export class UserName {
	public readonly value: string;

	constructor(value: string) {
		const normalizedValue = value.trim();

		if (normalizedValue.length === 0) {
			throw new Error("User name cannot be empty");
		}

		this.value = normalizedValue;
	}
}
