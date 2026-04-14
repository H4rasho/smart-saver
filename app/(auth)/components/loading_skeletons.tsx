"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "boneyard-js/react";
import {
	ArrowLeftRight,
	Coins,
	FolderOpen,
	List,
	Scale,
	Settings,
	Sparkles,
	TrendingDown,
	TrendingUp,
	Wallet,
} from "lucide-react";
import type { ReactNode } from "react";

interface LoadingBlockProps {
	className?: string;
}

function LoadingBlock({ className }: LoadingBlockProps) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-xl border border-border/50 bg-muted/70",
				className,
			)}
		/>
	);
}

interface BoneyardLoadingProps {
	name: string;
	label: string;
	fixture: ReactNode;
	className?: string;
}

function BoneyardLoading({
	name,
	label,
	fixture,
	className,
}: BoneyardLoadingProps) {
	return (
		<div aria-busy="true" aria-live="polite" className={className}>
			<span className="sr-only">{label}</span>
			<Skeleton
				loading={true}
				name={name}
				fallback={fixture}
				fixture={fixture}
				transition={true}
			>
				{fixture}
			</Skeleton>
		</div>
	);
}

function ShellChromeFixture() {
	return (
		<div className="min-h-screen bg-background">
			<div className="border-b border-border/60 bg-card px-6 py-5 shadow-sm">
				<div className="mx-auto flex max-w-screen-2xl items-center gap-4">
					<LoadingBlock className="h-12 w-12 rounded-full" />
					<div className="space-y-2">
						<LoadingBlock className="h-5 w-40" />
						<LoadingBlock className="h-4 w-56" />
					</div>
				</div>
			</div>

			<div className="mx-auto flex max-w-screen-2xl flex-col md:flex-row">
				<div className="hidden w-72 shrink-0 border-r border-border/60 bg-muted/20 p-4 md:block">
					<div className="sticky top-0 space-y-4 py-2">
						<LoadingBlock className="h-24 w-full rounded-2xl" />
						<div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
							<div className="space-y-2">
								<LoadingBlock className="h-10 w-full" />
								<LoadingBlock className="h-10 w-full" />
								<LoadingBlock className="h-10 w-full" />
							</div>
						</div>
						<LoadingBlock className="h-36 w-full rounded-2xl" />
					</div>
				</div>

				<div className="flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-8 md:pt-6">
					<div className="space-y-6">
						<LoadingBlock className="h-28 w-full rounded-3xl" />
						<LoadingBlock className="h-56 w-full rounded-3xl" />
					</div>
				</div>
			</div>

			<div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] shadow-xl backdrop-blur md:hidden">
				<div className="grid grid-cols-4 gap-2">
					<LoadingBlock className="h-14 w-full rounded-2xl" />
					<LoadingBlock className="h-14 w-full rounded-2xl" />
					<LoadingBlock className="h-14 w-full rounded-2xl" />
					<LoadingBlock className="h-14 w-full rounded-2xl" />
				</div>
			</div>
		</div>
	);
}

