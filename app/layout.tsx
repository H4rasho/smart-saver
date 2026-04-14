import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BoneyardRegistry } from "./bones/registry";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "SmartSaver - Gestión Inteligente de Finanzas Personales",
		template: "%s | SmartSaver",
	},
	description:
		"Administra tus finanzas personales de forma segura con encriptación AES-256-GCM. Controla gastos, ingresos y categorías con inteligencia artificial.",
	keywords: [
		"finanzas personales",
		"control de gastos",
		"presupuesto",
		"ahorro",
		"gestión financiera",
		"encriptación",
		"seguridad financiera",
	],
	authors: [{ name: "SmartSaver Team" }],
	creator: "SmartSaver",
	publisher: "SmartSaver",
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	),
	openGraph: {
		type: "website",
		locale: "es_ES",
		url: "/",
		title: "SmartSaver - Gestión Inteligente de Finanzas Personales",
		description:
			"Administra tus finanzas personales de forma segura con encriptación AES-256-GCM. Controla gastos, ingresos y categorías con inteligencia artificial.",
		siteName: "SmartSaver",
	},
	twitter: {
		card: "summary_large_image",
		title: "SmartSaver - Gestión Inteligente de Finanzas Personales",
		description:
			"Administra tus finanzas personales de forma segura con encriptación AES-256-GCM.",
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="es" suppressHydrationWarning>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<BoneyardRegistry />
						{children}
						<Toaster />
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
