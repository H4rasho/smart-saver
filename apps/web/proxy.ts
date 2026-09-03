import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const PROTECTED_ROUTES = [
	"/dashboard",
	"/home",
	"/movements",
	"/profile",
	"/settings",
	"/savings-goals",
	"/welcome",
];

function getPathnameWithoutLocale(pathname: string): string {
	const segments = pathname.split("/");
	const maybeLocale = segments[1];

	if (
		routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
	) {
		const pathnameWithoutLocale = `/${segments.slice(2).join("/")}`;
		return pathnameWithoutLocale === "/"
			? "/"
			: pathnameWithoutLocale.replace(/\/$/, "");
	}

	return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}

function getLocalePrefix(pathname: string): string {
	const maybeLocale = pathname.split("/")[1];

	return maybeLocale === "en" ? "/en" : "";
}

function isProtectedPath(pathname: string): boolean {
	const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);

	return PROTECTED_ROUTES.some(
		(route) =>
			pathnameWithoutLocale === route ||
			pathnameWithoutLocale.startsWith(`${route}/`),
	);
}

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();
	const url = req.nextUrl.clone();
	const pathnameWithoutLocale = getPathnameWithoutLocale(req.nextUrl.pathname);
	const localePrefix = getLocalePrefix(req.nextUrl.pathname);

	if (pathnameWithoutLocale === "/dashboard") {
		url.pathname = `${localePrefix}/home`;
		return NextResponse.redirect(url);
	}

	if (isProtectedPath(req.nextUrl.pathname)) {
		await auth.protect();
	}

	if (userId && pathnameWithoutLocale === "/") {
		url.pathname = `${localePrefix}/home`;
		return NextResponse.redirect(url);
	}

	return handleI18nRouting(req);
});

export const config = {
	matcher:
		"/((?!api|trpc|mcp|_next|_vercel|.*\\..*|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
};
