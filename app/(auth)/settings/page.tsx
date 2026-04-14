import { getUserCategoriesAction } from "@/app/core/categories/actions/categories-actions";
import {
	getCurrentUser,
	getUserCurrency,
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
import { CategoriesSettings } from "./components/categories_settings";
import { CurrencySettings } from "./components/currency_settings";
import { OpenAISettings } from "./components/openai_settings";

export default async function Settings() {
	const user = await getCurrentUser();
	if (!user) return redirect("/welcome");

	const [currency, categories, hasOpenAIKey] = await Promise.all([
		getUserCurrency(),
		getUserCategoriesAction(user.clerk_id),
		getUserOpenAIKeyStatus(),
	]);

	return (
		<main className="flex flex-col min-h-screen max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
			<section className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<div className="p-2 bg-primary/10 rounded-lg">
						<SettingsIcon className="w-6 h-6 text-primary" />
					</div>
					<h1 className="text-3xl font-bold text-foreground">Configuración</h1>
				</div>
				<p className="text-muted-foreground">
					Personaliza tu experiencia y gestiona tus preferencias
				</p>
			</section>

			<Separator className="mb-8" />

			<Tabs defaultValue="currency" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3 max-w-2xl">
					<TabsTrigger value="currency" className="gap-2">
						<Coins className="w-4 h-4" />
						Moneda
					</TabsTrigger>
					<TabsTrigger value="categories" className="gap-2">
						<FolderOpen className="w-4 h-4" />
						Categorías
					</TabsTrigger>
					<TabsTrigger value="openai" className="gap-2">
						<Sparkles className="w-4 h-4" />
						OpenAI
					</TabsTrigger>
				</TabsList>

				<TabsContent value="currency" className="space-y-4">
					<Card className="border-border shadow-sm">
						<CardHeader className="border-b border-secondary-dark/20">
							<CardTitle className="flex items-center gap-2">
								<Coins className="w-5 h-5 text-primary" />
								Configuración de Moneda
							</CardTitle>
							<CardDescription className="text-secondary-foreground/80">
								Selecciona la moneda que utilizarás para registrar tus
								movimientos financieros
							</CardDescription>
						</CardHeader>
						<CardContent className="pt-6">
							<div className="mb-4 p-4 bg-muted/50 border border-border rounded-lg">
								<p className="text-sm text-foreground">
									<span className="font-semibold">Moneda actual:</span>{" "}
									<span className="text-muted-foreground font-bold">
										{currency}
									</span>
								</p>
							</div>
							<CurrencySettings currentCurrency={currency} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="categories" className="space-y-4">
					<Card className="border-border shadow-sm">
						<CardHeader className="border-b border-secondary-dark/20">
							<CardTitle className="flex items-center gap-2">
								<FolderOpen className="w-5 h-5 text-primary" />
								Gestión de Categorías
							</CardTitle>
							<CardDescription className="text-secondary-foreground/80">
								Organiza tus movimientos financieros con categorías
								personalizadas
							</CardDescription>
						</CardHeader>
						<CardContent className="pt-6">
							<CategoriesSettings categories={categories} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="openai" className="space-y-4">
					<Card className="border-border shadow-sm">
						<CardHeader className="border-b border-secondary-dark/20">
							<CardTitle className="flex items-center gap-2">
								<Sparkles className="w-5 h-5 text-primary" />
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
				</TabsContent>
			</Tabs>

			<div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
				<h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
					<SettingsIcon className="w-4 h-4" />
					Información
				</h3>
				<ul className="text-sm text-muted-foreground space-y-1">
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
