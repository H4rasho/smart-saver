import { StepperOnboarding } from "@/app/(auth)/welcome/components/stepper-onboarding";
import { getCurrencyByCountry } from "@/lib/get-currency-by-country";

export default async function Home() {
	const country = await getCurrencyByCountry();

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 pb-10 gap-8 sm:p-8 sm:pb-20 sm:gap-16 lg:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-4 sm:gap-[32px] row-start-2 items-center w-full px-2 sm:px-0">
				<StepperOnboarding currency={country} />
			</main>
		</div>
	);
}
