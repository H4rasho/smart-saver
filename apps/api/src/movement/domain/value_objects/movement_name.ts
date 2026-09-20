export class MovementName {
	public readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(value: string): MovementName {
		if (value.trim().length === 0) {
			throw new Error("Movement name cannot be empty");
		}
		return new MovementName(value.trim());
	}

	static fromStored(value: string): MovementName {
		return new MovementName(value);
	}
}
