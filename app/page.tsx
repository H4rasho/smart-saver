import { LanguageSwitcher } from "@/components/language_switcher";
import { SignInCtaButton } from "@/components/sign_in_cta_button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CONFIG } from "@/config/config";
import {
	PieChart,
	Shield,
	Smartphone,
	TrendingDown,
	Wallet,
	Zap,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

const { APP_NAME } = CONFIG;
const CURRENT_YEAR = new Date().getFullYear();

export default async function LandingPage() {
	const t = await getTranslations("landing");
	const features = [
		{
			key: "automaticTracking",
			icon: TrendingDown,
			iconClassName: "text-blue-400",
			backgroundClassName: "from-blue-400/20 to-sky-400/20",
		},
		{
			key: "smartAnalysis",
			icon: PieChart,
			iconClassName: "text-purple-400",
			backgroundClassName: "from-purple-400/20 to-pink-400/20",
		},
		{
			key: "security",
			icon: Shield,
			iconClassName: "text-blue-400",
			backgroundClassName: "from-blue-400/20 to-indigo-400/20",
		},
		{
			key: "mobileFirst",
			icon: Smartphone,
			iconClassName: "text-orange-400",
			backgroundClassName: "from-orange-400/20 to-red-400/20",
		},
		{
			key: "smartBudgets",
			icon: Wallet,
			iconClassName: "text-blue-400",
			backgroundClassName: "from-blue-400/20 to-sky-400/20",
		},
		{
			key: "notifications",
			icon: Zap,
			iconClassName: "text-yellow-400",
			backgroundClassName: "from-yellow-400/20 to-orange-400/20",
		},
	] as const;

	return (
		<div className="min-h-screen bg-black text-white">
			{/* Header */}
			<header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-sky-400 rounded-lg flex items-center justify-center">
							<Wallet className="w-5 h-5 text-black" />
						</div>
						<span className="text-xl font-bold">{APP_NAME}</span>
					</div>
					<div className="flex items-center gap-3">
						<LanguageSwitcher className="border-gray-700 bg-gray-900/70 text-white" />
						<SignInCtaButton
							label={t("signIn")}
							variant="outline"
							className="border-gray-700 hover:bg-gray-800 bg-transparent"
						/>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16 md:py-24 text-center">
				<Badge
					variant="secondary"
					className="mb-6 bg-gray-800 text-gray-300 border-gray-700"
				>
					<Zap className="w-3 h-3 mr-1" />
					{t("badge")}
				</Badge>

				<h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
					{t("heroTitleFirst")}
					<br />
					<span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
						{t("heroTitleSecond")}
					</span>
				</h1>

				<p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
					{t("heroDescription")}
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<SignInCtaButton
						label={t("startFree")}
						size="lg"
						showArrow
						className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-black font-semibold px-8"
					/>
					<SignInCtaButton
						label={t("viewDemo")}
						variant="outline"
						size="lg"
						className="border-gray-700 hover:bg-gray-800 bg-transparent"
					/>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						{t("featuresTitle")}
					</h2>
					<p className="text-gray-400 text-lg max-w-2xl mx-auto">
						{t("featuresDescription")}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature) => {
						const Icon = feature.icon;

						return (
							<Card
								key={feature.key}
								className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors group"
							>
								<CardContent className="p-6">
									<div
										className={`w-12 h-12 bg-gradient-to-br ${feature.backgroundClassName} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
									>
										<Icon className={`w-6 h-6 ${feature.iconClassName}`} />
									</div>
									<h3 className="text-xl font-semibold mb-2">
										{t(`features.${feature.key}.title`)}
									</h3>
									<p className="text-gray-400">
										{t(`features.${feature.key}.description`)}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mx-auto px-4 py-16">
				<Card className="bg-gray-900 border-gray-700 shadow-2xl">
					<CardContent className="p-8 md:p-12 text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
							{t("ctaTitle")}
						</h2>
						<p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
							{t("ctaDescription", { appName: APP_NAME })}
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<SignInCtaButton
								label={t("createAccount")}
								size="lg"
								showArrow
								className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold px-8 shadow-lg"
							/>
							<SignInCtaButton
								label={t("existingAccount")}
								variant="outline"
								size="lg"
								className="border-gray-500 hover:bg-gray-800 bg-transparent text-gray-200 hover:text-white"
							/>
						</div>
						<p className="text-sm text-gray-400 mt-4">{t("trustIndicators")}</p>
					</CardContent>
				</Card>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-800 bg-gray-900/50">
				<div className="container mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row items-center justify-between">
						<div className="flex items-center gap-2 mb-4 md:mb-0">
							<div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-sky-400 rounded flex items-center justify-center">
								<Wallet className="w-4 h-4 text-black" />
							</div>
							<span className="font-semibold">{APP_NAME}</span>
						</div>
						<div className="flex gap-6 text-sm text-gray-400">
							<Link href="#" className="hover:text-white transition-colors">
								{t("privacy")}
							</Link>
							<Link href="#" className="hover:text-white transition-colors">
								{t("terms")}
							</Link>
							<Link href="#" className="hover:text-white transition-colors">
								{t("support")}
							</Link>
						</div>
					</div>
					<div className="text-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-800">
						{t("copyright", { year: CURRENT_YEAR, appName: APP_NAME })}
					</div>
				</div>
			</footer>
		</div>
	);
}
