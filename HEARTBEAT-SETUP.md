# Database Heartbeat Setup Guide

Quick guide to prevent Upstash from deleting your database due to inactivity.

## ⚡ Fastest Setup (GitHub Actions - Recommended)

### Step 1: Get Your Credentials

```bash
# Pull your Vercel KV credentials
vercel env pull .env.local

# View the credentials
cat .env.local
```

You'll see two values:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/cat-stats
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add both secrets:
   - Name: `KV_REST_API_URL`, Value: (paste from .env.local)
   - Name: `KV_REST_API_TOKEN`, Value: (paste from .env.local)

### Step 3: Push the Workflow

```bash
# Commit the workflow file
git add .github/workflows/database-heartbeat.yml
git commit -m "Add database heartbeat workflow"
git push
```

### Step 4: Verify It Works

1. Go to **Actions** tab in GitHub
2. Select **Database Heartbeat** workflow
3. Click **Run workflow** → **Run workflow** (green button)
4. Wait a few seconds and refresh - you should see it succeed! ✅

**That's it!** The workflow will now run automatically every 6 hours.

---

## 📊 Check Heartbeat Status

Run locally to see when the last heartbeat occurred:

```bash
node tools/heartbeat.js
```

Output:

```
🫀 Database heartbeat - 2025-10-12T17:40:26.071Z
  Last heartbeat: 4 hours ago
  Total heartbeats: 42
✅ Database is active
```

---

## 🔧 Alternative: Vercel Cron (Simpler but requires Hobby plan)

If you have Vercel Hobby plan or higher, you can use Vercel's built-in cron:

1. Create `api/cron-heartbeat.js`:

```javascript
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const timestamp = new Date().toISOString();
  const data = await kv.get('system:heartbeat');
  await kv.set('system:heartbeat', {
    timestamp,
    count: (data?.count || 0) + 1,
  });
  return res.json({ success: true, timestamp });
}
```

2. Update `vercel.json`:

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

3. Deploy:

```bash
git add api/cron-heartbeat.js vercel.json
git commit -m "Add Vercel cron heartbeat"
git push
```

Note: Vercel cron jobs require a paid plan.

---

## ❓ FAQ

**Q: How often should the heartbeat run?**
A: Every 6 hours is safe. Upstash considers databases "inactive" after several days of no traffic.

**Q: Does this cost money?**
A: No! GitHub Actions is free for public repos and includes 2000 minutes/month for private repos. The heartbeat takes ~5 seconds to run.

**Q: Will this fill up my database?**
A: No, it only uses a single key (`system:heartbeat`) that gets updated each time.

**Q: Can I test it manually?**
A: Yes! Run `node tools/heartbeat.js` anytime.

**Q: What if I want to run it more/less frequently?**
A: Edit `.github/workflows/database-heartbeat.yml` and change the cron schedule:

- Every 12 hours: `0 */12 * * *`
- Once daily: `0 3 * * *`
- Every 3 hours: `0 */3 * * *`
