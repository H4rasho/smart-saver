import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import {
	getMessages,
	getTranslations,
	setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";

interface LocaleLayoutProps {
	children: React.ReactNode;
	params: Promise<{
		locale: string;
	}>;
}

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
	const { locale } = await params;
	const metadataLocale = hasLocale(routing.locales, locale)
		? locale
		: routing.defaultLocale;
	const t = await getTranslations({
		locale: metadataLocale,
		namespace: "metadata",
	});

	return {
		title: {
			absolute: t("title"),
		},
		description: t("description"),
		keywords: [
			"finanzas personales",
			"personal finance",
			"control de gastos",
			"expense tracking",
			"presupuesto",
			"budgeting",
			"ahorro",
			"savings",
			"gestión financiera",
			"financial management",
			"encryption",
		],
		authors: [{ name: "SmartSaver Team" }],
		creator: "SmartSaver",
		publisher: "SmartSaver",
		metadataBase: new URL(
			process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
		),
		openGraph: {
			type: "website",
			locale: metadataLocale === "es" ? "es_ES" : "en_US",
			url:
				metadataLocale === routing.defaultLocale ? "/" : `/${metadataLocale}`,
			title: t("title"),
			description: t("description"),
			siteName: "SmartSaver",
		},
		twitter: {
			card: "summary_large_image",
			title: t("title"),
			description: t("twitterDescription"),
			creator: "@smartsaver",
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		icons: {
			icon: "/favicon.ico",
			shortcut: "/favicon.ico",
			apple: "/apple-touch-icon.png",
		},
		manifest: "/manifest.json",
	};
}

export default async function LocaleLayout({
	children,
	params,
}: LocaleLayoutProps) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);

	const messages = await getMessages();

	return (
		<NextIntlClientProvider messages={messages}>
			{children}
		</NextIntlClientProvider>
	);
}
