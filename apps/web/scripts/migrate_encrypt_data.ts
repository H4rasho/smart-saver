/**
 * Migration Script: Encrypt Existing Movement Data
 *
 * This script encrypts all existing movements in the database.
 * Run this ONCE after setting up encryption for the first time.
 *
 * Usage:
 *   npx tsx scripts/migrate_encrypt_data.ts
 */

import { movements } from "@/app/core/movements/model/movement-model";
import { db } from "@/database/database";
import { encrypt, encryptNumber, isEncrypted } from "@/lib/encryption";
import { eq } from "drizzle-orm";

async function migrateEncryptData() {
	console.log("🔐 Starting data encryption migration...\n");

	try {
		// Get all movements
		const allMovements = await db.select().from(movements);
		console.log(`📊 Found ${allMovements.length} movements to process\n`);

		if (allMovements.length === 0) {
			console.log("✅ No movements to encrypt. Migration complete!");
			return;
		}

		let encryptedCount = 0;
		let skippedCount = 0;
		let errorCount = 0;

		for (const movement of allMovements) {
			try {
				// Check if data is already encrypted
				const nameAlreadyEncrypted = isEncrypted(movement.name || "");
				const amountStr = String(movement.amount);
				const amountAlreadyEncrypted = isEncrypted(amountStr);

				if (nameAlreadyEncrypted && amountAlreadyEncrypted) {
					console.log(
						`⏭️  Skipping movement ${movement.id} (already encrypted)`,
					);
					skippedCount++;
					continue;
				}

				// Encrypt the data
				const encryptedName = nameAlreadyEncrypted
					? movement.name
					: encrypt(movement.name || "");
				const encryptedAmount = amountAlreadyEncrypted
					? amountStr
					: encryptNumber(Number(movement.amount));

				// Update in database
				await db
					.update(movements)
					.set({
						name: encryptedName,
						amount: encryptedAmount as unknown as number,
					})
					.where(eq(movements.id, movement.id));

				console.log(`✅ Encrypted movement ${movement.id}`);
				encryptedCount++;
			} catch (error) {
				console.error(`❌ Error encrypting movement ${movement.id}:`, error);
				errorCount++;
			}
		}

		console.log(`\n${"=".repeat(50)}`);
		console.log("📈 Migration Summary:");
		console.log(`   ✅ Encrypted: ${encryptedCount}`);
		console.log(`   ⏭️  Skipped (already encrypted): ${skippedCount}`);
		console.log(`   ❌ Errors: ${errorCount}`);
		console.log("=".repeat(50));

		if (errorCount === 0) {
			console.log("\n🎉 Migration completed successfully!");
		} else {
			console.log(
				"\n⚠️  Migration completed with errors. Please review the logs above.",
			);
		}
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
}

// Run the migration
migrateEncryptData()
	.then(() => {
		console.log("\n👋 Exiting...");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 Fatal error:", error);
		process.exit(1);
	});
