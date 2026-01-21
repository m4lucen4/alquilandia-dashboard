import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

/**
 * Cliente de Supabase configurado para el proyecto
 * Uso:
 * - Para queries de base de datos: supabase.from('tabla').select()
 * - Para storage: supabase.storage.from('bucket')
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Deshabilitado porque usas tu propio sistema de auth
    autoRefreshToken: false,
  },
});
