#!/usr/bin/env node

/**
 * Encryption Key Generator
 *
 * Generates a secure 256-bit (32 bytes) encryption key for AES-256-GCM
 *
 * Usage:
 *   node scripts/generate_encryption_key.js
 */

async function main() {
	const crypto = await import("node:crypto");

	console.log("\n🔐 Generating secure encryption key...\n");

	const key = crypto.randomBytes(32).toString("hex");

	console.log("✅ Your new encryption key:\n");
	console.log(`ENCRYPTION_KEY=${key}\n`);
	console.log("⚠️  IMPORTANT:");
	console.log("   1. Copy this key to your .env file");
	console.log("   2. Keep it secure - never commit it to version control");
	console.log("   3. Save a backup in a secure location");
	console.log(
		"   4. If you lose this key, encrypted data cannot be recovered\n",
	);
	console.log("📋 Add to .env:");
	console.log(`   ENCRYPTION_KEY=${key}\n`);
}

main().catch((error) => {
	console.error("No se pudo generar la llave de encriptación", error);
	process.exit(1);
});
