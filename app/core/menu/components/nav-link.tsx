"use client";

import { cn } from "@/lib/utils";
import { History, Home, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkVariant = "mobile" | "desktop";
type NavLinkIcon = "home" | "history" | "settings";

const ICONS: Record<NavLinkIcon, LucideIcon> = {
	home: Home,
	history: History,
	settings: Settings,
};

interface NavLinkProps {
	href: string;
	icon: NavLinkIcon;
	label: string;
	className?: string;
	variant?: NavLinkVariant;
}

export function NavLink({
	href,
	icon,
	label,
	className,
	variant = "mobile",
}: NavLinkProps) {
	const pathname = usePathname();
	const isActive = pathname === href || pathname.startsWith(`${href}/`);
	const isDesktop = variant === "desktop";
	const Icon = ICONS[icon];

	return (
		<Link
			href={href}
			className={cn(
				"group rounded-xl transition-all duration-200",
				isDesktop
					? "flex items-center justify-start gap-3 px-3 py-3 text-sm font-medium"
					: "flex flex-col items-center justify-center p-2",
				isActive
					? isDesktop
						? "bg-primary/10 text-primary shadow-sm"
						: "bg-primary/10 text-primary"
					: "text-foreground/70 hover:bg-secondary/60 hover:text-primary",
				className,
			)}
			aria-label={label}
			aria-current={isActive ? "page" : undefined}
		>
			<Icon
				size={20}
				className={cn(
					"shrink-0 transition-colors duration-200",
					!isActive && "text-foreground/70 group-hover:text-primary",
				)}
			/>
			<span
				className={cn(
					"font-medium transition-colors duration-200",
					isDesktop ? "text-sm" : "mt-1 text-xs",
					!isActive && "text-foreground/70 group-hover:text-primary",
				)}
			>
				{label}
			</span>
		</Link>
	);
}
