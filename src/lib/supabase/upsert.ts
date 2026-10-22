const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kqwrszghsuqgoqxjieqf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxd3Jzemdoc3VxZ29xeGppZXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Nzk0MDMsImV4cCI6MjA5ODU1NTQwM30.cDkzwBwS_A1BSyneqg2nKlTJYlRvzmztyNU5tmGRkYQ';

export async function upsertSupabaseBatch<T extends Record<string, unknown>>(
  table: string,
  records: T[],
  onConflict?: string,
  batchSize = 400
): Promise<number> {
  if (!records.length) return 0;
  const conflictParam = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
  const url = `${SUPABASE_URL}/rest/v1/${table}${conflictParam}`;

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  };

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase upsert to ${table} failed (${res.status}): ${err}`);
    }
  }

  return records.length;
}
