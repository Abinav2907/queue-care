import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
const dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(dirname, "../../../..");
const apiRoot = path.resolve(dirname, "../..");
for (const envFile of [
    path.join(workspaceRoot, ".env"),
    path.join(workspaceRoot, ".env.local"),
    path.join(apiRoot, ".env"),
    path.join(apiRoot, ".env.local")
]) {
    dotenv.config({ path: envFile, override: false });
}
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 4000),
    clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    allowedOrigins: (process.env.CLIENT_ORIGINS ?? process.env.CLIENT_ORIGIN ?? "http://localhost:3000,http://localhost:3001")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    supabaseUrl,
    supabaseKey
};
export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseKey);
//# sourceMappingURL=env.js.map