// fetching client 
import { createClient } from '@supabase/supabase-js'
import type { Database } from "./types"

class SupabaseClient {
    private static instance: SupabaseClient | null = null;
    private client: ReturnType<typeof createClient<Database>>;

    private constructor() {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error("Missing Supabase environment variables");
            throw new Error("Supabase configuration is incomplete");
        }

        this.client = createClient<Database>(supabaseUrl, supabaseAnonKey);
    }

    public static getInstance(): SupabaseClient {
        if (!SupabaseClient.instance) {
            SupabaseClient.instance = new SupabaseClient();
        }
        return SupabaseClient.instance;
    }

    public getClient() {
        return this.client;
    }
}

export const getSupabaseInstance = () => SupabaseClient.getInstance();
export const getSupabaseClient = () => SupabaseClient.getInstance().getClient();
export const supabase = getSupabaseClient();





