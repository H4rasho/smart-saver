"use client";

import type { MovementType } from "@/app/core/movement-types.ts/types/movement-type-types";
import { CreateMovementFromAudio } from "@/app/core/movements/components/create-movement-from-audio";
import { ReadFileModalButton } from "@/app/core/movements/components/read-file-modal-button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/income";
import { Upload } from "lucide-react";
import { useState } from "react";

interface InputOptionsButtonProps {
	categories: Category[];
	movementTypes: MovementType[];
}

export function InputOptionsButton({
	categories,
	movementTypes,
}: InputOptionsButtonProps) {
	const [showOptions, setShowOptions] = useState(false);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setShowOptions(!showOptions)}
				className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-secondary/50 transition-all duration-200 group w-full"
				aria-label="Opciones de entrada"
			>
				<Upload
					size={20}
					className="text-foreground/70 group-hover:text-primary transition-colors duration-200"
				/>
				<span className="text-xs text-foreground/60 group-hover:text-primary font-medium mt-1">
					Importar
				</span>
			</button>

			{/* Modal flotante con opciones */}
			{showOptions && (
				<div
					className={cn(
						"z-[60] rounded-2xl border border-border bg-card p-2 shadow-lg",
						"fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4",
						"sm:absolute sm:bottom-full sm:left-1/2 sm:right-auto sm:mb-2 sm:w-max sm:min-w-44 sm:-translate-x-1/2",
					)}
				>
					<div className="space-y-2">
						<div className="flex flex-col items-center rounded-xl p-2 text-center hover:bg-secondary/30">
							<ReadFileModalButton
								categories={categories}
								movementTypes={movementTypes}
							/>
							<span className="text-xs text-foreground/60 font-medium mt-1">
								Archivo
							</span>
						</div>
						<div className="border-t border-border pt-2">
							<div className="flex flex-col items-center rounded-xl p-2 text-center hover:bg-secondary/30">
								<CreateMovementFromAudio
									categories={categories}
									movementTypes={movementTypes}
								/>
								<span className="text-xs text-foreground/60 font-medium mt-1">
									Audio
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Overlay para cerrar al hacer click fuera */}
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
