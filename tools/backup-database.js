#!/usr/bin/env node

/**
 * Database Backup Script
 *
 * Exports all pet characters from Vercel KV to a JSON file.
 *
 * Usage:
 *   node tools/backup-database.js [output-file]
 *
 * Example:
 *   node tools/backup-database.js backups/pets-2025-10-12.json
 *
 * Requirements:
 *   - KV_REST_API_URL and KV_REST_API_TOKEN environment variables
 *   - Or run with: vercel env pull .env.local (to get credentials)
 */

import { kv } from '@vercel/kv';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

async function backupDatabase() {
  console.log('🔍 Scanning database for characters...');

  try {
    // Get all keys matching the character pattern using scanIterator
    const keys = [];

    for await (const key of kv.scanIterator({ match: 'character:*' })) {
      keys.push(key);
      if (keys.length % 10 === 0) {
        console.log(`  Found ${keys.length} characters...`);
      }
    }

    console.log(`✅ Total characters found: ${keys.length}`);

    if (keys.length === 0) {
      console.log('⚠️  No characters found in database');
      return;
    }

    // Fetch all character data in batches for better performance
    console.log('📥 Fetching character data...');
    const characters = [];
    const batchSize = 100;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const batchData = await Promise.all(
        batch.map(async (key) => {
          const data = await kv.get(key);
          return {
            key,
            id: key.replace('character:', ''),
            data,
          };
        })
      );
      characters.push(...batchData);

      const percent = Math.round(((i + batch.length) / keys.length) * 100);
      console.log(
        `  Progress: ${i + batch.length}/${keys.length} (${percent}%)`
      );
    }

    // Prepare backup data
    const backup = {
      exportDate: new Date().toISOString(),
      totalCharacters: characters.length,
      characters: characters.map((c) => c.data),
    };

    // Determine output file path
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultOutput = `backups/database-backup-${timestamp}.json`;
    const outputPath = process.argv[2] || defaultOutput;

    // Ensure directory exists
    mkdirSync(dirname(outputPath), { recursive: true });

    // Write backup file
    writeFileSync(outputPath, JSON.stringify(backup, null, 2), 'utf8');

    console.log('✅ Backup complete!');
    console.log(`📁 File: ${outputPath}`);
    console.log(`📊 Characters exported: ${characters.length}`);

    // Show some stats
    const petNames = characters.map((c) => c.data.petName).filter(Boolean);
    console.log(
      `\n🐱 Sample pets: ${petNames.slice(0, 5).join(', ')}${petNames.length > 5 ? '...' : ''}`
    );
  } catch (error) {
    console.error('❌ Error backing up database:', error);
    console.error('\nTroubleshooting:');
    console.error(
      '  1. Make sure KV_REST_API_URL and KV_REST_API_TOKEN are set'
    );
    console.error('  2. Run: vercel env pull .env.local');
    console.error('  3. Source the file: source .env.local (or use dotenv)');
    process.exit(1);
  }
}

backupDatabase();
