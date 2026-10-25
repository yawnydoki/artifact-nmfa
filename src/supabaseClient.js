import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_CLIENT_CACHE_KEY = "__artifact_supabase_client_v2__";
const clientCache = globalThis;

export const supabase =
  clientCache[SUPABASE_CLIENT_CACHE_KEY] ??
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      lockAcquireTimeout: 10000,
    },
  });

clientCache[SUPABASE_CLIENT_CACHE_KEY] = supabase;
