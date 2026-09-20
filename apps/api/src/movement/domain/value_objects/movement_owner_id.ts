export class MovementOwnerId {
	public readonly value: string;

	constructor(value: string) {
		const normalizedValue = value.trim();
		if (normalizedValue.length === 0) {
			throw new Error("Movement owner ID cannot be empty");
		}
		this.value = normalizedValue;
	}
}
