"use client";

import { updateUserCurrency } from "@/app/core/user/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CurrencySettingsProps {
	currentCurrency: string;
}

const COMMON_CURRENCIES = [
	{ code: "CLP", name: "Peso Chileno", symbol: "$" },
	{ code: "USD", name: "Dólar Estadounidense", symbol: "$" },
	{ code: "EUR", name: "Euro", symbol: "€" },
	{ code: "MXN", name: "Peso Mexicano", symbol: "$" },
	{ code: "ARS", name: "Peso Argentino", symbol: "$" },
	{ code: "COP", name: "Peso Colombiano", symbol: "$" },
	{ code: "PEN", name: "Sol Peruano", symbol: "S/" },
	{ code: "BRL", name: "Real Brasileño", symbol: "R$" },
	{ code: "GBP", name: "Libra Esterlina", symbol: "£" },
];

export function CurrencySettings({ currentCurrency }: CurrencySettingsProps) {
	const [currency, setCurrency] = useState(currentCurrency);
	const [customCurrency, setCustomCurrency] = useState("");
	const [showCustom, setShowCustom] = useState(
		!COMMON_CURRENCIES.some((c) => c.code === currentCurrency),
	);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const finalCurrency = showCustom ? customCurrency : currency;

			if (!finalCurrency.trim()) {
				toast.error("Por favor, ingresa una moneda válida");
				return;
			}

			const result = await updateUserCurrency(finalCurrency.toUpperCase());

			if (result.success) {
				toast.success(result.message);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Error al actualizar la moneda");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-3">
				<Label>Selecciona tu moneda</Label>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
					{COMMON_CURRENCIES.map((curr) => (
						<Button
							key={curr.code}
							type="button"
							variant={
								currency === curr.code && !showCustom ? "default" : "outline"
							}
							className="justify-start relative"
							onClick={() => {
								setCurrency(curr.code);
								setShowCustom(false);
							}}
						>
							{currency === curr.code && !showCustom && (
								<Check className="w-4 h-4 mr-2" />
							)}
							<span className="flex-1 text-left">
								{curr.symbol} {curr.code}
							</span>
						</Button>
					))}
					<Button
						type="button"
						variant={showCustom ? "default" : "outline"}
						className="justify-start relative col-span-2 sm:col-span-1"
						onClick={() => setShowCustom(true)}
					>
						{showCustom && <Check className="w-4 h-4 mr-2" />}
						<span className="flex-1 text-left">Otra...</span>
					</Button>
				</div>
			</div>

			{showCustom && (
				<div className="space-y-2">
					<Label htmlFor="custom-currency">Moneda personalizada</Label>
					<Input
						id="custom-currency"
						placeholder="Ej: JPY, CHF, etc."
						value={customCurrency}
						onChange={(e) =>
							setCustomCurrency(e.target.value.toUpperCase().slice(0, 3))
						}
						maxLength={3}
					/>
					<p className="text-sm text-muted-foreground">
						Ingresa el código de 3 letras de la moneda
					</p>
				</div>
			)}

			<Button
				onClick={handleSave}
				disabled={isSaving}
				className="w-full sm:w-auto"
			>
				<Save className="w-4 h-4 mr-2" />
				{isSaving ? "Guardando..." : "Guardar cambios"}
			</Button>
		</div>
	);
}
