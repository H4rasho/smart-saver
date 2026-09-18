const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

export class UserCurrency {
	public readonly value: string;

	constructor(value: string) {
		const normalizedValue = value.trim().toUpperCase();

		if (!CURRENCY_CODE_PATTERN.test(normalizedValue)) {
			throw new Error("User currency must be a three-letter ISO code");
		}

		this.value = normalizedValue;
	}
}
