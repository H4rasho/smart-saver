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
