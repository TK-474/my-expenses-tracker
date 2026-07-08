import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supports both the modern publishable key (sb_publishable_...) and the
// legacy JWT anon key — supabase-js accepts either in the same slot.
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** False until the env vars from .env.local are present */
export const isSupabaseConfigured = Boolean(url && publishableKey);

let client: SupabaseClient | null = null;

/**
 * Lazily created so the app can build and show setup instructions
 * even before the environment variables exist.
 */
export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Copy .env.local.example to .env.local and fill in your project URL and publishable key.'
      );
    }
    client = createClient(url!, publishableKey!);
  }
  return client;
}
