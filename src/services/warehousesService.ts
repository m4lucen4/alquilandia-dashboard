import { supabase } from "@/config/supabase";
import type { Warehouse, WarehouseInsert, WarehouseUpdate } from "@/types/warehouses";

const TABLE_NAME = "warehouses";

export const getAllWarehouses = async (): Promise<Warehouse[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const createWarehouse = async (warehouse: WarehouseInsert): Promise<Warehouse> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(warehouse as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No data returned when creating warehouse");
  return data;
};

export const updateWarehouse = async (
  id: string,
  updates: WarehouseUpdate,
): Promise<Warehouse> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No data returned when updating warehouse");
  return data;
};

export const deleteWarehouse = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw new Error(error.message);
};
