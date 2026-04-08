import { DesktopNav } from "@/app/core/menu/components/desktop-nav";
import { NavigationMenu } from "@/app/core/menu/components/mobile-menu";
import { getAuthenticatedNavigationData } from "@/app/core/menu/lib/navigation-data";
import { getUserId } from "@/app/core/user/actions/user-actions";
import { UserProfileCard } from "./home/user-profile-card";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const userId = await getUserId();
	const navigationData = userId
		? await getAuthenticatedNavigationData(userId)
		: null;

	return (
		<div className="min-h-screen bg-background">
			<UserProfileCard />
			<div className="mx-auto flex max-w-screen-2xl flex-col md:flex-row">
				{navigationData ? (
					<DesktopNav categories={navigationData.categories} />
				) : null}
				<main className="flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-8 md:pt-6">
					{children}
				</main>
			</div>
			<div className="md:hidden">
				{navigationData ? (
					<NavigationMenu
						categories={navigationData.categories}
						movementTypes={navigationData.movementTypes}
						userCurrency={navigationData.userCurrency}
					/>
				) : null}
			</div>
		</div>
	);
}
