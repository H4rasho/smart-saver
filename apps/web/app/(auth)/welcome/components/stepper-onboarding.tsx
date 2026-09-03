"use client";

import { defineStepper } from "@stepperize/react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckYourCurrency } from "./check-your-currency";
import { SelectYourCategories } from "./select-your-categories";

import { CONFIG } from "@/config/config";
import type { Income } from "@/types/income";
import { CreateProfile } from "./create-profile";
import { FixedExpensesForm } from "./fixed-expenses-form";
import { IncomeForm } from "./income-form";

const { APP_NAME } = CONFIG;

const { useStepper, steps, utils } = defineStepper(
	{
		id: "checkYourCurrency",
		title: "Revisa tu moneda",
		description: "Confirma la moneda que usas a diario",
	},
	{
		id: "selectYourCategories",
		title: "Elige tus categorías",
		description: "Selecciona las categorías que quieres usar",
	},
	{
		id: "income",
		title: "Ingresos",
		description: "Agrega tus fuentes de ingreso",
	},
	{
		id: "fixedExpenses",
		title: "Gastos fijos",
		description: "Agrega tus gastos fijos",
	},
	{
		id: "createProfile",
		title: "Crear perfil",
		description: "Finaliza la configuración de tu perfil",
	},
);

const initialCategories = ["comida", "transporte", "salud", "educación"];
interface StepperOnboardingProps {
	currency: string;
}

export function StepperOnboarding({ currency }: StepperOnboardingProps) {
	const [selectedCurrency, setSelectedCurrency] = useState<string>(currency);
	const [categories, setCategories] = useState<string[]>(initialCategories);
	const [incomeSources, setIncomeSources] = useState<Income[]>([]);
	const [fixedExpenses, setFixedExpenses] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const router = useRouter();
	const stepper = useStepper();
	const currentIndex = utils.getIndex(stepper.current.id);

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					selectedCurrency,
					categories,
					incomeSources,
					fixedExpenses,
				}),
			});

			if (response.ok) {
				toast.success("¡Perfil creado con éxito!");
				router.push("/home");
			} else {
				const errorData = await response.json();
				toast.error("No se pudo crear el perfil", {
					description: errorData.message || "Inténtalo de nuevo más tarde.",
				});
				setIsLoading(false);
			}
		} catch (error) {
			console.error(error);
			toast.error("No se pudo crear el perfil", {
				description: "Ocurrió un error inesperado. Inténtalo nuevamente.",
			});
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6 p-4 sm:p-6 border rounded-lg w-full max-w-[500px] mx-auto">
			<div className="flex flex-col sm:flex-row justify-between gap-2">
				<h2 className="text-lg sm:text-xl font-medium">
					Bienvenido a {APP_NAME}
				</h2>
				<div className="flex items-center gap-2">
					<span className="text-xs sm:text-sm text-muted-foreground">
						Paso {currentIndex + 1} de {steps.length}
					</span>
					<div />
				</div>
			</div>
			<nav aria-label="Pasos de configuración" className="group my-4">
				<ol className="flex flex-col gap-2">
					{stepper.all.map((step, index, array) => (
						<Fragment key={step.id}>
							<li className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
								<Button
									type="button"
									role="tab"
									variant={index <= currentIndex ? "default" : "secondary"}
									aria-current={
										stepper.current.id === step.id ? "step" : undefined
									}
									aria-posinset={index + 1}
									aria-setsize={steps.length}
									aria-selected={stepper.current.id === step.id}
									className="flex size-8 sm:size-10 items-center justify-center rounded-full text-xs sm:text-sm"
									onClick={() => stepper.goTo(step.id)}
								>
									{index + 1}
								</Button>
								<span className="text-xs sm:text-sm font-medium">
									{step.title}
								</span>
							</li>
							<div className="flex gap-2 sm:gap-4">
								{index < array.length - 1 && (
									<div
										className="flex justify-center"
										style={{
											paddingInlineStart: "0.875rem",
										}}
									>
										<Separator
											orientation="vertical"
											className={`w-[1px] h-full ${
												index < currentIndex ? "bg-primary" : "bg-muted"
											}`}
										/>
									</div>
								)}
								<div className="flex-1 my-2 sm:my-4">
									{stepper.current.id === step.id &&
										stepper.switch({
											checkYourCurrency: () => (
												<CheckYourCurrency
													currency={selectedCurrency}
													onCurrencyChange={setSelectedCurrency}
												/>
											),
											selectYourCategories: () => (
												<SelectYourCategories
													categories={categories}
													onCategoriesChange={setCategories}
												/>
											),
											income: () => (
												<IncomeForm
													currency={selectedCurrency}
													incomeSources={incomeSources}
													onIncomeSourcesChange={setIncomeSources}
												/>
											),
											fixedExpenses: () => (
												<FixedExpensesForm
													currency={selectedCurrency}
													fixedExpenses={fixedExpenses}
													onFixedExpensesChange={setFixedExpenses}
												/>
											),
											createProfile: () => (
												<CreateProfile
													onSubmit={handleSubmit}
													isLoading={isLoading}
												/>
											),
										})}
								</div>
							</div>
						</Fragment>
					))}
				</ol>
			</nav>
			<div className="space-y-4">
				{!stepper.isLast ? (
					<div className="flex justify-end gap-2 sm:gap-4">
						<Button
							variant="secondary"
							onClick={stepper.prev}
							disabled={stepper.isFirst}
							className="text-xs sm:text-sm px-3 sm:px-4"
						>
							Atrás
						</Button>
						<Button
							onClick={stepper.next}
							className="text-xs sm:text-sm px-3 sm:px-4"
						>
							{stepper.isLast ? "Completar" : "Siguiente"}
						</Button>
					</div>
				) : (
					<Button
						onClick={stepper.reset}
						className="text-xs sm:text-sm px-3 sm:px-4"
					>
						Reiniciar
					</Button>
				)}
			</div>
		</div>
	);
}
