export class MovementDate {
	public readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(value: string): MovementDate {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
			throw new Error("Movement date must be YYYY-MM-DD");
		}
		const date = new Date(`${value}T00:00:00Z`);
		if (
			Number.isNaN(date.getTime()) ||
			date.toISOString().slice(0, 10) !== value
		) {
			throw new Error("Movement date must be a valid calendar date");
		}
		return new MovementDate(value);
	}

	static fromStored(value: string): MovementDate {
		return new MovementDate(value);
	}
}
