import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let client: Sql | null = null;
let prepared = false;

export function getSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!client) {
    client = neon(url);
  }
  return client;
}

export async function ensureDb(): Promise<Sql> {
  const sql = getSql();
  if (prepared) return sql;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id text PRIMARY KEY,
      freelancer_name text NOT NULL,
      client_name text NOT NULL,
      client_email text NOT NULL,
      description text NOT NULL,
      amount_cents integer NOT NULL,
      currency text NOT NULL DEFAULT 'USD',
      issued_at timestamptz NOT NULL DEFAULT now(),
      due_at timestamptz NOT NULL,
      tone text NOT NULL,
      status text NOT NULL DEFAULT 'sent',
      paid_at timestamptz
    )
  `;

  prepared = true;
  return sql;
}
