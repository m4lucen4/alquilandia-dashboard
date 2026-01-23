import { useState } from "react";
import type { FC } from "react";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";

interface AlertProps {
  title: string;
  description: string;
  onClose?: () => void;
}

// Hoist static styles outside component to avoid recalculation on every render
const BACKDROP_STYLES = "absolute inset-0 bg-black/50 backdrop-blur-sm";
const CLOSE_BUTTON_STYLES =
  "absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
const ACCEPT_BUTTON_STYLES =
  "w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 sm:w-auto sm:px-6";

export const Alert: FC<AlertProps> = ({ title, description, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    // Esperar a que termine la animación antes de llamar onClose
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  // Only compute dynamic styles that depend on state
  const overlayStyles = `fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
    isVisible ? "opacity-100" : "opacity-0"
  }`;

  const modalStyles = `relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
    isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
  }`;

  return (
    <div className={overlayStyles}>
      {/* Backdrop */}
      <div
        className={BACKDROP_STYLES}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Alert Modal */}
      <div
        className={modalStyles}
        role="alertdialog"
        aria-labelledby="alert-title"
        aria-describedby="alert-description"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={CLOSE_BUTTON_STYLES}
          aria-label="Cerrar alerta"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h3
            id="alert-title"
            className="mb-3 text-xl font-semibold text-gray-900 sm:text-2xl"
          >
            {title}
          </h3>
          <p
            id="alert-description"
            className="text-sm leading-relaxed text-gray-600 sm:text-base"
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
          <button onClick={handleClose} className={ACCEPT_BUTTON_STYLES}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
