import "server-only";

/**
 * In-memory login throttle (security audit finding, 2026-09-02 - the login
 * route had no rate limiting at all, and KVK Admin usernames are derivable
 * from the public KVK list with a short numeric demo password, making it a
 * real brute-force target). Tracks failed attempts by username (protects
 * one account from being hammered regardless of source IP) and separately
 * by IP (protects against one source scanning many usernames).
 *
 * This is process-local, not shared across server instances - fine for this
 * app's actual scale (a single Vercel Fluid Compute deployment, moderate
 * KVK-admin traffic), but would need a shared store (Redis, or a DB table)
 * to hold under multi-instance horizontal scaling. Worth revisiting if this
 * app ever moves off a single-region low-traffic deployment.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_USERNAME = 8;
const MAX_ATTEMPTS_PER_IP = 20;

type Bucket = { count: number; resetAt: number };
const usernameBuckets = new Map<string, Bucket>();
const ipBuckets = new Map<string, Bucket>();

function isLimited(buckets: Map<string, Bucket>, key: string, max: number, now: number): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) return false;
  return bucket.count >= max;
}

function bump(buckets: Map<string, Bucket>, key: string, now: number) {
  // Cheap unbounded-growth guard on a long-lived process - only runs once the map gets large.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function isLoginRateLimited(username: string, ip: string | null): boolean {
  const now = Date.now();
  if (isLimited(usernameBuckets, username.toLowerCase(), MAX_ATTEMPTS_PER_USERNAME, now)) return true;
  if (ip && isLimited(ipBuckets, ip, MAX_ATTEMPTS_PER_IP, now)) return true;
  return false;
}

export function recordFailedLogin(username: string, ip: string | null) {
  const now = Date.now();
  bump(usernameBuckets, username.toLowerCase(), now);
  if (ip) bump(ipBuckets, ip, now);
}

export function clearLoginAttempts(username: string, ip: string | null) {
  usernameBuckets.delete(username.toLowerCase());
  if (ip) ipBuckets.delete(ip);
}
