import { supabase } from '../../config/supabase';

/**
 * Servicio para interactuar con Supabase Storage
 */

export interface UploadOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

/**
 * Sube un archivo a un bucket
 * @param bucket Nombre del bucket
 * @param path Ruta donde se guardará el archivo
 * @param file Archivo a subir
 * @param options Opciones adicionales
 * @returns Promise con la ruta del archivo
 *
 * @example
 * const filePath = await uploadFile('avatars', 'user-123.jpg', file);
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File | Blob,
  options?: UploadOptions
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) {
    console.error(`Error uploading file to ${bucket}/${path}:`, error);
    throw new Error(error.message);
  }

  return data.path;
};

/**
 * Obtiene la URL pública de un archivo
 * @param bucket Nombre del bucket
 * @param path Ruta del archivo
 * @returns URL pública del archivo
 *
 * @example
 * const url = getPublicUrl('avatars', 'user-123.jpg');
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Descarga un archivo
 * @param bucket Nombre del bucket
 * @param path Ruta del archivo
 * @returns Promise con el Blob del archivo
 *
 * @example
 * const blob = await downloadFile('documents', 'invoice-123.pdf');
 */
export const downloadFile = async (
  bucket: string,
  path: string
): Promise<Blob> => {
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    console.error(`Error downloading file from ${bucket}/${path}:`, error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * Elimina un archivo
 * @param bucket Nombre del bucket
 * @param paths Ruta(s) del archivo a eliminar
 * @returns Promise<void>
 *
 * @example
 * await deleteFile('avatars', 'user-123.jpg');
 * await deleteFile('avatars', ['user-123.jpg', 'user-456.jpg']);
 */
export const deleteFile = async (
  bucket: string,
  paths: string | string[]
): Promise<void> => {
  const pathsArray = Array.isArray(paths) ? paths : [paths];

  const { error } = await supabase.storage.from(bucket).remove(pathsArray);

  if (error) {
    console.error(`Error deleting files from ${bucket}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Lista los archivos de un bucket
 * @param bucket Nombre del bucket
 * @param path Ruta del directorio (opcional)
 * @param options Opciones de listado
 * @returns Promise con la lista de archivos
 *
 * @example
 * const files = await listFiles('documents', 'invoices/2024');
 */
export const listFiles = async (
  bucket: string,
  path?: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }
): Promise<
  Array<{
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: Record<string, unknown>;
  }>
> => {
  const { data, error } = await supabase.storage.from(bucket).list(path, options);

  if (error) {
    console.error(`Error listing files from ${bucket}:`, error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * Crea una URL firmada para acceso temporal a un archivo privado
 * @param bucket Nombre del bucket
 * @param path Ruta del archivo
 * @param expiresIn Tiempo de expiración en segundos (por defecto 60)
 * @returns Promise con la URL firmada
 *
 * @example
 * const url = await createSignedUrl('private-docs', 'contract.pdf', 3600);
 */
export const createSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn = 60
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error(`Error creating signed URL for ${bucket}/${path}:`, error);
    throw new Error(error.message);
  }

  return data.signedUrl;
};

/**
 * Mueve un archivo dentro de un bucket
 * @param bucket Nombre del bucket
 * @param fromPath Ruta actual del archivo
 * @param toPath Nueva ruta del archivo
 * @returns Promise<void>
 *
 * @example
 * await moveFile('documents', 'temp/file.pdf', 'permanent/file.pdf');
 */
export const moveFile = async (
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath);

  if (error) {
    console.error(`Error moving file in ${bucket}:`, error);
    throw new Error(error.message);
  }
};

/**
 * Copia un archivo dentro de un bucket
 * @param bucket Nombre del bucket
 * @param fromPath Ruta del archivo original
 * @param toPath Ruta de la copia
 * @returns Promise<void>
 *
 * @example
 * await copyFile('documents', 'original.pdf', 'backup/original.pdf');
 */
export const copyFile = async (
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath);

  if (error) {
    console.error(`Error copying file in ${bucket}:`, error);
    throw new Error(error.message);
  }
};