function DashboardSummaryCardsFixture() {
	const cards = [
		{ icon: Wallet, tone: "bg-secondary-vibrant/15 text-secondary-vibrant" },
		{
			icon: TrendingUp,
			tone: "bg-green-500/15 text-green-600 dark:text-green-400",
		},
		{
			icon: TrendingDown,
			tone: "bg-red-500/15 text-red-600 dark:text-red-400",
		},
		{ icon: Scale, tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
	] as const;

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<div
						key={card.icon.displayName ?? card.icon.name}
						className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 p-6 shadow-sm"
					>
						<div className="flex items-center justify-between gap-4">
							<div className="min-w-0 flex-1 space-y-3">
								<LoadingBlock className="h-4 w-24 rounded-md" />
								<LoadingBlock className="h-8 w-32 rounded-lg" />
							</div>
							<div className={cn("rounded-lg p-3", card.tone)}>
								<Icon className="h-6 w-6" />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function MovementsSurfaceFixture({ compact = false }: { compact?: boolean }) {
	return (
		<div className="space-y-4">
			<div className="space-y-3 md:hidden">
				{Array.from({ length: compact ? 3 : 4 }).map((_, index) => (
					<div
						key={`mobile-movement-row-${compact ? "compact" : "full"}-${index + 1}`}
						className="rounded-2xl border border-border bg-card p-4 shadow-sm"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="flex min-w-0 flex-1 gap-3">
								<LoadingBlock className="h-10 w-10 rounded-xl" />
								<div className="min-w-0 flex-1 space-y-2">
									<LoadingBlock className="h-4 w-28 rounded-md" />
									<LoadingBlock className="h-3 w-40 rounded-md" />
									<LoadingBlock className="h-3 w-24 rounded-md" />
								</div>
							</div>
							<LoadingBlock className="h-12 w-20 rounded-2xl" />
						</div>
					</div>
				))}
			</div>

			<div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm md:block">
				<div className="flex items-center justify-between border-b border-border/60 bg-secondary/20 px-6 py-4">
					<div className="space-y-2">
						<LoadingBlock className="h-5 w-44 rounded-md" />
						<LoadingBlock className="h-4 w-32 rounded-md" />
					</div>
					<LoadingBlock className="h-4 w-24 rounded-md" />
				</div>
				<div className="space-y-0">
					<div className="grid grid-cols-5 gap-4 border-b border-border/40 bg-secondary/15 px-6 py-4">
						{Array.from({ length: 5 }).map((_, index) => (
							<LoadingBlock
								key={`table-header-${index + 1}`}
								className="h-3 w-16 rounded-md"
							/>
						))}
					</div>
					{Array.from({ length: compact ? 4 : 6 }).map((_, rowIndex) => (
						<div
							key={`desktop-row-${compact ? "compact" : "full"}-${rowIndex + 1}`}
							className="grid grid-cols-5 gap-4 border-b border-border/30 px-6 py-4 last:border-b-0"
						>
							<LoadingBlock className="h-4 w-28 rounded-md" />
							<LoadingBlock className="h-4 w-24 rounded-full" />
							<LoadingBlock className="h-4 w-20 rounded-md" />
							<LoadingBlock className="h-4 w-24 rounded-full" />
							<LoadingBlock className="ml-auto h-4 w-20 rounded-md" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function SettingsPanelsFixture() {
	const tabs = [Coins, FolderOpen, Sparkles] as const;

	return (
		<div className="space-y-6">
			<div className="grid w-full max-w-2xl grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/20 p-1">
				{tabs.map((Icon) => (
					<div
						key={Icon.displayName ?? Icon.name}
						className="flex items-center justify-center gap-2 rounded-lg bg-card px-4 py-3"
					>
						<Icon className="h-4 w-4 text-muted-foreground" />
						<LoadingBlock className="h-4 w-20 rounded-md border-0" />
					</div>
				))}
			</div>

			<div className="rounded-xl border border-border shadow-sm">
				<div className="space-y-3 border-b border-border/60 px-6 py-6">
					<div className="flex items-center gap-2">
						<Settings className="h-5 w-5 text-primary/70" />
						<LoadingBlock className="h-5 w-44 rounded-md" />
					</div>
					<LoadingBlock className="h-4 w-72 max-w-full rounded-md" />
				</div>
				<div className="space-y-4 px-6 pt-6 pb-6">
					<LoadingBlock className="h-16 w-full rounded-xl" />
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{Array.from({ length: 6 }).map((_, index) => (
							<LoadingBlock
								key={`settings-panel-button-${index + 1}`}
								className="h-11 w-full rounded-lg"
							/>
						))}
					</div>
					<LoadingBlock className="h-11 w-40 rounded-lg" />
				</div>
			</div>

			<LoadingBlock className="h-32 w-full rounded-xl" />
		</div>
	);
}

export function AuthShellLoadingSkeleton() {
	const fixture = <ShellChromeFixture />;

	return (
		<BoneyardLoading
			name="auth-shell"
			label="Cargando tu espacio de SmartSaver"
			fixture={fixture}
		/>
	);
}

export function HomeLoadingSkeleton() {
	const fixture = (
		<main className="mx-auto flex min-h-screen max-w-6xl flex-col py-10">
			<section>
				<div className="mb-6 space-y-3">
					<LoadingBlock className="h-8 w-40 rounded-lg" />
					<LoadingBlock className="h-5 w-64 rounded-md" />
				</div>
				<DashboardSummaryCardsFixture />
			</section>

			<section className="mt-6 space-y-4">
				<div className="space-y-2">
					<LoadingBlock className="h-7 w-52 rounded-lg" />
					<LoadingBlock className="h-4 w-40 rounded-md" />
				</div>
				<MovementsSurfaceFixture compact={true} />
			</section>
		</main>
	);

	return (
		<BoneyardLoading
			name="home-page"
			label="Cargando dashboard financiero"
			fixture={fixture}
		/>
	);
}

export function MovementsLoadingSkeleton() {
	const fixture = (
		<main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
			<div className="mb-8 space-y-4">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2 text-primary/70">
						<ArrowLeftRight className="h-6 w-6" />
					</div>
					<div className="space-y-2">
						<LoadingBlock className="h-8 w-40 rounded-lg" />
						<LoadingBlock className="h-4 w-52 rounded-md" />
					</div>
				</div>
			</div>

			<div className="mb-6 rounded-xl border border-secondary-dark/20 bg-secondary p-4 shadow-sm">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1 space-y-2">
						<div className="flex items-center gap-2 text-secondary-foreground/70">
							<List className="h-4 w-4" />
							<LoadingBlock className="h-4 w-36 rounded-md border-secondary-foreground/10 bg-secondary-foreground/10" />
						</div>
					</div>
					<LoadingBlock className="h-7 w-16 rounded-lg border-secondary-foreground/10 bg-secondary-foreground/10" />
				</div>
			</div>

			<MovementsSurfaceFixture />

			<div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card/50 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
				<LoadingBlock className="h-4 w-52 rounded-md" />
				<div className="flex gap-2 self-end md:self-auto">
					<LoadingBlock className="h-10 w-10 rounded-lg" />
					<LoadingBlock className="h-10 w-10 rounded-lg" />
					<LoadingBlock className="h-10 w-10 rounded-lg" />
				</div>
			</div>
		</main>
	);

	return (
		<BoneyardLoading
			name="movements-page"
			label="Cargando historial de movimientos"
			fixture={fixture}
		/>
	);
}

export function SettingsLoadingSkeleton() {
	const fixture = (
		<main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
			<section className="mb-8 space-y-3">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2 text-primary/70">
						<Settings className="h-6 w-6" />
					</div>
					<LoadingBlock className="h-9 w-48 rounded-lg" />
				</div>
				<LoadingBlock className="h-5 w-80 max-w-full rounded-md" />
			</section>

			<LoadingBlock className="mb-8 h-px w-full rounded-none border-0" />

			<SettingsPanelsFixture />
		</main>
	);

	return (
		<BoneyardLoading
			name="settings-page"
			label="Cargando configuración"
			fixture={fixture}
		/>
	);
}

export function OpenAISettingsLoadingFixture() {
	return (
		<div className="space-y-6">
			<LoadingBlock className="h-36 w-full rounded-lg" />
			<div className="space-y-3">
				<LoadingBlock className="h-4 w-28 rounded-md" />
				<LoadingBlock className="h-11 w-full rounded-lg" />
				<LoadingBlock className="h-4 w-32 rounded-md" />
			</div>
			<div className="flex flex-col gap-2 sm:flex-row">
				<LoadingBlock className="h-10 w-full rounded-lg sm:w-40" />
				<LoadingBlock className="h-10 w-full rounded-lg sm:w-40" />
				<LoadingBlock className="h-10 w-full rounded-lg sm:w-32" />
			</div>
			<LoadingBlock className="h-28 w-full rounded-lg" />
		</div>
	);
}
