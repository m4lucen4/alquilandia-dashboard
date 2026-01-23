import { supabase } from '@/config/supabase';
import type { TaxesType, TaxesTypeInsert, TaxesTypeUpdate } from '@/types/taxesTypes';

const TABLE_NAME = 'taxes_types';

/**
 * Obtiene todos los tipos de impuestos
 */
export const getAllTaxesTypes = async (): Promise<TaxesType[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching taxes types:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Obtiene un tipo de impuesto por ID
 */
export const getTaxesTypeById = async (id: string): Promise<TaxesType | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching taxes type by id:', error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Crea un nuevo tipo de impuesto
 */
export const createTaxesType = async (taxesType: TaxesTypeInsert): Promise<TaxesType> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(taxesType as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating taxes type:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No data returned when creating taxes type');
  }

  return data;
};

/**
 * Actualiza un tipo de impuesto existente
 */
export const updateTaxesType = async (
  id: string,
  updates: TaxesTypeUpdate
): Promise<TaxesType> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating taxes type:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No data returned when updating taxes type');
  }

  return data;
};

/**
 * Elimina un tipo de impuesto
 */
export const deleteTaxesType = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    console.error('Error deleting taxes type:', error);
    throw new Error(error.message);
  }
};
