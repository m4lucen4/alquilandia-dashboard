import { supabase } from "@/config/supabase";
import type { InventoryDocument } from "@/types/inventory";

const BUCKET = "inventory-documents";

export async function listDocuments(
  inventoryId: string,
): Promise<InventoryDocument[]> {
  const { data, error } = await supabase
    .from("inventory_documents")
    .select("*")
    .eq("inventory_id", inventoryId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(row.storage_path);
    return {
      id: row.id,
      name: row.file_name,
      path: row.storage_path,
      url: urlData.publicUrl,
      size: row.file_size,
      mimeType: row.mime_type,
      createdAt: row.created_at,
    };
  });
}

export async function uploadDocument(
  inventoryId: string,
  file: File,
): Promise<InventoryDocument> {
  const safeName = file.name.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${Date.now()}_${safeName}`;
  const path = `${inventoryId}/${storedName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error: insertError } = await supabase
    .from("inventory_documents")
    .insert({
      inventory_id: inventoryId,
      storage_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || null,
    })
    .select()
    .single();

  if (insertError) {
    // Revertir el archivo subido si falla el registro en tabla
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(insertError.message);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return {
    id: data.id,
    name: file.name,
    path,
    url: urlData.publicUrl,
    size: file.size,
    mimeType: file.type || null,
    createdAt: data.created_at,
  };
}

export async function deleteDocument(doc: InventoryDocument): Promise<void> {
  const { error: dbError } = await supabase
    .from("inventory_documents")
    .delete()
    .eq("id", doc.id);

  if (dbError) throw new Error(dbError.message);

  await supabase.storage.from(BUCKET).remove([doc.path]);
}
