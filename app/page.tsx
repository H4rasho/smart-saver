import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CONFIG } from "@/config/config";
import { SignInButton } from "@clerk/nextjs";
import {
	ArrowRight,
	PieChart,
	Shield,
	Smartphone,
	TrendingDown,
	Wallet,
	Zap,
} from "lucide-react";
import Link from "next/link";

const { APP_NAME } = CONFIG;
const CURRENT_YEAR = new Date().getFullYear();

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-black text-white">
			{/* Header */}
			<header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-sky-400 rounded-lg flex items-center justify-center">
							<Wallet className="w-5 h-5 text-black" />
						</div>
						<span className="text-xl font-bold">{APP_NAME}</span>
					</div>
					<SignInButton mode="modal">
						<Button
							variant="outline"
							className="border-gray-700 hover:bg-gray-800 bg-transparent"
						>
							Iniciar Sesión
						</Button>
					</SignInButton>
				</div>
			</header>

			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16 md:py-24 text-center">
				<Badge
					variant="secondary"
					className="mb-6 bg-gray-800 text-gray-300 border-gray-700"
				>
					<Zap className="w-3 h-3 mr-1" />
					Nueva versión disponible
				</Badge>

				<h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
					Controla tus gastos
					<br />
					<span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
						como nunca antes
					</span>
				</h1>

				<p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
					La app más intuitiva para gestionar tus finanzas personales. Rastrea
					gastos, establece presupuestos y alcanza tus metas financieras.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<SignInButton mode="modal">
						<Button
							size="lg"
							className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-black font-semibold px-8"
						>
							Comenzar Gratis
							<ArrowRight className="w-4 h-4 ml-2" />
						</Button>
					</SignInButton>
					<SignInButton mode="modal">
						<Button
							variant="outline"
							size="lg"
							className="border-gray-700 hover:bg-gray-800 bg-transparent"
						>
							Ver Demo
						</Button>
					</SignInButton>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Todo lo que necesitas en una app
					</h2>
					<p className="text-gray-400 text-lg max-w-2xl mx-auto">
						Herramientas poderosas diseñadas para simplificar tu vida financiera
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors group">
						<CardContent className="p-6">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-sky-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<TrendingDown className="w-6 h-6 text-blue-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">
								Seguimiento Automático
							</h3>
							<p className="text-gray-400">
								Conecta tus cuentas bancarias y tarjetas para un seguimiento
								automático de gastos
							</p>
						</CardContent>
					</Card>

					<Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors group">
						<CardContent className="p-6">
							<div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<PieChart className="w-6 h-6 text-purple-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">
								Análisis Inteligente
							</h3>
							<p className="text-gray-400">
								Visualiza tus patrones de gasto con gráficos interactivos y
								reportes detallados
							</p>
						</CardContent>
					</Card>

					<Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors group">
						<CardContent className="p-6">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<Shield className="w-6 h-6 text-blue-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Seguridad Total</h3>
							<p className="text-gray-400">
								Encriptación de nivel bancario para mantener tus datos
								financieros seguros
							</p>
						</CardContent>
					</Card>

					<Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors group">
						<CardContent className="p-6">
							<div className="w-12 h-12 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<Smartphone className="w-6 h-6 text-orange-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Mobile First</h3>
							<p className="text-gray-400">
								Diseñada para móviles con sincronización en tiempo real en todos
								tus dispositivos
							</p>
						</CardContent>
					</Card>

					<Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors group">
						<CardContent className="p-6">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-sky-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<Wallet className="w-6 h-6 text-blue-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Presupuestos Smart</h3>
							<p className="text-gray-400">
								Crea presupuestos inteligentes que se adaptan a tus hábitos de
								gasto
							</p>
						</CardContent>
					</Card>

					<Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors group">
						<CardContent className="p-6">
							<div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<Zap className="w-6 h-6 text-yellow-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Notificaciones</h3>
							<p className="text-gray-400">
								Alertas personalizadas para mantenerte al día con tus metas
								financieras
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mx-auto px-4 py-16">
				<Card className="bg-gray-900 border-gray-700 shadow-2xl">
					<CardContent className="p-8 md:p-12 text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
							¿Listo para tomar control de tus finanzas?
						</h2>
						<p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
							Únete a miles de usuarios que ya están ahorrando más y gastando
							mejor con {APP_NAME}
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<SignInButton mode="modal">
								<Button
									size="lg"
									className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold px-8 shadow-lg"
								>
									Crear Cuenta Gratis
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</SignInButton>
							<SignInButton mode="modal">
								<Button
									variant="outline"
									size="lg"
									className="border-gray-500 hover:bg-gray-800 bg-transparent text-gray-200 hover:text-white"
								>
									¿Ya tienes cuenta? Inicia Sesión
								</Button>
							</SignInButton>
						</div>
						<p className="text-sm text-gray-400 mt-4">
							Sin tarjeta de crédito • Gratis por 30 días • Cancela cuando
							quieras
						</p>
					</CardContent>
				</Card>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-800 bg-gray-900/50">
				<div className="container mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row items-center justify-between">
						<div className="flex items-center gap-2 mb-4 md:mb-0">
							<div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-sky-400 rounded flex items-center justify-center">
								<Wallet className="w-4 h-4 text-black" />
							</div>
							<span className="font-semibold">{APP_NAME}</span>
						</div>
						<div className="flex gap-6 text-sm text-gray-400">
							<Link href="#" className="hover:text-white transition-colors">
								Privacidad
							</Link>
							<Link href="#" className="hover:text-white transition-colors">
								Términos
							</Link>
							<Link href="#" className="hover:text-white transition-colors">
								Soporte
							</Link>
						</div>
					</div>
					<div className="text-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-800">
						© {CURRENT_YEAR} {APP_NAME}. Todos los derechos reservados.
					</div>
				</div>
			</footer>
		</div>
	);
}
