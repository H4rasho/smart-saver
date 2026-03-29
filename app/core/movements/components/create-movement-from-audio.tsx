"use client";

import type { MovementType } from "@/app/core/movement-types.ts/types/movement-type-types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { Category } from "@/types/income";
import { Mic, Play, Square } from "lucide-react";
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

	// useActionState para manejar la extracción de movimientos
	const [state, formAction, isPending] = useActionState(
		extractMovementsFromAudioAction,
		{ movements: [], error: null },
	);

	// Abre el modal de preview cuando hay movimientos extraídos
	useEffect(() => {
		if (state.movements && state.movements.length > 0) {
			setPreviewOpen(true);
		}
	}, [state.movements]);

	// Limpiar recursos al cerrar modal
	useEffect(() => {
		if (!isOpen) {
			stopRecording();
			setRecordedBlob(null);
			setRecordingDuration(0);
		}
	}, [isOpen]);

	// Timer para la duración de grabación
	useEffect(() => {
		if (isRecording) {
			timerRef.current = setInterval(() => {
				setRecordingDuration((prev) => prev + 1);
			}, 1000);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
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
			audio.play();
		}
	};

	const handleFormSubmit = (formData: FormData) => {
		if (recordedBlob) {
			formData.append("audio", recordedBlob, "recording.webm");
			formAction(formData);
		}
	};

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	// Guardar movimientos editados
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
						aria-label="Grabar Audio"
						className="flex flex-col items-center justify-center"
					>
						<Mic
							size={20}
							className="text-foreground/70 hover:text-primary transition-colors"
						/>
					</button>
				</DialogTrigger>
				<DialogContent className="max-w-3xl mx-auto fixed top-auto bottom-0 left-0 right-0 translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none max-h-[90vh] w-full data-[state=open]:!animate-fade-in-up">
					<DialogHeader>
						<DialogTitle>Grabar gastos e ingresos</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						{/* Estado de grabación */}
						<div className="text-center py-4">
							{isRecording && (
								<div className="space-y-2">
									<div className="text-red-500 font-semibold">
										🔴 Grabando...
									</div>
									<div className="text-lg font-mono">
										{formatDuration(recordingDuration)}
									</div>
								</div>
							)}
							{recordedBlob && !isRecording && (
								<div className="space-y-2">
									<div className="text-green-500 font-semibold">
										✓ Grabación lista
									</div>
									<div className="text-sm text-zinc-500">
										Duración: {formatDuration(recordingDuration)}
									</div>
								</div>
							)}
							{!isRecording && !recordedBlob && (
								<div className="text-zinc-500">
									Presiona grabar para comenzar
								</div>
							)}
						</div>

						{/* Controles de grabación */}
						<div className="flex justify-center gap-4">
							{!isRecording && !recordedBlob && (
								<Button
									type="button"
									onClick={startRecording}
									className="bg-red-500 hover:bg-red-600"
								>
									<Mic className="mr-2 h-4 w-4" />
									Grabar
								</Button>
							)}

							{isRecording && (
								<Button type="button" onClick={stopRecording} variant="outline">
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
									>
										Nueva grabación
									</Button>
								</>
							)}
						</div>

						{/* Formulario de procesamiento */}
						{recordedBlob && !isRecording && (
							<form action={handleFormSubmit} className="space-y-4">
								<Button type="submit" className="w-full" disabled={isPending}>
									{isPending ? "Procesando..." : "Procesar audio"}
								</Button>
							</form>
						)}

						{state.error && (
							<div className="text-red-500 text-sm text-center">
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
