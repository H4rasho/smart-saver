export class MovementId {
	public readonly value: number;

	constructor(value: number) {
		if (!Number.isSafeInteger(value) || value <= 0) {
			throw new Error("Movement ID must be a positive safe integer");
		}
		this.value = value;
	}
}
