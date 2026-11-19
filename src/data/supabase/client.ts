import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase.
 * Configurar en .env:
 *   REACT_APP_SUPABASE_URL=https://xxx.supabase.co
 *   REACT_APP_SUPABASE_ANON_KEY=eyJ...
 *
 * Sin configuración, la app muestra el catálogo estático y deshabilita el checkout.
 */

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
