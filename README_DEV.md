# Developer Guide

This guide covers development-specific features, debugging tools, and internal routes that aren't documented in the main README.

## Hidden Features & Debug Tools

### Admin Panel

**Route:** `/admin`

**URL:** https://cat-stats-six.vercel.app/admin

**Purpose:** Unified admin interface for site management, analytics, and character curation.

**Authentication:** Requires `ADMIN_TOKEN` (same token used for analytics).

**Features:**

1. **Analytics Tab** (`/admin/analytics`)
   - View API costs over 7/30/90 day periods
   - Daily breakdown of token usage and costs
   - Usage metrics (characters created, PDF downloads, shares, etc.)

2. **Characters Tab** (`/admin/characters`)
   - Look up any character by ID
   - Upload or replace character photos
   - Add/remove characters from Hall of Fame

**How to access:**

1. Navigate to `https://cat-stats-six.vercel.app/admin`
2. Enter your admin token
3. Use tabs to switch between Analytics and Characters

**Photo upload in admin:**

- Automatically resizes to max 800x800 (maintains aspect ratio)
- Compresses to JPEG at 85% quality
- Uploads to Vercel Blob storage
- Updates the character record in Vercel KV

**Backwards compatibility:** `/analytics` redirects to `/admin/analytics`.

### Frontend Design Debug Panel

