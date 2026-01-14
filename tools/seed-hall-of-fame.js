/**
 * One-time migration script to populate Hall of Fame in Vercel KV
 *
 * Run with: node tools/seed-hall-of-fame.js
 *
 * Requires:
 * - KV_REST_API_URL and KV_REST_API_TOKEN environment variables
 * - Or run via: vercel env pull .env.local && node --env-file=.env.local tools/seed-hall-of-fame.js
 */

const FEATURED_CHARACTER_IDS = [
  'us0suh',
  'g2rq99',
  'oo035s',
  'ps8raj',
  'q9jqk6',
  'eg8smy',
  'umwqpi',
  'nze8vt',
  '6appoh',
  '9oug8t',
  'sq56qj',
  '7pyi5t',
  'kspziz',
  'svetnf',
  '92rkx5',
  'urs10a',
  'pva4fp',
  'jwio68',
  'd9p9rt',
  '597m90',
  '9fb3p8',
  'qaqbm2',
  '5eo7b9',
];

async function seedHallOfFame() {
  const { kv } = await import('@vercel/kv');

  const data = {
    characterIds: FEATURED_CHARACTER_IDS,
    updatedAt: new Date().toISOString(),
  };

  console.log(
    'Seeding Hall of Fame with',
    FEATURED_CHARACTER_IDS.length,
    'characters...'
  );

  await kv.set('config:hall-of-fame', data);

  console.log('✅ Hall of Fame seeded successfully!');
  console.log('Data:', JSON.stringify(data, null, 2));
}

seedHallOfFame().catch(console.error);
