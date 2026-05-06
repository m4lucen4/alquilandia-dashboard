import { useState, type FC } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { s3BaseURL } from "@/constants";
import type { Inventory, InventoryImage } from "@/types/inventory";

interface ModalImagesInventoryProps {
  isOpen: boolean;
  item: Inventory | null;
  onClose: () => void;
}

export const ModalImagesInventory: FC<ModalImagesInventoryProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  const [selected, setSelected] = useState<number>(0);

  if (!isOpen || !item) return null;

  const images: InventoryImage[] = item.archivo ?? [];

  const prev = () => setSelected((i) => (i - 1 + images.length) % images.length);
  const next = () => setSelected((i) => (i + 1) % images.length);

  const imageUrl = (uri: string) => `${s3BaseURL}${uri}`;

  const fallbackSrc =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%239ca3af'%3ESin imagen%3C/text%3E%3C/svg%3E";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
        role="dialog"
        aria-labelledby="modal-images-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h3
              id="modal-images-title"
              className="text-xl font-semibold text-gray-900"
            >
              Imágenes
            </h3>
            <p className="mt-0.5 text-sm text-gray-500">{item.elemento}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Cerrar modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden px-6 pb-6 flex flex-col gap-4">
          {images.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">
              Este artículo no tiene imágenes
            </p>
          ) : (
            <>
              {/* Main image */}
              <div className="relative h-[55vh] bg-gray-100 rounded-xl overflow-hidden group">
                <img
                  key={selected}
                  src={imageUrl(images[selected].fileUri)}
                  alt={images[selected].title || images[selected].fileName}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackSrc;
                  }}
                />

                {/* Título sobre la imagen */}
                {images[selected].title && (
                  <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/50 to-transparent px-4 py-3">
                    <p className="text-sm text-white font-medium truncate">
                      {images[selected].title}
                    </p>
                  </div>
                )}

                {/* Abrir en pestaña */}
                <a
                  href={imageUrl(images[selected].fileUri)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 rounded-lg bg-black/40 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  aria-label="Abrir en nueva pestaña"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>

                {/* Navegación prev/next */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors focus:outline-none"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors focus:outline-none"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Contador */}
                {images.length > 1 && (
                  <span className="absolute top-3 left-3 rounded-full bg-black/40 px-2.5 py-0.5 text-xs text-white">
                    {selected + 1} / {images.length}
                  </span>
                )}
              </div>

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
                  {images.map((image, idx) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelected(idx)}
                      className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${
                        idx === selected
                          ? "border-blue-500 opacity-100"
                          : "border-transparent opacity-60 hover:opacity-90"
                      }`}
                      aria-label={`Ver imagen ${idx + 1}`}
                    >
                      <img
                        src={imageUrl(image.fileUri)}
                        alt={image.title || image.fileName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackSrc;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
