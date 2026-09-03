import { AddMovement } from "@/app/core/movements/components/create-movment";
import { LanguageSwitcher } from "@/components/language_switcher";
import type { Category } from "@/types/income";
import { PanelLeftOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { NavLink } from "./nav-link";

interface DesktopNavProps {
	categories: Category[];
	userCurrency: string;
}

export function DesktopNav({ categories, userCurrency }: DesktopNavProps) {
	const t = useTranslations("navigation");

	return (
		<aside className="hidden md:flex w-72 shrink-0 border-r border-border/60 bg-muted/20">
			<div className="sticky top-0 flex min-h-screen w-full flex-col px-4 py-6">
				<div className="mb-6 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur">
					<div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
						<PanelLeftOpen className="h-4 w-4 text-primary" />
						<span>{t("title")}</span>
					</div>
					<p className="text-sm text-muted-foreground">{t("description")}</p>
					<LanguageSwitcher className="mt-4" />
				</div>

				<nav className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
					<NavLink
						href="/home"
						icon="home"
						label={t("home")}
						variant="desktop"
					/>
					<NavLink
						href="/movements"
						icon="history"
						label={t("history")}
						variant="desktop"
					/>
					<NavLink
						href="/savings-goals"
						icon="savings-goals"
						label={t("savingsGoals")}
						variant="desktop"
					/>
					<NavLink
						href="/settings"
						icon="settings"
						label={t("settings")}
						variant="desktop"
					/>
				</nav>

				<div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card p-4 shadow-sm">
					<p className="mb-3 text-sm font-medium text-foreground">
						{t("newMovementTitle")}
					</p>
					<p className="mb-4 text-sm text-muted-foreground">
						{t("newMovementDescription")}
					</p>
					<AddMovement categories={categories} userCurrency={userCurrency} />
				</div>
			</div>
		</aside>
	);
}
