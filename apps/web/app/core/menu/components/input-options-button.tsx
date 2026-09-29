"use client";

import type { MovementType } from "@/app/core/movement-types.ts/types/movement-type-types";
import { CreateMovementFromAudio } from "@/app/core/movements/components/create-movement-from-audio";
import { AddMovement } from "@/app/core/movements/components/create-movment";
import { ReadFileModalButton } from "@/app/core/movements/components/read-file-modal-button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/income";
import { FileText, Mic, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface InputOptionsButtonProps {
	categories: Category[];
	movementTypes: MovementType[];
	userCurrency: string;
}

export function InputOptionsButton({
	categories,
	movementTypes,
	userCurrency,
}: InputOptionsButtonProps) {
	const [showOptions, setShowOptions] = useState(false);
	const t = useTranslations("navigation");
	const optionClassName =
		"flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setShowOptions((open) => !open)}
				className="group flex w-full flex-col items-center justify-center rounded-xl p-1 text-primary transition-colors hover:bg-primary/10"
				aria-label={t("addOptions")}
				aria-expanded={showOptions}
				aria-controls="mobile-input-options"
			>
				<span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
					<Plus className="size-5" />
				</span>
				<span className="mt-1 text-xs font-medium">{t("add")}</span>
			</button>

			<fieldset
				id="mobile-input-options"
				aria-label={t("addOptions")}
				onClickCapture={() => setShowOptions(false)}
				className={cn(
					"fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[60] rounded-2xl border border-border bg-card p-2 shadow-lg",
					!showOptions && "hidden",
				)}
			>
				<AddMovement
					categories={categories}
					userCurrency={userCurrency}
					trigger={
						<button type="button" className={optionClassName}>
							<Plus className="size-5 text-primary" />
							{t("addMovement")}
						</button>
					}
				/>
				<ReadFileModalButton
					categories={categories}
					movementTypes={movementTypes}
					userCurrency={userCurrency}
					trigger={
						<button type="button" className={optionClassName}>
							<FileText className="size-5 text-primary" />
							{t("importFile")}
						</button>
					}
				/>
				<CreateMovementFromAudio
					categories={categories}
					movementTypes={movementTypes}
					userCurrency={userCurrency}
					trigger={
						<button type="button" className={optionClassName}>
							<Mic className="size-5 text-primary" />
							{t("recordAudio")}
						</button>
					}
				/>
			</fieldset>

			{showOptions && (
				<div
					className="fixed inset-0 z-[55]"
					onClick={() => setShowOptions(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setShowOptions(false);
						}
					}}
					role="button"
					tabIndex={0}
				/>
			)}
		</div>
	);
}
