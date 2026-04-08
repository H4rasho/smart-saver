"use client";

import { SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type SignInCtaButtonProps = {
	label: string;
	className?: string;
	showArrow?: boolean;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
};

export function SignInCtaButton({
	label,
	className,
	showArrow = false,
	variant = "default",
	size = "default",
}: SignInCtaButtonProps) {
	return (
		<SignInButton mode="modal">
			<Button className={className} size={size} variant={variant}>
				{label}
				{showArrow ? <ArrowRight className="w-4 h-4 ml-2" /> : null}
			</Button>
		</SignInButton>
	);
}
