import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const MISSING_SUPABASE_ERROR =
  "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.";

function createMissingSupabaseClient() {
  const missingError = new Error(MISSING_SUPABASE_ERROR);

  const queryStub = {
    select: () => queryStub,
    eq: () => queryStub,
    order: () => queryStub,
    limit: async () => ({ data: [], error: missingError }),
    single: async () => ({ data: null, error: missingError }),
    maybeSingle: async () => ({ data: null, error: missingError }),
    insert: async () => ({ data: null, error: missingError }),
    upsert: async () => ({ data: null, error: missingError }),
    update: async () => ({ data: null, error: missingError }),
    delete: async () => ({ data: null, error: missingError }),
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: missingError }),
      signInWithOtp: async () => ({ error: missingError }),
      signOut: async () => ({ error: missingError }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }),
    },
    from: () => queryStub,
  };
}

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createMissingSupabaseClient();

if (!isSupabaseConfigured) {
  console.warn(MISSING_SUPABASE_ERROR);
}