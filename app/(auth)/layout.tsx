import { DesktopNav } from "@/app/core/menu/components/desktop-nav";
import { NavigationMenu } from "@/app/core/menu/components/mobile-menu";
import { UserProfileCard } from "./home/user-profile-card";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<UserProfileCard />
			<div className="mx-auto flex max-w-screen-2xl flex-col md:flex-row">
				<DesktopNav />
				<main className="flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-8 md:pt-6">
					{children}
				</main>
			</div>
			<div className="md:hidden">
				<NavigationMenu />
			</div>
		</div>
	);
}
