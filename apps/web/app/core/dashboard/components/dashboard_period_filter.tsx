"use client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { CalendarDays, ChevronDown, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { validatePeriod } from "../lib/dashboard_period";
import type {
	DashboardPeriod,
	DashboardPreset,
} from "../types/dashboard_types";
export function DashboardPeriodFilter({
	period,
	preset,
}: { period: DashboardPeriod; preset: DashboardPreset }): React.ReactNode {
	const t = useTranslations("dashboard");
	const locale = useLocale();
	const dateFormatter = new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
	function formatDate(value: string): string {
		return dateFormatter.format(new Date(`${value}T12:00:00Z`));
	}
	const router = useRouter();
	const pathname = usePathname();
	const query = useSearchParams();
	const [pending, startTransition] = useTransition();
	const [selection, setSelection] = useState(preset);
	const [from, setFrom] = useState(period.from);
	const [to, setTo] = useState(period.to);
	const [invalid, setInvalid] = useState(false);
	function navigate(value: DashboardPreset): void {
		if (value === "custom" && !validatePeriod({ from, to })) {
			setInvalid(true);
			return;
		}
		setInvalid(false);
		const params = new URLSearchParams(query.toString());
		params.set("period", value);
		params.delete("from");
		params.delete("to");
		if (value === "custom") {
			params.set("from", from);
			params.set("to", to);
		}
		startTransition(() =>
			router.push(`${pathname}?${params.toString()}`, { scroll: false }),
		);
	}
	return (
		<div
			className="mb-6 rounded-2xl border border-border/60 bg-card/70 p-4 sm:p-5"
			aria-busy={pending}
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-muted-foreground">
						<CalendarDays className="size-5" aria-hidden="true" />
					</span>
					<div className="min-w-0">
						<p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
							{t("period")}
						</p>
						<p className="text-sm font-medium tabular-nums text-foreground">
							{formatDate(period.from)}{" "}
							<span className="mx-1 text-muted-foreground">—</span>{" "}
							{formatDate(period.to)}
						</p>
					</div>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							disabled={pending}
							aria-label={t("period")}
							className="h-11 w-full justify-between gap-6 rounded-xl border-border/70 bg-background/60 px-4 font-medium shadow-none sm:w-auto sm:min-w-52"
						>
							{t(`presets.${selection}`)}
							{pending ? (
								<LoaderCircle
									className="size-4 animate-spin text-muted-foreground"
									aria-hidden="true"
								/>
							) : (
								<ChevronDown
									className="size-4 text-muted-foreground"
									aria-hidden="true"
								/>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						sideOffset={8}
						className="min-w-56 rounded-xl p-1.5"
					>
						<DropdownMenuRadioGroup
							value={selection}
							onValueChange={(value) => {
								const next = value as DashboardPreset;
								setSelection(next);
								if (next !== "custom") navigate(next);
							}}
						>
							{(["current", "previous", "3", "6", "12", "custom"] as const).map(
								(value) => (
									<DropdownMenuRadioItem
										key={value}
										value={value}
										className="cursor-pointer rounded-lg py-2.5 pr-4"
									>
										{t(`presets.${value}`)}
									</DropdownMenuRadioItem>
								),
							)}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div
				className={
					selection === "custom"
						? "mt-4 grid grid-cols-1 items-end gap-3 border-t border-border/60 pt-4 sm:grid-cols-[1fr_1fr_auto]"
						: "hidden"
				}
			>
				{selection === "custom" && (
					<>
						<label className="flex min-w-0 flex-col gap-2 text-xs font-medium text-muted-foreground">
							{t("from")}
							<input
								className="h-11 w-full min-w-0 rounded-xl border border-border/70 bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 [color-scheme:light] dark:[color-scheme:dark]"
								type="date"
								value={from}
								onChange={(event) => setFrom(event.target.value)}
								disabled={pending}
							/>
						</label>
						<label className="flex min-w-0 flex-col gap-2 text-xs font-medium text-muted-foreground">
							{t("to")}
							<input
								className="h-11 w-full min-w-0 rounded-xl border border-border/70 bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 [color-scheme:light] dark:[color-scheme:dark]"
								type="date"
								value={to}
								onChange={(event) => setTo(event.target.value)}
								disabled={pending}
							/>
						</label>
						<Button
							className="h-11 rounded-xl px-6"
							disabled={pending}
							onClick={() => navigate("custom")}
						>
							{t("apply")}
						</Button>
					</>
				)}
			</div>
			{invalid && (
				<p role="alert" className="mt-2 text-sm text-destructive">
					{t("invalidPeriod")}
				</p>
			)}
			{pending && (
				<output aria-live="polite" className="mt-2 text-sm">
					{t("loading")}
				</output>
			)}
			{pending && (
				<style>{`[data-dashboard-overview] { visibility: hidden; }`}</style>
			)}
		</div>
	);
}
