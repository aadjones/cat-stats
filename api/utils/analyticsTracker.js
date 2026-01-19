import { kv } from '@vercel/kv';

/**
 * Track analytics events by incrementing counters in Vercel KV
 * All tracking is server-side to prevent spoofing
 */

export async function trackEvent(eventName) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Increment total counter
    await kv.incr(`analytics:total:${eventName}`);

    // Increment daily counter
    await kv.incr(`analytics:daily:${today}:${eventName}`);

    console.log(`[ANALYTICS] Tracked event: ${eventName}`);
    return true;
  } catch (error) {
    console.error(`[ANALYTICS] Failed to track ${eventName}:`, error);
    return false;
  }
}

/**
 * Get analytics data for display
 * If counters are at 0, backfill from existing database records
 */
export async function getAnalytics() {
  try {
    const [
      charactersCreated,
      photosUploaded,
      hallOfFameViews,
      pdfDownloads,
      shareButtonClicks,
      pageVisits,
      questionnaireEngaged,
      funnelCompleted,
    ] = await Promise.all([
      kv.get('analytics:total:characters_created'),
      kv.get('analytics:total:photos_uploaded'),
      kv.get('analytics:total:hall_of_fame_views'),
      kv.get('analytics:total:pdf_downloads'),
      kv.get('analytics:total:share_button_clicks'),
      kv.get('analytics:total:page_visits'),
      kv.get('analytics:total:questionnaire_engaged'),
      kv.get('analytics:total:funnel_completed'),
    ]);

    // If characters_created is 0, backfill from database
    let actualCharactersCreated = charactersCreated || 0;
    let actualPhotosUploaded = photosUploaded || 0;

    if (actualCharactersCreated === 0) {
      // Scan KV for all character:* keys and count them
      const keys = [];
      let cursor = '0';
      do {
        const result = await kv.scan(cursor, {
          match: 'character:*',
          count: 100,
        });
        cursor = result[0];
        keys.push(...result[1]);
      } while (cursor !== '0');

      actualCharactersCreated = keys.length;

      // Count how many have photos
      const characters = await Promise.all(keys.map((key) => kv.get(key)));
      actualPhotosUploaded = characters.filter((char) => char?.petPhoto).length;

      // Update counters to backfilled values
      if (actualCharactersCreated > 0) {
        await kv.set(
          'analytics:total:characters_created',
          actualCharactersCreated
        );
      }
      if (actualPhotosUploaded > 0) {
        await kv.set('analytics:total:photos_uploaded', actualPhotosUploaded);
      }
    }

    return {
      charactersCreated: actualCharactersCreated,
      photosUploaded: actualPhotosUploaded,
      hallOfFameViews: hallOfFameViews || 0,
      pdfDownloads: pdfDownloads || 0,
      shareButtonClicks: shareButtonClicks || 0,
      pageVisits: pageVisits || 0,
      questionnaireEngaged: questionnaireEngaged || 0,
      funnelCompleted: funnelCompleted || 0,
    };
  } catch (error) {
    console.error('[ANALYTICS] Failed to fetch analytics:', error);
    throw error;
  }
}
