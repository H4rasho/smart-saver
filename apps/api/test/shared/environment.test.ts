import { describe, expect, test } from "vitest";

import { resolveShortcutTimeZone } from "../../src/shared/config/environment";

describe("shortcut time zone configuration", () => {
	test("defaults to America/Santiago", () => {
		expect(resolveShortcutTimeZone()).toBe("America/Santiago");
	});

	test("accepts valid IANA time zones", () => {
		expect(resolveShortcutTimeZone("Europe/Madrid")).toBe("Europe/Madrid");
	});

	test("rejects invalid IANA time zones", () => {
		expect(() => resolveShortcutTimeZone("not-a-time-zone")).toThrow(
			"SMARTSAVER_SHORTCUT_TIME_ZONE must be a valid IANA time zone",
		);
	});
});
