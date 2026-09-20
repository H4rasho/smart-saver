export class MovementAmount {
	public readonly value: number;

	private constructor(value: number) {
		if (!Number.isFinite(value)) {
			throw new Error("Movement amount must be finite");
		}
		this.value = value;
	}

	static create(value: number): MovementAmount {
		if (value <= 0) {
			throw new Error("Movement amount must be a positive finite number");
		}
		return new MovementAmount(value);
	}

	static fromStored(value: number): MovementAmount {
		return new MovementAmount(value);
	}
}
