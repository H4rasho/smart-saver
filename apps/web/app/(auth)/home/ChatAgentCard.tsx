import { ArrowRight, Bot, MessageCircleMore } from "lucide-react";
import Link from "next/link";

export function ChatAgentCard() {
	return (
		<div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-700 dark:to-blue-500 shadow-lg flex items-center gap-4 p-4">
			<MessageCircleMore size={28} />
			<div className="flex-1">
				<h3 className="text-white text-lg font-semibold flex mb-1 w-full gap-2">
					Chatea con tu Agente IA
					<Bot className="" />
				</h3>
				<p className="text-white/90 text-sm text-pretty">
					¿Tienes dudas sobre tus finanzas? Habla ahora con nuestro agente
					inteligente y recibe asesoría personalizada.
				</p>
			</div>
			<div className="flex-shrink-0">
				<Link href="/chat" aria-label="Ir al chat IA">
					<ArrowRight size={44} />
				</Link>
			</div>
		</div>
	);
}
