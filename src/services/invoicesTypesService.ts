import { supabase } from '@/config/supabase';
import type { InvoicesType, InvoicesTypeInsert, InvoicesTypeUpdate } from '@/types/invoicesTypes';

const TABLE_NAME = 'invoices_types';

/**
 * Obtiene todos los tipos de facturas
 */
export const getAllInvoicesTypes = async (): Promise<InvoicesType[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('invoices', { ascending: true });

  if (error) {
    console.error('Error fetching invoices types:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Obtiene un tipo de factura por ID
 */
export const getInvoicesTypeById = async (id: string): Promise<InvoicesType | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching invoices type by id:', error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Crea un nuevo tipo de factura
 */
export const createInvoicesType = async (invoicesType: InvoicesTypeInsert): Promise<InvoicesType> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(invoicesType as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating invoices type:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No data returned when creating invoices type');
  }

  return data;
};

/**
 * Actualiza un tipo de factura existente
 */
export const updateInvoicesType = async (
  id: string,
  updates: InvoicesTypeUpdate
): Promise<InvoicesType> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating invoices type:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No data returned when updating invoices type');
  }

  return data;
};

/**
 * Elimina un tipo de factura
 */
export const deleteInvoicesType = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    console.error('Error deleting invoices type:', error);
    throw new Error(error.message);
  }
};
