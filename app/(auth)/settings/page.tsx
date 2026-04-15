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
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CategoriesSettings } from "./components/categories_settings";
import { CurrencySettings } from "./components/currency_settings";
import { OpenAISettings } from "./components/openai_settings";

async function CurrencySettingsPanel() {
	const currency = await getUserCurrency();

	return (
		<Card className="border-border shadow-sm">
			<CardHeader className="border-b border-secondary-dark/20">
				<CardTitle className="flex items-center gap-2">
					<Coins className="h-5 w-5 text-primary" />
					Configuración de Moneda
				</CardTitle>
				<CardDescription className="text-secondary-foreground/80">
					Selecciona la moneda que utilizarás para registrar tus movimientos
					financieros
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-6">
				<div className="mb-4 rounded-lg border border-border bg-muted/50 p-4">
					<p className="text-sm text-foreground">
						<span className="font-semibold">Moneda actual:</span>{" "}
						<span className="font-bold text-muted-foreground">{currency}</span>
					</p>
				</div>
				<CurrencySettings currentCurrency={currency} />
			</CardContent>
		</Card>
	);
}

async function CategoriesSettingsPanel({ userId }: { userId: string }) {
	const categories = await getUserCategoriesAction(userId);

	return (
		<Card className="border-border shadow-sm">
			<CardHeader className="border-b border-secondary-dark/20">
				<CardTitle className="flex items-center gap-2">
					<FolderOpen className="h-5 w-5 text-primary" />
					Gestión de Categorías
				</CardTitle>
				<CardDescription className="text-secondary-foreground/80">
					Organiza tus movimientos financieros con categorías personalizadas
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-6">
				<CategoriesSettings categories={categories} />
			</CardContent>
		</Card>
	);
}

async function OpenAISettingsPanel() {
	const hasOpenAIKey = await getUserOpenAIKeyStatus();

	return (
		<Card className="border-border shadow-sm">
			<CardHeader className="border-b border-secondary-dark/20">
				<CardTitle className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-primary" />
					Configuración de OpenAI
				</CardTitle>
				<CardDescription className="text-secondary-foreground/80">
					Configura tu API key para habilitar funcionalidades de IA
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-6">
				<OpenAISettings initialHasExistingKey={hasOpenAIKey} />
			</CardContent>
		</Card>
	);
}

export default async function Settings() {
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
					<h1 className="text-3xl font-bold text-foreground">Configuración</h1>
				</div>
				<p className="text-muted-foreground">
					Personaliza tu experiencia y gestiona tus preferencias
				</p>
			</section>

			<Separator className="mb-8" />

			<Tabs defaultValue="currency" className="space-y-6">
				<TabsList className="grid max-w-2xl w-full grid-cols-3">
					<TabsTrigger value="currency" className="gap-2">
						<Coins className="h-4 w-4" />
						Moneda
					</TabsTrigger>
					<TabsTrigger value="categories" className="gap-2">
						<FolderOpen className="h-4 w-4" />
						Categorías
					</TabsTrigger>
					<TabsTrigger value="openai" className="gap-2">
						<Sparkles className="h-4 w-4" />
						OpenAI
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
					Información
				</h3>
				<ul className="space-y-1 text-sm text-muted-foreground">
					<li>
						• Los cambios en la moneda se aplicarán a todos tus movimientos
						futuros
					</li>
					<li>
						• Las categorías te ayudan a clasificar y organizar mejor tus gastos
						e ingresos
					</li>
					<li>
						• Puedes eliminar categorías que ya no uses, pero esto no afectará
						los movimientos existentes
					</li>
					<li>
						• La API key de OpenAI se guarda solo en tu navegador para mayor
						seguridad
					</li>
				</ul>
			</div>
		</main>
	);
}
