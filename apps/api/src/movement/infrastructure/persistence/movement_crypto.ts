import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function getKey(): Buffer {
	const value = process.env.ENCRYPTION_KEY;
	if (!value || !/^[0-9a-fA-F]{64}$/.test(value)) {
		throw new Error("ENCRYPTION_KEY must be 64 hex characters");
	}
	return Buffer.from(value, "hex");
}

export function encryptMovementField(value: string): string {
	const iv = randomBytes(16);
	const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
	const encrypted = cipher.update(value, "utf8", "hex") + cipher.final("hex");
	return `${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted}`;
}

export function decryptMovementField(value: string): string {
	if (!value.includes(":")) return value;
	const parts = value.split(":");
	if (parts.length !== 3) throw new Error("Invalid movement ciphertext");
	const [iv, tag, ciphertext] = parts;
	const decipher = createDecipheriv(
		"aes-256-gcm",
		getKey(),
		Buffer.from(iv, "hex"),
	);
	decipher.setAuthTag(Buffer.from(tag, "hex"));
	return decipher.update(ciphertext, "hex", "utf8") + decipher.final("utf8");
}
