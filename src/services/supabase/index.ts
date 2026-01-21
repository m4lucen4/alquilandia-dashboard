/**
 * Exportaciones centralizadas de servicios de Supabase
 *
 * Uso:
 * import { getRecords, uploadFile } from '@/services/supabase';
 */

// Database services
export {
  getRecords,
  getRecordById,
  insertRecord,
  updateRecord,
  deleteRecord,
  queryRecords,
} from './database';

// Storage services
export {
  uploadFile,
  getPublicUrl,
  downloadFile,
  deleteFile,
  listFiles,
  createSignedUrl,
  moveFile,
  copyFile,
  type UploadOptions,
} from './storage';

// Supabase client (por si necesitas acceso directo)
export { supabase } from '../../config/supabase';
