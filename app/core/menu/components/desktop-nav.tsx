import { getUserCategoriesAction } from "@/app/core/categories/actions/categories-actions";
import { AddMovement } from "@/app/core/movements/components/create-movment";
import { PanelLeftOpen } from "lucide-react";
import { getUserId } from "../../user/actions/user-actions";
import { NavLink } from "./nav-link";

export async function DesktopNav() {
	const userId = await getUserId();
	if (!userId) return null;
	const categories = await getUserCategoriesAction(userId);
	const categoriesData = categories.map((category) => ({
		id: Number(category.id),
		name: category.name as string,
	}));

	return (
		<aside className="hidden md:flex w-72 shrink-0 border-r border-border/60 bg-muted/20">
			<div className="sticky top-0 flex min-h-screen w-full flex-col px-4 py-6">
				<div className="mb-6 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur">
					<div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
						<PanelLeftOpen className="h-4 w-4 text-primary" />
						<span>Navegación</span>
					</div>
					<p className="text-sm text-muted-foreground">
						Accede rápido a tus vistas principales.
					</p>
				</div>

				<nav className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
					<NavLink href="/home" icon="home" label="Inicio" variant="desktop" />
					<NavLink
						href="/movements"
						icon="history"
						label="Historial"
						variant="desktop"
					/>
					<NavLink
						href="/settings"
						icon="settings"
						label="Configuración"
						variant="desktop"
					/>
				</nav>

				<div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-4 shadow-sm">
					<p className="mb-3 text-sm font-medium text-foreground">
						Carga un nuevo movimiento
					</p>
					<p className="mb-4 text-sm text-muted-foreground">
						Registra ingresos o gastos sin salir de la vista actual.
					</p>
					<AddMovement categories={categoriesData} />
				</div>
			</div>
		</aside>
	);
}
