// fetching client 
import { createClient } from '@supabase/supabase-js'
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import type { Database } from "./types"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing supabase environment");
}

export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
)

export const getSupabaseClient = () => supabase






