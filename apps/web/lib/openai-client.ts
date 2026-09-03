/**
 * OpenAI Client Utilities
 * Proporciona funciones para acceder a la API key de OpenAI almacenada en localStorage
 */

const OPENAI_KEY_STORAGE = "openai_api_key";

/**
 * Obtiene la API key de OpenAI desde el localStorage
 * @returns La API key si existe, null si no está configurada
 */
export function getOpenAIKey(): string | null {
	if (typeof window === "undefined") {
		return null;
	}
	return localStorage.getItem(OPENAI_KEY_STORAGE);
}

/**
 * Verifica si hay una API key de OpenAI configurada
 * @returns true si existe una API key, false en caso contrario
 */
export function hasOpenAIKey(): boolean {
	return getOpenAIKey() !== null;
}

/**
 * Guarda la API key de OpenAI en el localStorage
 * @param apiKey - La API key a guardar
 */
export function setOpenAIKey(apiKey: string): void {
	if (typeof window === "undefined") {
		return;
	}
	localStorage.setItem(OPENAI_KEY_STORAGE, apiKey);
}

/**
 * Elimina la API key de OpenAI del localStorage
 */
export function removeOpenAIKey(): void {
	if (typeof window === "undefined") {
		return;
	}
	localStorage.removeItem(OPENAI_KEY_STORAGE);
}
