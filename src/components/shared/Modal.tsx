import { useState } from "react";
import Button from "./Button";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onAccept: () => void;
  onClose?: () => void;
  acceptText?: string;
  cancelText?: string;
}

export const Modal = ({
  title,
  children,
  onAccept,
  onClose,
  acceptText = "Aceptar",
  cancelText = "Cancelar",
}: ModalProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  const handleAccept = () => {
    setIsVisible(false);
    setTimeout(() => {
      onAccept();
      onClose?.();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg transform rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Cerrar modal"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h3
            id="modal-title"
            className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl"
          >
            {title}
          </h3>
          <div className="text-sm leading-relaxed text-gray-600 sm:text-base">
            {children}
          </div>
        </div>

        {/* Footer with two buttons */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              title={cancelText}
              onClick={handleClose}
              variant="secondary"
            />
            <Button
              title={acceptText}
              onClick={handleAccept}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
