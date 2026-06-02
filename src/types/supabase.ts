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
          additional_data?: string;
          is_default: boolean;
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
          additional_data?: string | null;
          is_default?: boolean;
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
          additional_data?: string | null;
          is_default?: boolean;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      invoices_types: {
        Row: {
          id: string;
          invoices: string;
          percentage: number;
          concept?: string;
          show_budgetlines?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoices: string;
          percentage: number;
          concept?: string | null;
          show_budgetlines?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoices?: string;
          percentage?: number;
          concept?: string | null;
          show_budgetlines?: boolean | null;
          updated_at?: string;
        };
        Relationships: [];
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
          additional_data?: string;
          pdf_url?: string;
          event_date?: string;
          client_name?: string;
          client_nif?: string;
          client_email?: string;
          client_address?: string;
          client_locality?: string;
          client_postal_code?: string;
          client_phone?: string;
          coupon_discount?: number;
          is_corrective?: boolean;
          original_invoice_id?: string;
          corrective_reason?: string;
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
          additional_data?: string | null;
          pdf_url?: string | null;
          event_date?: string | null;
          client_name?: string | null;
          client_nif?: string | null;
          client_email?: string | null;
          client_address?: string | null;
          client_locality?: string | null;
          client_postal_code?: string | null;
          client_phone?: string | null;
          coupon_discount?: number | null;
          is_corrective?: boolean | null;
          original_invoice_id?: string | null;
          corrective_reason?: string | null;
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
          additional_data?: string | null;
          pdf_url?: string | null;
          event_date?: string | null;
          client_name?: string | null;
          client_nif?: string | null;
          client_email?: string | null;
          client_address?: string | null;
          client_locality?: string | null;
          client_postal_code?: string | null;
          client_phone?: string | null;
          coupon_discount?: number | null;
          is_corrective?: boolean | null;
          original_invoice_id?: string | null;
          corrective_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_documents: {
        Row: {
          id: string;
          inventory_id: string;
          storage_path: string;
          file_name: string;
          file_size: number;
          mime_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          inventory_id: string;
          storage_path: string;
          file_name: string;
          file_size?: number;
          mime_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          inventory_id?: string;
          storage_path?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          latitude: number;
          longitude: number;
          address: string;
          use_for_mileage: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          latitude: number;
          longitude: number;
          address: string;
          use_for_mileage: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          latitude?: number;
          longitude?: number;
          address?: string;
          use_for_mileage?: boolean;
          updated_at?: string;
        };
        Relationships: [];
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
