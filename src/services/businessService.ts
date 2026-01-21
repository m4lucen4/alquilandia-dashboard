import { supabase } from '@/config/supabase';
import type { Business, BusinessInsert, BusinessUpdate } from '@/types/business';

const TABLE_NAME = 'business';

/**
 * Obtiene todas las empresas
 */
export const getAllBusiness = async (): Promise<Business[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching business:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Obtiene una empresa por ID
 */
export const getBusinessById = async (id: string): Promise<Business | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching business by id:', error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Crea una nueva empresa
 */
export const createBusiness = async (business: BusinessInsert): Promise<Business> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(business as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating business:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No data returned when creating business');
  }

  return data;
};

/**
 * Actualiza una empresa existente
 */
export const updateBusiness = async (
  id: string,
  updates: BusinessUpdate
): Promise<Business> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating business:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No data returned when updating business');
  }

  return data;
};

/**
 * Elimina una empresa
 */
export const deleteBusiness = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    console.error('Error deleting business:', error);
    throw new Error(error.message);
  }
};
