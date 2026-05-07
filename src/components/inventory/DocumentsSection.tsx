import { type FC, useEffect, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  PaperClipIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { InventoryDocument } from "@/types/inventory";
import {
  deleteDocument,
  listDocuments,
  uploadDocument,
} from "@/services/inventoryDocumentsService";

const MAX_FILES = 5;
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface DocumentsSectionProps {
  inventoryId: string;
}

export const DocumentsSection: FC<DocumentsSectionProps> = ({
  inventoryId,
}) => {
  const [documents, setDocuments] = useState<InventoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listDocuments(inventoryId)
      .then((docs) => {
        if (!cancelled) setDocuments(docs);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Error al cargar documentos",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inventoryId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (!files.length) return;

    setError(null);

    const available = MAX_FILES - documents.length;
    const toUpload = files.slice(0, available);

    if (files.length > available) {
      setError(
        `Solo puedes subir ${available} archivo(s) más. Se ignoraron ${files.length - available}.`,
      );
      if (!toUpload.length) return;
    }

    const oversized = toUpload.find((f) => f.size > MAX_SIZE_BYTES);
    if (oversized) {
      setError(`"${oversized.name}" supera el límite de ${MAX_SIZE_MB} MB`);
      return;
    }

    setUploading(true);
    try {
      for (const file of toUpload) {
        const doc = await uploadDocument(inventoryId, file);
        setDocuments((prev) => [...prev, doc]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: InventoryDocument) => {
    setError(null);
    try {
      await deleteDocument(doc);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Error al eliminar el documento",
      );
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canUpload = documents.length < MAX_FILES && !uploading;

  return (
    <div>
      <label className="block text-sm/6 font-medium text-gray-900">
        Documentos adjuntos
      </label>
      <p className="text-xs text-gray-400">
        Máx. {MAX_FILES} archivos · {MAX_SIZE_MB} MB por archivo
      </p>

      {loading ? (
        <p className="mt-2 text-xs text-gray-400">Cargando documentos...</p>
      ) : (
        <>
          {documents.length > 0 && (
            <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-200">
              {documents.map((doc) => (
                <li
                  key={doc.path}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <DocumentIcon className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="flex-1 truncate text-sm text-gray-700">
                    {doc.name}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatSize(doc.size)}
                  </span>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none"
                    aria-label={`Descargar ${doc.name}`}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none"
                    aria-label={`Eliminar ${doc.name}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

          {canUpload ? (
            <div className="mt-3">
              <input
                ref={inputRef}
                id="inventory-docs-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="inventory-docs-upload"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-300 transition-colors hover:bg-gray-100"
              >
                <PaperClipIcon className="h-4 w-4" />
                {uploading ? "Subiendo..." : "Adjuntar archivo"}
              </label>
              {!uploading && (
                <p className="mt-1 text-xs text-gray-400">
                  {MAX_FILES - documents.length} espacio(s) disponible(s)
                </p>
              )}
            </div>
          ) : (
            !uploading && (
              <p className="mt-2 text-xs text-gray-400">
                Límite de {MAX_FILES} documentos alcanzado
              </p>
            )
          )}
        </>
      )}
    </div>
  );
};
