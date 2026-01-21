/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * Tipos de base de datos de Supabase
 *
 * IMPORTANTE: Este es un esquema de ejemplo básico.
 * Puedes generar tipos automáticamente desde tu base de datos usando:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
 *
 * O usando la CLI de Supabase:
 * supabase gen types typescript --linked > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      business: {
        Row: {
          id: string;
          name: string;
          nif: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          nif: string;
          address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          nif?: string;
          address?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      // Aquí van tus vistas
    };
    Functions: {
      // Aquí van tus funciones de base de datos
    };
    Enums: {
      // Aquí van tus enums
    };
  };
}
