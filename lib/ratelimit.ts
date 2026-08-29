import { ensureDb } from "./db";

/**
 * Fixed-window rate limiting in Postgres.
 *
 * Baki has no accounts, so /new is an unauthenticated public write. Redis would
 * be the usual answer, but at this volume a single upsert against a table we
 * already have is enough — and it avoids adding a service to the stack for a
 * few writes an hour.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; hits: number }> {
  try {
    const sql = await ensureDb();
    const window = Math.floor(Date.now() / (windowSeconds * 1000));
    const bucket = `${key}:${window}`;
    const expires = new Date((window + 1) * windowSeconds * 1000).toISOString();

    const rows = (await sql`
      INSERT INTO rate_limits (bucket, hits, expires_at)
      VALUES (${bucket}, 1, ${expires})
      ON CONFLICT (bucket)
      DO UPDATE SET hits = rate_limits.hits + 1
      RETURNING hits
    `) as { hits: number }[];

    const hits = Number(rows[0]?.hits ?? 1);

    // Opportunistic sweep. Cheap, and keeps the table from growing forever.
    if (hits % 25 === 0) {
      await sql`DELETE FROM rate_limits WHERE expires_at < now()`;
    }

    return { ok: hits <= limit, hits };
  } catch {
    // A limiter that fails closed would take the product down with it.
    return { ok: true, hits: 0 };
  }
}

/** Best-effort client identity behind Vercel's proxy. */
export function clientKey(headerList: Headers, scope: string): string {
  const forwarded = headerList.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
