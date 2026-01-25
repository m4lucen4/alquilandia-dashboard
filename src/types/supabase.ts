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
          locality: string;
          province: string;
          phone: string;
          postal_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          nif: string;
          address: string;
          locality: string;
          province: string;
          phone: string;
          postal_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          nif?: string;
          address?: string;
          locality?: string;
          province?: string;
          phone?: string;
          postal_code?: string;
          updated_at?: string;
        };
      };
      taxes_types: {
        Row: {
          id: string;
          name: string;
          tax: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tax: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tax?: number;
          updated_at?: string;
        };
      };
      invoices_types: {
        Row: {
          id: string;
          invoices: string;
          percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoices: string;
          percentage: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoices?: string;
          percentage?: number;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          business_id: string;
          invoices_type_id: string;
          taxes_type_id: string;
          budget_reference: number;
          invoice_number: number;
          budgetlines: Json;
          price: Json;
          pdf_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          invoices_type_id: string;
          taxes_type_id: string;
          budget_reference: number;
          invoice_number?: number;
          budgetlines: Json;
          price: Json;
          pdf_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          invoices_type_id?: string;
          taxes_type_id?: string;
          budget_reference?: number;
          invoice_number?: number;
          budgetlines?: Json;
          price?: Json;
          pdf_url?: string | null;
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
