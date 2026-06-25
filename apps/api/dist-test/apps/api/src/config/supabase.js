import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseConfig } from "./env";
export const supabase = hasSupabaseConfig
    ? createClient(env.supabaseUrl, env.supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    })
    : null;
//# sourceMappingURL=supabase.js.map