import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "SmartSaver - Gestión Inteligente de Finanzas Personales",
		short_name: "SmartSaver",
		description:
			"Administra tus finanzas personales de forma segura con encriptación AES-256-GCM. Controla gastos, ingresos y categorías con inteligencia artificial.",
		start_url: "/",
		display: "standalone",
		background_color: "#8158f8",
		theme_color: "#8158f8",
		icons: [
			{
				src: "/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
