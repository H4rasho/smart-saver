import { DesktopNav } from "@/app/core/menu/components/desktop-nav";
import { NavigationMenu } from "@/app/core/menu/components/mobile-menu";
import { getAuthenticatedNavigationData } from "@/app/core/menu/lib/navigation-data";
import { getUserId } from "@/app/core/user/actions/user-actions";
import { Suspense } from "react";
import { UserProfileCard } from "./home/user-profile-card";

function ChromeLoadingBlock({ className }: { className?: string }) {
	return (
		<div
			className={`animate-pulse rounded-xl bg-muted/70 ${className ?? ""}`}
		/>
	);
}

function UserProfileCardFallback() {
	return (
		<div className="w-full border-b border-border/60 bg-card px-6 py-5 shadow-sm">
			<div className="mx-auto flex max-w-screen-2xl items-center gap-4">
				<ChromeLoadingBlock className="h-12 w-12 rounded-full" />
				<div className="space-y-2">
					<ChromeLoadingBlock className="h-5 w-40" />
					<ChromeLoadingBlock className="h-4 w-56" />
				</div>
			</div>
		</div>
	);
}

function DesktopNavFallback() {
	return (
		<aside className="hidden w-72 shrink-0 border-r border-border/60 bg-muted/20 p-4 md:block">
			<div className="sticky top-0 space-y-4 py-2">
				<ChromeLoadingBlock className="h-24 w-full rounded-2xl" />
				<div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
					<div className="space-y-2">
						<ChromeLoadingBlock className="h-10 w-full" />
						<ChromeLoadingBlock className="h-10 w-full" />
						<ChromeLoadingBlock className="h-10 w-full" />
					</div>
				</div>
				<ChromeLoadingBlock className="h-36 w-full rounded-2xl" />
			</div>
		</aside>
	);
}

function MobileNavFallback() {
	return (
		<div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pt-2 pb-[max(0.85rem,env(safe-area-inset-bottom))] shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
			<div className="grid grid-cols-5 gap-2">
				<ChromeLoadingBlock className="h-14 w-full rounded-2xl" />
				<ChromeLoadingBlock className="h-14 w-full rounded-2xl" />
				<ChromeLoadingBlock className="h-14 w-full rounded-2xl" />
				<ChromeLoadingBlock className="h-14 w-full rounded-2xl" />
				<ChromeLoadingBlock className="h-14 w-full rounded-2xl" />
			</div>
		</div>
	);
}

async function AuthenticatedDesktopNavigation() {
	const userId = await getUserId();

	if (!userId) {
		return null;
	}

	const navigationData = await getAuthenticatedNavigationData(userId);

	return (
		<DesktopNav
			categories={navigationData.categories}
			userCurrency={navigationData.userCurrency}
		/>
	);
}

async function AuthenticatedMobileNavigation() {
	const userId = await getUserId();

	if (!userId) {
		return null;
	}

	const navigationData = await getAuthenticatedNavigationData(userId);

	return (
		<NavigationMenu
			categories={navigationData.categories}
			movementTypes={navigationData.movementTypes}
			userCurrency={navigationData.userCurrency}
		/>
	);
}

export default function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-background">
			<Suspense fallback={<UserProfileCardFallback />}>
				<UserProfileCard />
			</Suspense>
			<div className="mx-auto flex max-w-screen-2xl flex-col md:flex-row">
				<Suspense fallback={<DesktopNavFallback />}>
					<AuthenticatedDesktopNavigation />
				</Suspense>
				<main className="flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-8 md:pt-6">
					{children}
				</main>
			</div>
			<div className="md:hidden">
				<Suspense fallback={<MobileNavFallback />}>
					<AuthenticatedMobileNavigation />
				</Suspense>
			</div>
		</div>
	);
}
