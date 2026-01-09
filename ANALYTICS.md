# Analytics System

This analytics system tracks API usage and costs for the CatStats application.

## Features

- **Automatic Cost Tracking**: Every API call to Claude is automatically logged with token usage and calculated cost
- **Admin-Only Dashboard**: Analytics data is protected by admin token authentication
- **Daily Aggregates**: Data is aggregated by day for easy cost analysis
- **Multi-Endpoint Tracking**: Tracks different API endpoints separately (character generation, etc.)

## Setup

### 1. Environment Variables

Add to your `.env.local` or Vercel environment variables:

```bash
ADMIN_TOKEN=your-secure-random-token-here
```

Generate a secure token:

```bash
openssl rand -hex 32
```

### 2. Vercel KV Setup

The analytics system uses `@vercel/kv` for data storage. Make sure you have:

1. A Vercel KV database created in your Vercel project
2. The `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables set (automatically configured by Vercel)

## Accessing Analytics

Navigate to `/analytics` in your browser or click the analytics link (when implemented in UI).

You'll be prompted for the admin token. Enter the `ADMIN_TOKEN` you configured.

## Analytics Data

### What's Tracked

For each API call:

- **Model**: Which Claude model was used (e.g., `claude-sonnet-4-20250514`)
- **Input Tokens**: Number of tokens in the request
- **Output Tokens**: Number of tokens in the response
- **Total Cost**: Calculated cost in USD based on current pricing
- **Endpoint**: Which API endpoint was called (`character`, `friendship-report`, etc.)
- **Timestamp**: When the call was made

### Pricing (as of January 2025)

**Claude Sonnet 4.5:**

- Input: $3.00 per million tokens
- Output: $15.00 per million tokens

**Claude Haiku:**

- Input: $0.25 per million tokens
- Output: $1.25 per million tokens

### Dashboard Features

- **Total Cost**: Sum of all API costs for the selected time period
- **Daily Average**: Average cost per day
- **Total API Calls**: Number of API requests made
- **Most Expensive Day**: Highest single-day cost
- **Token Usage**: Breakdown of input vs output tokens
- **Daily Breakdown Table**: Detailed day-by-day cost analysis

## API Endpoints

### POST /api/analytics

Log an API call (internal use only, called automatically by API endpoints).

**Request:**

```json
{
  "model": "claude-sonnet-4-20250514",
  "inputTokens": 1234,
  "outputTokens": 567,
  "totalCost": 0.0123,
  "endpoint": "character"
}
```

### GET /api/analytics?days=30

Retrieve analytics data (requires admin token).

**Headers:**

```
Authorization: Bearer your-admin-token
```

**Query Parameters:**

- `days` (optional): Number of days to fetch (default: 30, max: 90)

**Response:**

```json
{
  "analytics": [
    {
      "date": "2025-01-08",
      "totalCalls": 42,
      "totalCost": 1.25,
      "totalInputTokens": 50000,
      "totalOutputTokens": 25000,
      "endpoints": {
        "character": {
          "calls": 40,
          "cost": 1.2,
          "inputTokens": 48000,
          "outputTokens": 24000
        },
        "friendship-report": {
          "calls": 2,
          "cost": 0.05,
          "inputTokens": 2000,
          "outputTokens": 1000
        }
      }
    }
  ],
  "totals": {
    "totalCalls": 42,
    "totalCost": 1.25,
    "totalInputTokens": 50000,
    "totalOutputTokens": 25000
  },
  "daysRequested": 30
}
```

## Data Storage

Analytics data is stored in Vercel KV with two key patterns:

1. **Individual Logs**: `analytics:log:{timestamp}`
   - Stores each API call with full details
   - Used for detailed auditing if needed

2. **Daily Aggregates**: `analytics:daily:{YYYY-MM-DD}`
   - Aggregated data for each day
   - Used by the dashboard for fast queries
   - Automatically updated on each API call

## Security

- **Admin Token Required**: All GET requests require valid admin token
- **POST Endpoint**: Only accessible server-side (called by API endpoints)
- **Rate Limiting**: Consider adding rate limits to prevent abuse
- **Token Rotation**: Change your admin token periodically

## Cost Monitoring

Monitor your costs to avoid surprises:

1. **Set Budget Alerts**: Use Vercel's cost alerts
2. **Review Daily**: Check the analytics dashboard daily during active development
3. **Watch for Spikes**: Look for unusual cost increases
4. **Emergency Kill Switch**: The character API has an `EMERGENCY_DISABLE` env var you can set to `true` to stop all generations

## Troubleshooting

### "Unauthorized" Error

- Check that `ADMIN_TOKEN` is set in your environment
- Verify you're using the correct token
- Clear browser cache/cookies

### Missing Data

- Verify `@vercel/kv` is properly configured
- Check Vercel logs for errors in `/api/analytics`
- Ensure KV environment variables are set

### Cost Calculations Seem Wrong

- Pricing is based on January 2025 rates
- Check the pricing constants in `/api/character.js`
- Verify token counts in the API responses
