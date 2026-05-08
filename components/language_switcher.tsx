"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

const LOCALES = ["es", "en"] as const;

interface LanguageSwitcherProps {
	className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
	const currentLocale = useLocale();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const t = useTranslations("languageSwitcher");
	const queryString = searchParams.toString();
	const href = queryString ? `${pathname}?${queryString}` : pathname;

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 p-1 text-sm text-foreground shadow-sm backdrop-blur",
				className,
			)}
			aria-label={t("label")}
		>
			{LOCALES.map((locale) => {
				const isActive = currentLocale === locale;
				const label = locale === "es" ? t("spanish") : t("english");
				const ariaLabel =
					locale === "es" ? t("switchToSpanish") : t("switchToEnglish");

				return (
					<Link
						key={locale}
						href={href}
						locale={locale}
						aria-label={ariaLabel}
						aria-current={isActive ? "true" : undefined}
						className={cn(
							"rounded-full px-3 py-1.5 font-medium transition-colors",
							isActive
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						{label}
					</Link>
				);
			})}
		</div>
	);
}
