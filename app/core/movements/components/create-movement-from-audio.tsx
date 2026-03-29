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
import type { Category } from "@/types/income";
import { Mic, Play, Sparkles, Square, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import {
	extractMovementsFromAudioAction,
	saveManyMovementsAction,
} from "../actions/movments-actions";
import type { CreateMovement } from "../types/movement-type";
import { MovementsPreviewModal } from "./movements-preview-modal";

interface CreateMovementFromAudioProps {
	categories: Category[];
	movementTypes: MovementType[];
	userCurrency: string;
}

function formatDuration(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function CreateMovementFromAudio({
	categories,
	movementTypes,
	userCurrency,
}: CreateMovementFromAudioProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
	const [recordingDuration, setRecordingDuration] = useState(0);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const [state, formAction, isPending] = useActionState(
		extractMovementsFromAudioAction,
		{ movements: [], error: null },
	);

	useEffect(() => {
		if (state.movements && state.movements.length > 0) {
			setPreviewOpen(true);
			setIsOpen(false);
		}
	}, [state.movements]);

	useEffect(() => {
		if (!isOpen) {
			stopRecording();
			setRecordedBlob(null);
			setRecordingDuration(0);
		}
	}, [isOpen]);

	useEffect(() => {
		if (isRecording) {
			timerRef.current = setInterval(() => {
				setRecordingDuration((prev) => prev + 1);
			}, 1000);
		} else if (timerRef.current) {
			clearInterval(timerRef.current);
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isRecording]);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: "audio/webm;codecs=opus",
			});
			mediaRecorderRef.current = mediaRecorder;
			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
				setRecordedBlob(blob);
			};

			mediaRecorder.start();
			setIsRecording(true);
			setRecordingDuration(0);
		} catch (error) {
			console.error("Error accessing microphone:", error);
			toast.error(
				"Error al acceder al micrófono. Por favor, permite el acceso.",
			);
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}

		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}
	};

	const playRecording = () => {
		if (recordedBlob) {
			const audioUrl = URL.createObjectURL(recordedBlob);
			const audio = new Audio(audioUrl);
			audio.onended = () => URL.revokeObjectURL(audioUrl);
			audio.play();
		}
	};

	const handleFormSubmit = (formData: FormData) => {
		if (recordedBlob) {
			formData.append("audio", recordedBlob, "recording.webm");
			formAction(formData);
		}
	};

	const handleConfirm = async (editedMovements: CreateMovement[]) => {
		await saveManyMovementsAction(editedMovements);
		setPreviewOpen(false);
		setIsOpen(false);
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<button
						type="button"
						aria-label="Grabar audio"
						className="flex flex-col items-center justify-center"
					>
						<Mic
							size={20}
							className="text-foreground/70 transition-colors hover:text-primary"
						/>
					</button>
				</DialogTrigger>
				<DialogContent className="top-auto bottom-0 left-0 right-0 flex max-h-[92vh] w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[1.75rem] rounded-b-none border-x-0 border-b-0 p-0 sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:right-auto sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border">
					<DialogHeader className="border-b bg-gradient-to-b from-primary/[0.08] via-background to-background px-5 pt-6 pb-5 text-left sm:px-6">
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary"
							>
								<Sparkles className="size-3.5" />
								Captura por voz
							</Badge>
						</div>
						<div className="space-y-2">
							<DialogTitle className="text-xl sm:text-2xl">
								Graba tus movimientos y revísalos después
							</DialogTitle>
							<DialogDescription className="text-sm leading-6">
								Habla con naturalidad: puedes mencionar fecha, monto, categoría
								o si es ingreso/gasto. Luego te mostraremos una vista previa
								editable.
							</DialogDescription>
						</div>
					</DialogHeader>

					<div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
						<div className="rounded-2xl border bg-card p-5 shadow-sm">
							<div className="flex flex-col items-center justify-center gap-4 text-center">
								<div
									className={`rounded-full border p-5 ${isRecording ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400" : "border-primary/20 bg-primary/10 text-primary"}`}
								>
									{isRecording ? (
										<Waves className="size-8 animate-pulse" />
									) : (
										<Mic className="size-8" />
									)}
								</div>

								<div className="space-y-1">
									<p className="text-lg font-semibold">
										{isRecording
											? "Grabando ahora"
											: recordedBlob
												? "Grabación lista para procesar"
												: "Listo para comenzar"}
									</p>
									<p className="text-sm text-muted-foreground">
										{isRecording
											? "Habla con calma y separa cada movimiento para mejorar el resultado."
											: recordedBlob
												? "Puedes escucharlo o enviarlo para extraer los movimientos."
												: "Presiona grabar cuando tengas listo el resumen de tus movimientos."}
									</p>
								</div>

								<div className="rounded-2xl border bg-muted/25 px-4 py-3 text-center shadow-xs">
									<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Duración
									</p>
									<p className="mt-1 text-2xl font-semibold tabular-nums">
										{formatDuration(recordingDuration)}
									</p>
								</div>

								<div className="flex flex-wrap justify-center gap-3">
									{!isRecording && !recordedBlob && (
										<Button
											type="button"
											onClick={startRecording}
											className="h-11 rounded-full px-6"
										>
											<Mic className="mr-2 h-4 w-4" />
											Grabar
										</Button>
									)}

									{isRecording && (
										<Button
											type="button"
											onClick={stopRecording}
											variant="outline"
											className="h-11 rounded-full px-6"
										>
											<Square className="mr-2 h-4 w-4" />
											Detener
										</Button>
									)}

									{recordedBlob && !isRecording && (
										<>
											<Button
												type="button"
												onClick={playRecording}
												variant="outline"
												className="h-11 rounded-full px-6"
											>
												<Play className="mr-2 h-4 w-4" />
												Reproducir
											</Button>
											<Button
												type="button"
												onClick={() => {
													setRecordedBlob(null);
													setRecordingDuration(0);
												}}
												variant="outline"
												className="h-11 rounded-full px-6"
											>
												Nueva grabación
											</Button>
										</>
									)}
								</div>
							</div>
						</div>

						{recordedBlob && !isRecording && (
							<form
								action={handleFormSubmit}
								className="rounded-2xl border border-dashed bg-muted/20 p-4 sm:p-5"
							>
								<div className="mb-4 space-y-1">
									<h3 className="font-semibold">Procesar grabación</h3>
									<p className="text-sm text-muted-foreground">
										Convertiremos el audio en movimientos sugeridos para que los
										ajustes antes de guardar.
									</p>
								</div>
								<Button
									type="submit"
									className="h-11 w-full"
									disabled={isPending}
								>
									{isPending ? "Procesando audio..." : "Extraer movimientos"}
								</Button>
							</form>
						)}

						{state.error && (
							<div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
								{state.error}
							</div>
						)}
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
