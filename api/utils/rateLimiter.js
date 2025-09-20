// Simple in-memory rate limiter for character generation
const requests = new Map(); // IP -> array of timestamps

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

function cleanup() {
  const now = Date.now();
  const oneHourAgo = now - 3600000;

  for (const [ip, timestamps] of requests.entries()) {
    const filtered = timestamps.filter((time) => time > oneHourAgo);
    if (filtered.length === 0) {
      requests.delete(ip);
    } else {
      requests.set(ip, filtered);
    }
  }
}

export function checkRateLimit(req, maxRequests = 5, windowMs = 600000) {
  cleanup();

  const ip = getClientIP(req);
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!requests.has(ip)) {
    requests.set(ip, []);
  }

  const timestamps = requests.get(ip);
  const recentRequests = timestamps.filter((time) => time > windowStart);

  if (recentRequests.length >= maxRequests) {
    const resetTime = Math.min(...recentRequests) + windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);

    return {
      allowed: false,
      retryAfter,
    };
  }

  recentRequests.push(now);
  requests.set(ip, recentRequests);

  return {
    allowed: true,
    remaining: maxRequests - recentRequests.length,
  };
}
