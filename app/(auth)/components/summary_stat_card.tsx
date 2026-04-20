import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryStatCardProps {
	label: string;
	value: string;
	eyebrow: string;
	icon: LucideIcon;
	detail?: string;
	accentLineClassName: SummaryStatTone["accentLineClassName"];
	accentWashClassName: SummaryStatTone["accentWashClassName"];
	badgeClassName: SummaryStatTone["badgeClassName"];
	iconClassName: SummaryStatTone["iconClassName"];
	className?: string;
}

export interface SummaryStatTone {
	accentLineClassName: string;
	accentWashClassName: string;
	badgeClassName: string;
	iconClassName: string;
}

export const SUMMARY_STAT_TONES: Record<
	"violet" | "emerald" | "rose" | "sky" | "amber",
	SummaryStatTone
> = {
	violet: {
		accentLineClassName:
			"bg-gradient-to-r from-violet-500/60 via-secondary-vibrant/70 to-transparent dark:from-violet-400/60 dark:via-secondary-vibrant/60",
		accentWashClassName:
			"bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.16),transparent_48%)]",
		badgeClassName:
			"border-violet-500/15 bg-violet-500/8 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200",
		iconClassName:
			"border-violet-500/15 bg-violet-500/10 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200",
	},
	emerald: {
		accentLineClassName:
			"bg-gradient-to-r from-emerald-500/60 via-emerald-400/50 to-transparent dark:from-emerald-400/70 dark:via-emerald-300/40",
		accentWashClassName:
			"bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.11),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_48%)]",
		badgeClassName:
			"border-emerald-500/15 bg-emerald-500/8 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
		iconClassName:
			"border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
	},
	rose: {
		accentLineClassName:
			"bg-gradient-to-r from-rose-500/60 via-red-400/45 to-transparent dark:from-rose-400/70 dark:via-red-300/35",
		accentWashClassName:
			"bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.11),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.15),transparent_48%)]",
		badgeClassName:
			"border-rose-500/15 bg-rose-500/8 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200",
		iconClassName:
			"border-rose-500/15 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200",
	},
	sky: {
		accentLineClassName:
			"bg-gradient-to-r from-sky-500/60 via-blue-400/45 to-transparent dark:from-sky-400/70 dark:via-blue-300/35",
		accentWashClassName:
			"bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.11),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_48%)]",
		badgeClassName:
			"border-sky-500/15 bg-sky-500/8 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
		iconClassName:
			"border-sky-500/15 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
	},
	amber: {
		accentLineClassName:
			"bg-gradient-to-r from-amber-500/65 via-orange-400/45 to-transparent dark:from-amber-400/70 dark:via-orange-300/35",
		accentWashClassName:
			"bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_48%)]",
		badgeClassName:
			"border-amber-500/15 bg-amber-500/8 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
		iconClassName:
			"border-amber-500/15 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
	},
};

function getSummaryValueClassName(value: string): string {
	const compactValue = value.replace(/\s/g, "");

	if (compactValue.length >= 19) {
		return "text-[clamp(1rem,1.65vw,1.3rem)]";
	}

	if (compactValue.length >= 16) {
		return "text-[clamp(1.15rem,1.9vw,1.55rem)]";
	}

	if (compactValue.length >= 13) {
		return "text-[clamp(1.3rem,2.2vw,1.85rem)]";
	}

	return "text-[clamp(1.65rem,3vw,2.4rem)]";
}

export function SummaryStatCard({
	label,
	value,
	eyebrow,
	icon: Icon,
	detail,
	accentLineClassName,
	accentWashClassName,
	badgeClassName,
	iconClassName,
	className,
}: SummaryStatCardProps) {
	const valueClassName = getSummaryValueClassName(value);

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-colors",
				className,
			)}
		>
			<div
				className={cn(
					"pointer-events-none absolute inset-x-0 top-0 h-px opacity-90",
					accentLineClassName,
				)}
			/>
			<div
				className={cn(
					"pointer-events-none absolute inset-0 opacity-80",
					accentWashClassName,
				)}
			/>

			<div className="relative flex h-full flex-col gap-6">
				<div className="flex items-start justify-between gap-3">
					<span
						className={cn(
							"inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em]",
							badgeClassName,
						)}
					>
						{eyebrow}
					</span>

					<div
						className={cn(
							"flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
							iconClassName,
						)}
					>
						<Icon className="size-5" />
					</div>
				</div>

				<div className="min-w-0 space-y-1.5">
					<p className="text-sm font-medium text-muted-foreground">{label}</p>
					<p
						className={cn(
							"max-w-full whitespace-nowrap leading-none font-semibold tracking-[-0.04em] text-foreground tabular-nums",
							valueClassName,
						)}
					>
						{value}
					</p>
				</div>

				{detail ? (
					<p className="max-w-[26ch] text-xs leading-5 text-muted-foreground">
						{detail}
					</p>
				) : null}
			</div>
		</div>
	);
}
