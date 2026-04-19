const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

interface DateParts {
	year: number;
	month: number;
	day: number;
}

function parseDateOnlyParts(value: string): DateParts | null {
	const match = DATE_ONLY_PATTERN.exec(value);

	if (!match) {
		return null;
	}

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const parsedDate = new Date(Date.UTC(year, month - 1, day));

	if (
		parsedDate.getUTCFullYear() !== year ||
		parsedDate.getUTCMonth() !== month - 1 ||
		parsedDate.getUTCDate() !== day
	) {
		return null;
	}

	return { year, month, day };
}

export function isValidDateOnlyString(value: string): boolean {
	return parseDateOnlyParts(value) !== null;
}

export function formatDateOnlyString(value: string): string {
	const parsedDate = parseDateOnlyParts(value);

	if (!parsedDate) {
		return value;
	}

	return new Intl.DateTimeFormat("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "UTC",
	}).format(
		new Date(Date.UTC(parsedDate.year, parsedDate.month - 1, parsedDate.day)),
	);
}

export function getTodayDateOnlyString(): string {
	const now = new Date();
	const year = String(now.getFullYear());
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}
