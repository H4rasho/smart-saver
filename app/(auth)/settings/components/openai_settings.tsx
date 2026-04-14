"use client";

import { OpenAISettingsLoadingFixture } from "@/app/(auth)/components/loading_skeletons";
import {
	deleteUserOpenAIKey,
	testUserOpenAIKey,
	updateUserOpenAIKey,
} from "@/app/core/user/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "boneyard-js/react";
import { Eye, EyeOff, Key, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OpenAISettingsProps {
	initialHasExistingKey?: boolean;
}

interface OpenAISettingsContentProps {
	apiKey: string;
	hasExistingKey: boolean;
	showApiKey: boolean;
	isSaving: boolean;
	isDeleting: boolean;
	isTesting: boolean;
	onApiKeyChange?: (value: string) => void;
	onToggleVisibility?: () => void;
	onSave?: () => void;
	onTest?: () => void;
	onDelete?: () => void;
}

function OpenAISettingsContent({
	apiKey,
	hasExistingKey,
	showApiKey,
	isSaving,
	isDeleting,
	isTesting,
	onApiKeyChange,
	onToggleVisibility,
	onSave,
	onTest,
	onDelete,
}: OpenAISettingsContentProps) {
	const isBusy = isSaving || isDeleting || isTesting;

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
				<div className="flex items-start gap-3">
					<Key className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
					<div className="space-y-2 text-sm">
						<p className="font-semibold text-foreground">
							⚠️ Información de Seguridad
						</p>
						<ul className="space-y-1 text-muted-foreground">
							<li>
								• Tu API key se guarda <strong>cifrada en el servidor</strong> y
								solo se usa para ejecutar las funciones de IA
							</li>
							<li>• La API key es personal y no debe compartirse con nadie</li>
							<li>
								• Si limpias los datos del navegador, deberás volver a
								ingresarla
							</li>
							<li>
								• Puedes obtener tu API key en:{" "}
								<a
									href="https://platform.openai.com/api-keys"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									platform.openai.com/api-keys
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<Label htmlFor="openai-key">API Key de OpenAI</Label>
					{hasExistingKey ? (
						<p className="flex items-center gap-2 text-sm text-success">
							<span className="h-2 w-2 rounded-full bg-success" />
							API key configurada
						</p>
					) : null}
				</div>
				<div className="relative">
					<Input
						id="openai-key"
						type={showApiKey ? "text" : "password"}
						placeholder="sk-..."
						value={apiKey}
						onChange={(event) => onApiKeyChange?.(event.target.value)}
						className="pr-10"
						disabled={isBusy}
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
						onClick={onToggleVisibility}
						disabled={isBusy}
					>
						{showApiKey ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</Button>
				</div>
				<p className="text-sm text-muted-foreground">
					{hasExistingKey
						? "Puedes reemplazar tu clave actual pegando una nueva y guardando los cambios."
						: "Guarda tu API key para habilitar las funciones de inteligencia artificial."}
				</p>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row">
				<Button
					onClick={onSave}
					disabled={isBusy || !apiKey.trim()}
					className="flex-1 sm:flex-none"
				>
					<Save className="mr-2 h-4 w-4" />
					{isSaving ? "Guardando..." : "Guardar API Key"}
				</Button>

				{hasExistingKey ? (
					<>
						<Button
							onClick={onTest}
							variant="outline"
							className="flex-1 sm:flex-none"
							disabled={isBusy}
						>
							<Key className="mr-2 h-4 w-4" />
							{isTesting ? "Probando..." : "Probar Conexión"}
						</Button>

						<Button
							onClick={onDelete}
							variant="destructive"
							className="flex-1 sm:flex-none"
							disabled={isBusy}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							{isDeleting ? "Eliminando..." : "Eliminar"}
						</Button>
					</>
				) : null}
			</div>

			<div className="rounded-lg border border-border bg-muted/50 p-4">
				<h4 className="mb-2 text-sm font-semibold text-foreground">
					¿Para qué se usa la API key?
				</h4>
				<p className="text-sm text-muted-foreground">
					La API key de OpenAI se utiliza para potenciar funcionalidades de
					inteligencia artificial en la aplicación, como análisis de gastos,
					sugerencias personalizadas y procesamiento de lenguaje natural. Sin
					ella, estas funciones no estarán disponibles.
				</p>
			</div>
		</div>
	);
}

export function OpenAISettings({
	initialHasExistingKey = false,
}: OpenAISettingsProps) {
	const isInitializing = initialHasExistingKey === undefined;
	const [apiKey, setApiKey] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isTesting, setIsTesting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [hasExistingKey, setHasExistingKey] = useState(
		initialHasExistingKey ?? false,
	);

	const handleSave = async () => {
		if (!apiKey.trim()) {
			toast.error("Por favor, ingresa una API key válida");
			return;
		}

		if (!apiKey.startsWith("sk-")) {
			toast.warning(
				"La API key debería comenzar con 'sk-'. Verifica que sea correcta.",
			);
		}

		setIsSaving(true);
		try {
			const result = await updateUserOpenAIKey(apiKey.trim());
			if (result.success) {
				setHasExistingKey(true);
				toast.success(result.message);
				return;
			}
			toast.error(result.message);
		} catch (error) {
			toast.error("Error al guardar la API key");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteUserOpenAIKey();
			if (result.success) {
				setApiKey("");
				setHasExistingKey(false);
				toast.success(result.message);
				return;
			}
			toast.error(result.message);
		} catch (error) {
			toast.error("Error al eliminar la API key");
			console.error(error);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleTest = async () => {
		toast.info("Probando conexión con OpenAI...");
		setIsTesting(true);

		try {
			if (!apiKey.trim() && !hasExistingKey) {
				toast.error("Por favor, guarda una API key primero");
				return;
			}

			if (apiKey.trim()) {
				const saveResult = await updateUserOpenAIKey(apiKey.trim());
				if (!saveResult.success) {
					toast.error(saveResult.message);
					return;
				}
				setHasExistingKey(true);
			}

			const result = await testUserOpenAIKey();
			if (result.success) {
				toast.success(`✅ ${result.message}`);
				return;
			}
			toast.error(`❌ ${result.message}`);
		} catch (error) {
			toast.error("Error al conectar con OpenAI");
			console.error(error);
		} finally {
			setIsTesting(false);
		}
	};

	const fixture = <OpenAISettingsLoadingFixture />;

	return (
		<Skeleton
			loading={isInitializing}
			name="settings-openai-panel"
			fixture={fixture}
			fallback={fixture}
			transition={true}
		>
			<OpenAISettingsContent
				apiKey={apiKey}
				hasExistingKey={hasExistingKey}
				showApiKey={showApiKey}
				isSaving={isSaving}
				isDeleting={isDeleting}
				isTesting={isTesting}
				onApiKeyChange={setApiKey}
				onToggleVisibility={() =>
					setShowApiKey((currentValue) => !currentValue)
				}
				onSave={handleSave}
				onTest={handleTest}
				onDelete={handleDelete}
			/>
		</Skeleton>
	);
}
