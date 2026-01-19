# Database Tools

Scripts for backing up, restoring, and maintaining the pet character database.

## Table of Contents

- [Database Heartbeat](#database-heartbeat)
- [Backup & Restore](#backup--restore)
- [Manual Character Deletion](#manual-character-deletion)
- [Prerequisites](#prerequisites)

---

## Database Heartbeat

Keep your Upstash database active to prevent it from being deleted due to inactivity.

### Quick Start

```bash
# Run manually
node tools/heartbeat.js
```

### Automated Setup (Recommended)

**Option 1: GitHub Actions (Easiest)**

The repository includes a GitHub Actions workflow that runs automatically every 6 hours:

1. Go to your GitHub repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Add two repository secrets:
   - `KV_REST_API_URL` - Your Vercel KV URL
   - `KV_REST_API_TOKEN` - Your Vercel KV token
4. The workflow will run automatically!

You can also trigger it manually:

- Go to **Actions** tab
- Select **Database Heartbeat** workflow
- Click **Run workflow**

**Option 2: Local Cron Job**

If you have a server or computer that runs 24/7:

```bash
# Edit your crontab
crontab -e

# Add this line (runs every 6 hours)
# Replace /path/to/cat-stats with your actual path
0 */6 * * * cd /path/to/cat-stats && node tools/heartbeat.js >> /tmp/db-heartbeat.log 2>&1
```

**Option 3: Vercel Cron Jobs**

Create an API endpoint that runs the heartbeat via Vercel Cron:

```javascript
// api/cron-heartbeat.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const timestamp = new Date().toISOString();
  await kv.set('system:heartbeat', { timestamp, count: Date.now() });
  res.json({ success: true, timestamp });
}
```

Then configure in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron-heartbeat",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### How It Works

The heartbeat script:

- Reads and updates a `system:heartbeat` key in your database
- Tracks the last heartbeat time and total count
- Requires minimal database resources
- Keeps your database active without cluttering it with test data

---

## Backup & Restore

### Prerequisites

These scripts require Vercel KV credentials to be set as environment variables:

```bash
# Option 1: Pull credentials from Vercel (recommended)
vercel env pull .env.local

# Option 2: Set manually
export KV_REST_API_URL="your-url"
export KV_REST_API_TOKEN="your-token"
```

## Backup Database

Export all pet characters to a JSON file:

```bash
# Default: creates backups/database-backup-YYYY-MM-DD.json
node tools/backup-database.js

# Custom output path
node tools/backup-database.js my-backup.json
node tools/backup-database.js backups/pets-$(date +%Y%m%d-%H%M%S).json
```

### Backup File Format

```json
{
  "exportDate": "2025-10-12T10:30:00.000Z",
  "totalCharacters": 15,
  "characters": [
    {
      "id": "us0suh",
      "petName": "Whiskers",
      "archetype": "The Shadow",
      "characterData": { ... },
      "created": "2025-09-01T12:00:00.000Z"
    }
  ]
}
```

## Restore Database

Import characters from a backup file:

```bash
# Skip existing characters (safe mode)
node tools/restore-database.js backups/database-backup-2025-10-12.json

# Overwrite existing characters (use with caution!)
node tools/restore-database.js backups/database-backup-2025-10-12.json --force
```

## Recommended Workflow

### Regular Backups

```bash
# Create timestamped backup
node tools/backup-database.js backups/auto-backup-$(date +%Y%m%d).json
```

### Before Major Changes

```bash
# 1. Backup current state
node tools/backup-database.js backups/pre-migration-backup.json

# 2. Make changes...

# 3. If something goes wrong, restore
node tools/restore-database.js backups/pre-migration-backup.json --force
```

### Migrating Between Environments

```bash
# 1. Export from production
vercel env pull .env.production
node tools/backup-database.js backups/production-export.json

# 2. Import to development
vercel env pull .env.development
node tools/restore-database.js backups/production-export.json
```

## Manual Character Deletion

For rare cases where you need to delete a character (test data, inappropriate content), use the Vercel KV CLI directly. There's no admin UI for deletion to prevent accidents.

### Steps

```bash
# 1. Pull credentials if needed
vercel env pull .env.local

# 2. Delete the character record
npx vercel kv del character:{id}
# Example: npx vercel kv del character:abc123

# 3. Invalidate search cache (forces rebuild on next search)
npx vercel kv del characters:index

# 4. (Optional) Remove from Hall of Fame if featured
# Check first: npx vercel kv get config:hall-of-fame
# If the character ID is in the list, update via admin panel or manually
```

### What About Other Data?

| Data                | Cleanup needed? | Notes                                              |
| ------------------- | --------------- | -------------------------------------------------- |
| `character:{id}`    | **Yes**         | The main record                                    |
| `characters:index`  | **Yes**         | Search cache - delete to force rebuild             |
| Hall of Fame        | Maybe           | App gracefully ignores 404s, but cleaner to remove |
| Blob photo          | Optional        | Orphaned photos are cheap storage, harmless        |
| Showdown reports    | No              | Self-contained, store full data not IDs            |
| Analytics           | No              | Tracks events, not current count                   |
| `/legend/{id}` page | No              | Already shows friendly 404 message                 |

---

## Safety Notes

- **Backup regularly**: Database operations can fail or have bugs
- **Version control**: Keep backups in `backups/` directory (add to `.gitignore` if sensitive)
- **Test restores**: Periodically verify backups can be restored successfully
- **Use `--force` carefully**: Only overwrite when you're certain

## Troubleshooting

### Error: "kv is not defined" or "Cannot find module"

The scripts use ES modules and need to run from the project root:

```bash
cd /path/to/cat-stats
node tools/backup-database.js
```

### Error: "KV_REST_API_URL is not set"

Pull credentials from Vercel:

```bash
vercel env pull .env.local
# Then source them or run with dotenv
```

### Empty backup (0 characters)

Verify you're connected to the correct KV database:

```bash
vercel env ls
```
