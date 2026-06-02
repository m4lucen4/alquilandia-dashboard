import { supabase } from "../../config/supabase";

/**
 * Servicio para interactuar con la base de datos de Supabase
 */

/**
 * Obtiene registros de una tabla
 * @param table Nombre de la tabla
 * @param columns Columnas a seleccionar (por defecto '*')
 * @returns Promise con los datos
 *
 * @example
 * const users = await getRecords('users', 'id, email, name');
 */
export const getRecords = async <T = unknown>(
  table: string,
  columns = "*",
): Promise<T[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from(table as any).select(columns);

  if (error) {
    console.error(`Error fetching records from ${table}:`, error);
    throw new Error(error.message);
  }

  return (data as T[]) || [];
};

/**
 * Obtiene un registro por ID
 * @param table Nombre de la tabla
 * @param id ID del registro
 * @param idColumn Nombre de la columna ID (por defecto 'id')
 * @returns Promise con el dato o null
 *
 * @example
 * const user = await getRecordById('users', '123');
 */
export const getRecordById = async <T = unknown>(
  table: string,
  id: string,
  idColumn = "id",
): Promise<T | null> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(table)
    .select("*")
    .eq(idColumn, id)
    .single();

  if (error) {
    console.error(`Error fetching record from ${table}:`, error);
    throw new Error(error.message);
  }

  return (data as T) || null;
};

/**
 * Inserta un nuevo registro
 * @param table Nombre de la tabla
 * @param record Datos del registro
 * @returns Promise con el registro creado
 *
 * @example
 * const newUser = await insertRecord('users', { email: 'test@example.com', name: 'Test' });
 */
export const insertRecord = async <T = unknown>(
  table: string,
  record: Partial<T>,
): Promise<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(table)
    .insert(record as never)
    .select()
    .single();

  if (error) {
    console.error(`Error inserting record into ${table}:`, error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(`No data returned when inserting into ${table}`);
  }

  return data as T;
};

/**
 * Actualiza un registro
 * @param table Nombre de la tabla
 * @param id ID del registro
 * @param updates Datos a actualizar
 * @param idColumn Nombre de la columna ID (por defecto 'id')
 * @returns Promise con el registro actualizado
 *
 * @example
 * const updated = await updateRecord('users', '123', { name: 'New Name' });
 */
export const updateRecord = async <T = unknown>(
  table: string,
  id: string,
  updates: Partial<T>,
  idColumn = "id",
): Promise<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(table)
    .update(updates as never)
    .eq(idColumn, id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating record in ${table}:`, error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(`No data returned when updating record in ${table}`);
  }

  return data as T;
};

/**
 * Elimina un registro
 * @param table Nombre de la tabla
 * @param id ID del registro
 * @param idColumn Nombre de la columna ID (por defecto 'id')
 * @returns Promise<void>
 *
 * @example
 * await deleteRecord('users', '123');
 */
export const deleteRecord = async (
  table: string,
  id: string,
  idColumn = "id",
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from(table).delete().eq(idColumn, id);

  if (error) {
    console.error(`Error deleting record from ${table}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Realiza una query personalizada
 * @param table Nombre de la tabla
 * @param builder Función que construye la query
 * @returns Promise con los datos
 *
 * @example
 * const activeUsers = await queryRecords('users', (query) =>
 *   query.select('*').eq('active', true).order('created_at', { ascending: false })
 * );
 */
export const queryRecords = async <T = unknown>(
  table: string,
  builder: (query: ReturnType<typeof supabase.from>) => unknown,
): Promise<T[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (supabase as any).from(table);
  const { data, error } = await (builder(query) as Promise<{
    data: T[] | null;
    error: unknown;
  }>);

  if (error) {
    console.error(`Error querying ${table}:`, error);
    throw new Error(String(error));
  }

  return data || [];
};
