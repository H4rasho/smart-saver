export class MovementTypeId {
	public readonly value: number;

	constructor(value: number) {
		if (!Number.isSafeInteger(value) || value <= 0) {
			throw new Error("Movement type ID must be a positive safe integer");
		}
		this.value = value;
	}
}
