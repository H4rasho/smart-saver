import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CONFIG } from "@/config/config";

const { APP_NAME } = CONFIG;

interface CreateProfileProps {
	onSubmit: () => void;
	isLoading: boolean;
}

export function CreateProfile({ onSubmit, isLoading }: CreateProfileProps) {
	return (
		<div className="flex flex-col gap-4 items-center">
			<h3 className="font-medium text-sm sm:text-base">Crea tu perfil</h3>
			<p className="text-muted-foreground text-center max-w-xs text-xs sm:text-sm">
				¡Ya casi terminas! Revisa tu información y crea tu perfil para comenzar
				a usar {APP_NAME}.
			</p>
			<Button
				type="submit"
				className="mt-4 w-full max-w-xs text-xs sm:text-sm"
				onClick={onSubmit}
			>
				{isLoading ? <Spinner className="mr-2" /> : "Crear perfil"}
			</Button>
		</div>
	);
}
