#!/usr/bin/env node

/**
 * Database Restore Script
 *
 * Imports pet characters from a JSON backup file into Vercel KV.
 *
 * Usage:
 *   node tools/restore-database.js <backup-file> [--force]
 *
 * Example:
 *   node tools/restore-database.js backups/pets-2025-10-12.json
 *   node tools/restore-database.js backups/pets-2025-10-12.json --force
 *
 * Options:
 *   --force    Overwrite existing characters (default: skip existing)
 *
 * Requirements:
 *   - KV_REST_API_URL and KV_REST_API_TOKEN environment variables
 *   - Or run with: vercel env pull .env.local
 */

import { kv } from '@vercel/kv';
import { readFileSync } from 'fs';

async function restoreDatabase() {
  const args = process.argv.slice(2);
  const backupFile = args.find((arg) => !arg.startsWith('--'));
  const forceOverwrite = args.includes('--force');

  if (!backupFile) {
    console.error('❌ Error: No backup file specified');
    console.error(
      'Usage: node tools/restore-database.js <backup-file> [--force]'
    );
    process.exit(1);
  }

  console.log(`📂 Reading backup file: ${backupFile}`);

  try {
    // Read and parse backup file
    const backupData = JSON.parse(readFileSync(backupFile, 'utf8'));

    if (!backupData.characters || !Array.isArray(backupData.characters)) {
      throw new Error('Invalid backup file format: missing characters array');
    }

    console.log(
      `📊 Backup contains ${backupData.characters.length} characters`
    );
    console.log(`📅 Backup date: ${backupData.exportDate}`);

    if (!forceOverwrite) {
      console.log(
        'ℹ️  Mode: Skip existing characters (use --force to overwrite)'
      );
    } else {
      console.log('⚠️  Mode: Overwrite existing characters');
    }

    console.log('\n🔄 Restoring characters...');

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const character of backupData.characters) {
      if (!character.id) {
        console.error('⚠️  Skipping character without ID');
        errors++;
        continue;
      }

      const key = `character:${character.id}`;

      try {
        // Check if character already exists
        if (!forceOverwrite) {
          const existing = await kv.get(key);
          if (existing) {
            console.log(
              `  ⏭️  Skipped: ${character.petName || character.id} (already exists)`
            );
            skipped++;
            continue;
          }
        }

        // Import character
        await kv.set(key, character);
        console.log(`  ✅ Imported: ${character.petName || character.id}`);
        imported++;
      } catch (error) {
        console.error(
          `  ❌ Failed: ${character.petName || character.id}`,
          error.message
        );
        errors++;
      }
    }

    console.log('\n✅ Restore complete!');
    console.log(`📊 Stats:`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped:  ${skipped}`);
    console.log(`   Errors:   ${errors}`);
  } catch (error) {
    console.error('❌ Error restoring database:', error);
    console.error('\nTroubleshooting:');
    console.error('  1. Check that the backup file exists and is valid JSON');
    console.error(
      '  2. Make sure KV_REST_API_URL and KV_REST_API_TOKEN are set'
    );
    console.error('  3. Run: vercel env pull .env.local');
    process.exit(1);
  }
}

restoreDatabase();
