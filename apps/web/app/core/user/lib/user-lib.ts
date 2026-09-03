const CURRENCY_LOCALES: Record<string, string> = {
	ARS: "es-AR",
	BRL: "pt-BR",
	CLP: "es-CL",
	COP: "es-CO",
	EUR: "es-ES",
	GBP: "en-GB",
	MXN: "es-MX",
	PEN: "es-PE",
	USD: "en-US",
};

interface FormatCurrencyAmountOptions {
	absolute?: boolean;
	maximumFractionDigits?: number;
	minimumFractionDigits?: number;
}

function normalizeIntegerPart(value: string): string {
	const sanitizedValue = value.replace(/\D/g, "");
	const normalizedValue = sanitizedValue.replace(/^0+(?=\d)/, "");

	return normalizedValue === "" ? "0" : normalizedValue;
}

export function getLocaleAndCurrency(currency: string): {
	locale: string;
	currency: string;
} {
	const normalizedCurrency = currency.trim().toUpperCase() || "CLP";

	return {
		locale: CURRENCY_LOCALES[normalizedCurrency] ?? "es-ES",
		currency: normalizedCurrency,
	};
}

export function formatCurrencyAmount(
	amount: number | string,
	currency: string,
	options: FormatCurrencyAmountOptions = {},
): string {
	const parsedAmount = typeof amount === "string" ? Number(amount) : amount;
	const safeAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
	const normalizedAmount = options.absolute ? Math.abs(safeAmount) : safeAmount;
	const { locale, currency: resolvedCurrency } = getLocaleAndCurrency(currency);

	try {
		return new Intl.NumberFormat(locale, {
			style: "currency",
			currency: resolvedCurrency,
			maximumFractionDigits: options.maximumFractionDigits,
			minimumFractionDigits: options.minimumFractionDigits,
		}).format(normalizedAmount);
	} catch {
		return `${resolvedCurrency} ${new Intl.NumberFormat(locale, {
			maximumFractionDigits: options.maximumFractionDigits ?? 2,
			minimumFractionDigits: options.minimumFractionDigits ?? 0,
		}).format(normalizedAmount)}`;
	}
}

export function getCurrencyFractionDigits(currency: string): number {
	const { locale, currency: resolvedCurrency } = getLocaleAndCurrency(currency);

	try {
		const resolvedOptions = new Intl.NumberFormat(locale, {
			style: "currency",
			currency: resolvedCurrency,
		}).resolvedOptions();

		return resolvedOptions.maximumFractionDigits ?? 2;
	} catch {
		return 2;
	}
}

export function normalizeCurrencyAmountInput(
	rawValue: string,
	currency: string,
): string {
	const sanitizedValue = rawValue.trim().replace(/[^\d.,]/g, "");

	if (sanitizedValue === "") {
		return "";
	}

	if (!/\d/.test(sanitizedValue)) {
		return "";
	}

	const fractionDigits = getCurrencyFractionDigits(currency);

	if (fractionDigits === 0) {
		return normalizeIntegerPart(sanitizedValue.replace(/[.,]/g, ""));
	}

	const lastDotIndex = sanitizedValue.lastIndexOf(".");
	const lastCommaIndex = sanitizedValue.lastIndexOf(",");
	const decimalSeparatorIndex = Math.max(lastDotIndex, lastCommaIndex);

	if (decimalSeparatorIndex === -1) {
		return normalizeIntegerPart(sanitizedValue);
	}

	const integerPart = normalizeIntegerPart(
		sanitizedValue.slice(0, decimalSeparatorIndex),
	);
	const fractionPart = sanitizedValue
		.slice(decimalSeparatorIndex + 1)
		.replace(/\D/g, "");

	if (fractionPart.length === 0 || fractionPart.length > fractionDigits) {
		return normalizeIntegerPart(sanitizedValue.replace(/[.,]/g, ""));
	}

	return `${integerPart}.${fractionPart.slice(0, fractionDigits)}`;
}

export function formatCurrencyAmountInputValue(
	amount: number | string,
	currency: string,
): string {
	const parsedAmount = typeof amount === "string" ? Number(amount) : amount;

	if (!Number.isFinite(parsedAmount)) {
		return "";
	}

	return formatCurrencyAmount(parsedAmount, currency);
}
