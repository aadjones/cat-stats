#!/usr/bin/env node

/**
 * Database Heartbeat Script
 *
 * Keeps the Vercel KV database active by performing lightweight operations.
 * Run this periodically (e.g., via cron) to prevent the database from being
 * marked as inactive by Upstash.
 *
 * Usage:
 *   node tools/heartbeat.js
 *
 * Cron examples:
 *   Every 6 hours: 0 star-slash-6 star star star (replace star with *)
 *   Once daily at 3 AM: 0 3 star star star (replace star with *)
 *
 * Requirements:
 *   - KV_REST_API_URL and KV_REST_API_TOKEN environment variables
 */

import { kv } from '@vercel/kv';

async function heartbeat() {
  const timestamp = new Date().toISOString();
  console.log(`🫀 Database heartbeat - ${timestamp}`);

  try {
    // Perform a lightweight operation to keep the database active
    // We'll use a dedicated heartbeat key that we update periodically
    const heartbeatKey = 'system:heartbeat';

    // Read current heartbeat data (if exists)
    const lastHeartbeat = await kv.get(heartbeatKey);

    // Update heartbeat with current timestamp
    await kv.set(heartbeatKey, {
      timestamp,
      count: (lastHeartbeat?.count || 0) + 1,
    });

    if (lastHeartbeat) {
      const lastTime = new Date(lastHeartbeat.timestamp);
      const timeSince = Math.round(
        (Date.now() - lastTime.getTime()) / 1000 / 60 / 60
      );
      console.log(`  Last heartbeat: ${timeSince} hours ago`);
      console.log(`  Total heartbeats: ${lastHeartbeat.count + 1}`);
    } else {
      console.log(`  First heartbeat initialized`);
    }

    console.log(`✅ Database is active`);
  } catch (error) {
    console.error('❌ Heartbeat failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error(
      '  1. Make sure KV_REST_API_URL and KV_REST_API_TOKEN are set'
    );
    console.error('  2. Run: vercel env pull .env.local');
    process.exit(1);
  }
}

heartbeat();
