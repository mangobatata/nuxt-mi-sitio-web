import { getRequestIP, setHeader, createError, type H3Event } from "h3";

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
  message?: string;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

const getClientKey = (event: H3Event, scope: string) => {
  const ip =
    getRequestIP(event, { xForwardedFor: true }) ||
    event.node.req.socket.remoteAddress ||
    "unknown";

  return `${scope}:${ip}`;
};

const cleanupExpiredBuckets = (now: number) => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export const assertRateLimit = (
  event: H3Event,
  scope: string,
  { maxRequests, windowMs, message = "Too many requests" }: RateLimitOptions,
) => {
  const now = Date.now();
  const key = getClientKey(event, scope);
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = {
      count: 0,
      resetAt: now + windowMs,
    };
    buckets.set(key, bucket);
  }

  if (buckets.size > 1000) {
    cleanupExpiredBuckets(now);
  }

  const secondsUntilReset = Math.ceil((bucket.resetAt - now) / 1000);

  setHeader(event, "X-RateLimit-Limit", maxRequests.toString());
  setHeader(
    event,
    "X-RateLimit-Remaining",
    Math.max(maxRequests - bucket.count - 1, 0).toString(),
  );
  setHeader(event, "X-RateLimit-Reset", secondsUntilReset.toString());

  if (bucket.count >= maxRequests) {
    setHeader(event, "Retry-After", secondsUntilReset.toString());

    throw createError({
      statusCode: 429,
      statusMessage: message,
    });
  }

  bucket.count += 1;
};
