/**
 * At most `limit` uses per key in any `windowMs`. In memory: the server is one process; a restart
 * forgets the counts, which is fine for keeping one learner from running up a bill.
 */
export type RateLimit = { take: (key: string, now: number) => boolean };

export function rateLimit(limit: number, windowMs: number): RateLimit {
  const uses = new Map<string, number[]>();
  return {
    take(key, now) {
      const recent = (uses.get(key) ?? []).filter((at) => at > now - windowMs);
      const isAllowed = recent.length < limit;
      if (isAllowed) recent.push(now);
      uses.set(key, recent);
      return isAllowed;
    },
  };
}
