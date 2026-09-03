"use client";

import { AddMovementForm } from "@/app/core/movements/components/movement-form";
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
import type { Category } from "@/types/income";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";

interface AddMovementProps {
	categories: Category[];
	userCurrency: string;
}

export function AddMovement({ categories, userCurrency }: AddMovementProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						variant="default"
						className="relative h-14 w-14 rounded-full p-0 shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]"
						type="button"
						aria-label="Agregar Gasto"
					>
						<span className="absolute inset-0 rounded-full border border-white/20" />
						<Plus size={24} className="size-6" />
					</Button>
				</DialogTrigger>
				<DialogContent className="top-auto bottom-0 left-0 right-0 flex max-h-[92vh] w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[1.75rem] rounded-b-none border-x-0 border-b-0 p-0 sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:right-auto sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border">
					<DialogHeader className="space-y-4 border-b bg-gradient-to-b from-primary/[0.08] via-background to-background px-5 pt-6 pb-5 text-left sm:px-6">
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary"
							>
								<Sparkles className="size-3.5" />
								Nuevo movimiento
							</Badge>
						</div>
						<div className="space-y-2">
							<DialogTitle className="text-xl sm:text-2xl">
								Registrar gasto o ingreso
							</DialogTitle>
							<DialogDescription className="max-w-xl text-sm leading-6">
								Completa los datos clave en un flujo simple. El formulario
								prioriza monto, contexto y fecha para que cargar movimientos sea
								rápido desde móvil o escritorio.
							</DialogDescription>
						</div>
					</DialogHeader>

					<div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
						<AddMovementForm
							categories={categories}
							onSuccess={() => setOpen(false)}
							userCurrency={userCurrency}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
