// Small in-memory limiter: at most `max` requests per `windowMs` for each IP address.
// Enough to protect the paid AI key from being drained; resets if the server restarts.
function rateLimit({ windowMs, max, message }) {
  const hits = new Map(); // ip -> { count, resetAt }

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;

    if (hits.size > 1000) {
      for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
    }

    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: message || 'Too many requests, please try again later.' });
    }
    next();
  };
}

module.exports = { rateLimit };