Press the **backtick key (`)** to toggle the design debug panel. This panel shows:

- **Current viewport dimensions** (width × height)
- **Breakpoint information** (mobile, tablet, desktop)
- **Component hierarchy** (helpful for understanding the app structure)
- **Real-time state inspection** (current step, phase, etc.)

**Use cases:**

- Testing responsive design across different screen sizes
- Debugging layout issues
- Understanding component state during development
- Quickly checking which breakpoint is active

**Location:** The debug panel component is defined in the main app file and toggles visibility based on a local state variable triggered by the backtick key.

### Analytics (moved to Admin Panel)

Analytics is now part of the Admin Panel at `/admin/analytics`. See "Admin Panel" above.

**Backend details:**

- API endpoint: `/api/analytics`
- Storage: Vercel KV (Redis) database named `legendary-pets`
- Data structure: Individual logs (`analytics:log:{timestamp}`) and daily aggregates (`analytics:daily:{YYYY-MM-DD}`)

**Cost calculation:**

- Claude Sonnet 4.5: $3.00/M input tokens, $15.00/M output tokens
- Claude Haiku 4.5: $1.00/M input tokens, $5.00/M output tokens
- Automatically logs every character generation request

## Development Workflow

### Running Locally

**For frontend-only development:**

```bash
npm run dev
```

This starts Vite on port 3001 (configured in `vite.config.ts`).

**For full-stack development (with API functions):**

```bash
vercel dev
```

This starts Vercel's development server on port 3000 and allows testing serverless functions locally.

**Important:** Don't run both simultaneously - they use different ports and will cause confusion.

### Environment Variables

**Required for local development:**

- `ANTHROPIC_API_KEY` - Your Claude API key (get from Anthropic console)
- `ADMIN_TOKEN` - Admin password for analytics dashboard

**How to set up:**

1. Create `.env.local` file in project root
2. Add: `ANTHROPIC_API_KEY=your_key_here`
3. Add: `ADMIN_TOKEN=your_secret_token_here`
4. Run `vercel dev` (automatically loads `.env.local`)

**Production:** Set these in Vercel dashboard under Settings → Environment Variables.

### Git Workflow

This project uses automated CI commits (heartbeat commits to keep repo active). Always rebase before pushing:

```bash
git pull --rebase origin main
git push
```

**Pre-commit hooks automatically run:**

- `npm run format` (Prettier)
- `npm run lint` (ESLint)
- `npm test` (if tests exist)

If you hit rebase conflicts:

```bash
git add <fixed-files>
git rebase --continue
```

## API Endpoints

### `/api/character` (POST)

Generates an RPG character sheet based on pet personality data.

**Request body:**

```json
{
  "petName": "Fluffy",
  "personality": {
    /* personality data */
  },
  "stats": {
    /* calculated stats */
  }
}
```

**Response:**

```json
{
  "character": "# Character sheet markdown...",
  "usage": {
    "input_tokens": 670,
    "output_tokens": 663
  }
}
```

**Automatic analytics logging:** After successful generation, logs token usage and cost to `/api/analytics`.

### `/api/analytics` (GET)

Retrieves analytics data (admin-only).

**Headers:**

```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Query params:**

- `days` (optional, default 30) - Number of days to fetch

**Response:**

```json
{
  "analytics": [
    {
      "date": "2026-01-10",
      "totalCalls": 1,
      "totalCost": 0.012,
      "totalInputTokens": 670,
      "totalOutputTokens": 663
    }
  ],
  "totals": {
    "totalCalls": 1,
    "totalCost": 0.012,
    "totalInputTokens": 670,
    "totalOutputTokens": 663
  },
  "daysRequested": 30
}
```

### `/api/analytics` (POST)

Logs an API call (internal use only, no authentication required).

**Request body:**

```json
{
  "model": "claude-sonnet-4-20250514",
  "inputTokens": 670,
  "outputTokens": 663,
  "totalCost": 0.012,
  "endpoint": "character"
}
```

### `/api/hall-of-fame` (GET)

Returns the list of featured character IDs for the Hall of Fame (public, no auth required).

**Response:**

```json
{
  "characterIds": ["us0suh", "g2rq99", "..."],
  "updatedAt": "2026-01-14T00:00:00.000Z"
}
```

### `/api/hall-of-fame` (POST)

Add or remove a character from the Hall of Fame (admin-only).

**Headers:**

```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request body:**

```json
{
  "action": "add",
  "characterId": "abc123"
}
```

Actions: `add` or `remove`

**Response:**

```json
{
  "success": true,
  "characterIds": ["...updated list..."]
}
```

### `/api/update-character` (POST)

Updates a character's photo (admin-only).

**Headers:**

```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request body:**

```json
{
  "id": "abc123",
  "petPhoto": "data:image/jpeg;base64,..."
}
```

## Data Storage

### Vercel KV (Redis)

**Database name:** `legendary-pets`

**Key patterns:**

- `analytics:log:{timestamp}` - Individual API call logs
- `analytics:daily:{YYYY-MM-DD}` - Daily aggregates (sum of all calls for that day)
- `config:hall-of-fame` - Hall of Fame featured character IDs
- `character:{id}` - Individual character data

**TTL:** None currently set (data persists indefinitely)

**Access:** Via Vercel dashboard → Storage → legendary-pets

## Architecture Notes

### Serverless Function Gotchas

**Fire-and-forget doesn't work:**

```javascript
// ❌ BAD - function terminates before this completes
fetch('/api/analytics', { method: 'POST', body: data });
return res.json({ success: true });

// ✅ GOOD - await ensures it completes
await fetch('/api/analytics', { method: 'POST', body: data });
return res.json({ success: true });
```

**Relative URLs don't work with fetch():**

```javascript
// ❌ BAD - fails with "Failed to parse URL"
await fetch('/api/analytics', { ... });

// ✅ GOOD - construct full URL from request headers
const protocol = req.headers['x-forwarded-proto'] || 'https';
const host = req.headers['x-forwarded-host'] || req.headers.host;
const url = `${protocol}://${host}/api/analytics`;
await fetch(url, { ... });
```

### React Component Structure

```
PetPersonalityAnalyzer (main app)
├── Questionnaire (pet personality questions)
├── CharacterSheet (display generated character)
├── Showdown (battle animations)
├── HallOfFame (saved characters gallery)
└── AnalyticsPage (admin dashboard)
```

### URL-based routing

The app uses a simple URL-based routing system (not React Router):

- `/` - Questionnaire
- `/legend/:id` - Shared character view
- `/showdown/:id` - Battle between two characters
- `/hall-of-fame` - Gallery of featured characters
- `/admin` - Admin panel (analytics, character management)
- `/admin/analytics` - Analytics tab
- `/admin/characters` - Character management tab
- `/analytics` - Redirects to `/admin/analytics` (backwards compatibility)

Routes are parsed in `characterWorkflowService.ts` and mapped to component states.

## Testing

**Current status:** No automated tests configured yet.

**Philosophy (from CLAUDE.md):**

- Focus on core logic (personality calculations, stat generation)
- Don't test UI interactions
- Avoid heavy mocking
- Write behavioral tests, not brittle tests

**To add tests:**

1. Install test framework: `npm install -D vitest @testing-library/react`
2. Create `src/test/` directory
3. Write tests for core algorithms in `src/test/core/`

## Troubleshooting

### "Invalid admin token" on analytics page

- Check that `ADMIN_TOKEN` environment variable is set in Vercel
- Token must match exactly (case-sensitive, no trailing spaces)
- Use `Authorization: Bearer YOUR_TOKEN` format

### Analytics not showing data after character generation

- Check Vercel function logs for `[ANALYTICS]` and `[CHARACTER]` prefixes
- Verify KV database exists and is linked to your project
- Look for "✓ Analytics logged successfully" in character generation logs

### Port conflicts during local development

- Stop `npm run dev` if running `vercel dev` (they use different ports)
- Vite runs on port 3001, Vercel dev runs on port 3000

### Build errors about missing environment variables

- Environment variables are only needed at runtime, not build time
- Vercel automatically injects them during deployment
- For local builds, create `.env.local` with required variables

## Useful Commands

```bash
# Development
npm run dev              # Vite dev server (frontend only)
vercel dev              # Full-stack dev with serverless functions

# Building
npm run build           # TypeScript compile + Vite build

# Code quality
npm run lint            # ESLint check
npm run format          # Prettier format all files

# Deployment
git push                # Vercel auto-deploys on push to main
vercel deploy           # Manual deployment
vercel deploy --prod    # Deploy to production

# Analytics (using Vercel CLI)
vercel env ls           # List environment variables
vercel logs             # View function logs
```

## Feature Flags

Located in `src/config/featureFlags.ts`:

```typescript
export const FEATURE_FLAGS = {
  CLAUDE_MODEL: 'claude-sonnet-4-20250514', // Can switch to haiku for cost savings
  ENABLE_SHOWDOWN: true,
  ENABLE_HALL_OF_FAME: true,
  // ... other flags
};
```

**To switch to cheaper model:**
Change `CLAUDE_MODEL` to `'claude-3-5-haiku-20241022'` for ~80% cost reduction (but lower quality).

## Resources

- **Main README:** `README.md` (user-facing documentation)
- **Project guidelines:** `CLAUDE.md` (AI assistant guidelines, development principles)
- **Analytics docs:** `ANALYTICS.md` (detailed analytics system documentation)
- **Vercel dashboard:** [https://vercel.com/aadjones/cat-stats](https://vercel.com/aadjones/cat-stats)
- **Anthropic pricing:** [https://www.anthropic.com/pricing](https://www.anthropic.com/pricing)
