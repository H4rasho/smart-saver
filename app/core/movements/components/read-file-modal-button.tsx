"use client";

import type { MovementType } from "@/app/core/movement-types.ts/types/movement-type-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/income";
import { FileText, Sparkles, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import {
	extractMovementsFromFileAction,
	saveManyMovementsAction,
} from "../actions/movments-actions";
import type { CreateMovement } from "../types/movement-type";
import { MovementsPreviewModal } from "./movements-preview-modal";

interface ReadFileModalButtonProps {
	categories: Category[];
	movementTypes: MovementType[];
	userCurrency: string;
}

export function ReadFileModalButton({
	categories,
	movementTypes,
	userCurrency,
}: ReadFileModalButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [selectedFileName, setSelectedFileName] = useState<string>("");

	const [state, formAction, isPending] = useActionState(
		extractMovementsFromFileAction,
		{ movements: [], error: null },
	);

	useEffect(() => {
		if (state.movements && state.movements.length > 0) {
			setPreviewOpen(true);
			setIsOpen(false);
		}
	}, [state.movements]);

	const handleConfirm = async (editedMovements: CreateMovement[]) => {
		await saveManyMovementsAction(editedMovements);
		setPreviewOpen(false);
		setIsOpen(false);
		setSelectedFileName("");
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<button
						type="button"
						aria-label="Leer archivo"
						className="flex flex-col items-center justify-center"
					>
						<FileText
							size={20}
							className="text-foreground/70 transition-colors hover:text-primary"
						/>
					</button>
				</DialogTrigger>

				<DialogContent className="top-auto bottom-0 left-0 right-0 flex max-h-[92vh] w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[1.75rem] rounded-b-none border-x-0 border-b-0 p-0 sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:right-auto sm:max-w-xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border">
					<DialogHeader className="border-b bg-gradient-to-b from-primary/[0.08] via-background to-background px-5 pt-6 pb-5 text-left sm:px-6">
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary"
							>
								<Sparkles className="size-3.5" />
								Importar movimientos
							</Badge>
						</div>
						<div className="space-y-2">
							<DialogTitle className="text-xl sm:text-2xl">
								Sube tu estado de cuenta o reporte
							</DialogTitle>
							<DialogDescription className="text-sm leading-6">
								Procesaremos el archivo para sugerir movimientos editables antes
								de guardarlos.
							</DialogDescription>
						</div>
					</DialogHeader>

					<div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
						<div className="rounded-2xl border border-dashed bg-muted/25 p-4 sm:p-5">
							<div className="mb-4 flex items-start gap-3">
								<div className="rounded-2xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
									<Upload className="size-5" />
								</div>
								<div className="space-y-1">
									<h3 className="font-semibold">Archivo compatible</h3>
									<p className="text-sm leading-6 text-muted-foreground">
										Usa un PDF con fechas, descripciones y montos visibles.
										Luego podrás revisar cada movimiento detectado.
									</p>
								</div>
							</div>

							<form action={formAction} className="space-y-4">
								<div className="space-y-2">
									<label htmlFor="file" className="text-sm font-medium">
										Selecciona un archivo
									</label>
									<Input
										name="file"
										id="file"
										type="file"
										accept="application/pdf"
										required
										onChange={(event) =>
											setSelectedFileName(event.target.files?.[0]?.name ?? "")
										}
									/>
									<p className="text-xs text-muted-foreground">
										{selectedFileName
											? `Archivo listo: ${selectedFileName}`
											: "Formato recomendado: PDF de tu banco o exportación mensual."}
									</p>
								</div>

								<Button
									type="submit"
									className="h-11 w-full"
									disabled={isPending}
								>
									{isPending ? "Procesando archivo..." : "Analizar archivo"}
								</Button>

								{state.error && (
									<div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
										{state.error}
									</div>
								)}
							</form>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<MovementsPreviewModal
				open={previewOpen}
				movements={state.movements}
				userCurrency={userCurrency}
				categories={categories}
				movementTypes={movementTypes}
				onCancel={() => setPreviewOpen(false)}
				onConfirm={handleConfirm}
			/>
		</>
	);
}
