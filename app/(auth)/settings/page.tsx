import { SettingsTabPanelLoadingSkeleton } from "@/app/(auth)/components/loading_skeletons";
import { getUserCategoriesAction } from "@/app/core/categories/actions/categories-actions";
import {
	getUserCurrency,
	getUserId,
	getUserOpenAIKeyStatus,
} from "@/app/core/user/actions/user-actions";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Coins,
	FolderOpen,
	Settings as SettingsIcon,
	Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CategoriesSettings } from "./components/categories_settings";
import { CurrencySettings } from "./components/currency_settings";
import { OpenAISettings } from "./components/openai_settings";

async function CurrencySettingsPanel() {
	const t = await getTranslations("settings");
	const currency = await getUserCurrency();

	return (
		<Card className="border-border shadow-sm">
			<CardHeader className="border-b border-secondary-dark/20">
				<CardTitle className="flex items-center gap-2">
					<Coins className="h-5 w-5 text-primary" />
					{t("currencyTitle")}
				</CardTitle>
				<CardDescription className="text-secondary-foreground/80">
					{t("currencyDescription")}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-6">
				<div className="mb-4 rounded-lg border border-border bg-muted/50 p-4">
					<p className="text-sm text-foreground">
						<span className="font-semibold">{t("currentCurrency")}</span>{" "}
						<span className="font-bold text-muted-foreground">{currency}</span>
					</p>
				</div>
				<CurrencySettings currentCurrency={currency} />
			</CardContent>
		</Card>
	);
}

async function CategoriesSettingsPanel({ userId }: { userId: string }) {
	const t = await getTranslations("settings");
	const categories = await getUserCategoriesAction(userId);

	return (
		<Card className="border-border shadow-sm">
			<CardHeader className="border-b border-secondary-dark/20">
				<CardTitle className="flex items-center gap-2">
					<FolderOpen className="h-5 w-5 text-primary" />
					{t("categoriesTitle")}
				</CardTitle>
				<CardDescription className="text-secondary-foreground/80">
					{t("categoriesDescription")}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-6">
				<CategoriesSettings categories={categories} />
			</CardContent>
		</Card>
	);
}

async function OpenAISettingsPanel() {
	const t = await getTranslations("settings");
	const hasOpenAIKey = await getUserOpenAIKeyStatus();

	return (
		<Card className="border-border shadow-sm">
			<CardHeader className="border-b border-secondary-dark/20">
				<CardTitle className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-primary" />
					{t("openAiTitle")}
				</CardTitle>
				<CardDescription className="text-secondary-foreground/80">
					{t("openAiDescription")}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-6">
				<OpenAISettings initialHasExistingKey={hasOpenAIKey} />
			</CardContent>
		</Card>
	);
}

export default async function Settings() {
	const t = await getTranslations("settings");
	const userId = await getUserId();

	if (!userId) {
		return redirect("/welcome");
	}

	return (
		<main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
			<section className="mb-8">
				<div className="mb-2 flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2">
						<SettingsIcon className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
				</div>
				<p className="text-muted-foreground">{t("description")}</p>
			</section>

			<Separator className="mb-8" />

			<Tabs defaultValue="currency" className="space-y-6">
				<TabsList className="grid max-w-2xl w-full grid-cols-3">
					<TabsTrigger value="currency" className="gap-2">
						<Coins className="h-4 w-4" />
						{t("currencyTab")}
					</TabsTrigger>
					<TabsTrigger value="categories" className="gap-2">
						<FolderOpen className="h-4 w-4" />
						{t("categoriesTab")}
					</TabsTrigger>
					<TabsTrigger value="openai" className="gap-2">
						<Sparkles className="h-4 w-4" />
						{t("openAiTab")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="currency" className="space-y-4">
					<Suspense fallback={<SettingsTabPanelLoadingSkeleton />}>
						<CurrencySettingsPanel />
					</Suspense>
				</TabsContent>

				<TabsContent value="categories" className="space-y-4">
					<Suspense fallback={<SettingsTabPanelLoadingSkeleton />}>
						<CategoriesSettingsPanel userId={userId} />
					</Suspense>
				</TabsContent>

				<TabsContent value="openai" className="space-y-4">
					<Suspense fallback={<SettingsTabPanelLoadingSkeleton />}>
						<OpenAISettingsPanel />
					</Suspense>
				</TabsContent>
			</Tabs>

			<div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
				<h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
					<SettingsIcon className="h-4 w-4" />
					{t("infoTitle")}
				</h3>
				<ul className="space-y-1 text-sm text-muted-foreground">
					<li>• {t("infoCurrency")}</li>
					<li>• {t("infoCategories")}</li>
					<li>• {t("infoDeleteCategories")}</li>
					<li>• {t("infoOpenAi")}</li>
				</ul>
			</div>
		</main>
	);
}
