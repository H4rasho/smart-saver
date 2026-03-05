import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Encryption library using AES-256-GCM
 * Provides secure encryption for sensitive data in the database
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // AES block size

/**
 * Gets the encryption key from environment variables
 * @throws {Error} If ENCRYPTION_KEY is not set
 */
function getEncryptionKey(): Buffer {
	const key = process.env.ENCRYPTION_KEY;
	if (!key) {
		throw new Error(
			"ENCRYPTION_KEY environment variable is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
		);
	}

	// Validate key length (must be 32 bytes = 64 hex chars for AES-256)
	if (key.length !== 64) {
		throw new Error(
			"ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate a new one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
		);
	}

	return Buffer.from(key, "hex");
}

/**
 * Encrypts a string value using AES-256-GCM
 * @param text - The text to encrypt
 * @returns Encrypted string in format: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
	try {
		if (!text || text.trim() === "") {
			return text; // Don't encrypt empty strings
		}

		const key = getEncryptionKey();
		const iv = randomBytes(IV_LENGTH);
		const cipher = createCipheriv(ALGORITHM, key, iv);

		let encrypted = cipher.update(text, "utf8", "hex");
		encrypted += cipher.final("hex");

		const authTag = cipher.getAuthTag().toString("hex");

		// Format: iv:authTag:encryptedData
		return `${iv.toString("hex")}:${authTag}:${encrypted}`;
	} catch (error) {
		console.error("Encryption error:", error);
		throw new Error("Failed to encrypt data");
	}
}

/**
 * Decrypts a string that was encrypted with the encrypt function
 * @param encryptedData - The encrypted string in format: iv:authTag:encryptedData
 * @returns Decrypted original text
 */
export function decrypt(encryptedData: string): string {
	try {
		if (!encryptedData || encryptedData?.trim() === "") {
			return encryptedData; // Return empty strings as-is
		}

		// Check if data is encrypted (has the expected format)
		if (!encryptedData.includes(":")) {
			// Data might not be encrypted (backwards compatibility)
			console.warn("Data appears to be unencrypted, returning as-is");
			return encryptedData;
		}

		const parts = encryptedData.split(":");
		if (parts.length !== 3) {
			throw new Error("Invalid encrypted data format");
		}

		const [ivHex, authTagHex, encrypted] = parts;

		const key = getEncryptionKey();
		const iv = Buffer.from(ivHex, "hex");
		const authTag = Buffer.from(authTagHex, "hex");

		const decipher = createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);

		let decrypted = decipher.update(encrypted, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		console.error("Decryption error:", error);
		throw new Error("Failed to decrypt data");
	}
}

/**
 * Encrypts a number by converting it to string first
 * @param value - The number to encrypt
 * @returns Encrypted string
 */
export function encryptNumber(value: number): string {
	return encrypt(value.toString());
}

/**
 * Decrypts a string back to a number
 * @param encryptedValue - The encrypted number string
 * @returns Original number
 */
export function decryptNumber(encryptedValue: string): number {
	const decrypted = decrypt(encryptedValue);
	const num = Number.parseFloat(decrypted);

	if (Number.isNaN(num)) {
		throw new Error("Decrypted value is not a valid number");
	}

	return num;
}

/**
 * Utility to check if a string appears to be encrypted
 * @param value - String to check
 * @returns true if the string appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
	if (!value || typeof value !== "string") {
		return false;
	}

	const parts = value.split(":");
	return parts.length === 3 && parts.every((part) => /^[0-9a-f]+$/.test(part));
}
