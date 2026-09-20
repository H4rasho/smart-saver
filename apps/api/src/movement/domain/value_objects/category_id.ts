export class CategoryId {
	public readonly value: number;

	constructor(value: number) {
		if (!Number.isSafeInteger(value) || value <= 0) {
			throw new Error("Category ID must be a positive safe integer");
		}
		this.value = value;
	}
}
