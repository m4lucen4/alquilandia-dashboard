import { type FC } from "react";

interface SummaryOptionsProps {
  nosend: boolean;
  withIVA: boolean;
  showIVAToggle: boolean;
  isDisabled: boolean;
  onToggleNosend: () => void;
  onToggleIVA: () => void;
}

export const SummaryOptions: FC<SummaryOptionsProps> = ({
  nosend,
  withIVA,
  showIVAToggle,
  isDisabled,
  onToggleNosend,
  onToggleIVA,
}) => (
  <div className="rounded-2xl bg-white p-6 shadow-sm flex flex-wrap gap-6">
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={nosend}
        disabled={isDisabled}
        onClick={onToggleNosend}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
          nosend ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            nosend ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700">Recogida en tienda</span>
    </label>

    {showIVAToggle && (
      <label className="flex cursor-pointer items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={withIVA}
          disabled={isDisabled}
          onClick={onToggleIVA}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
            withIVA ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              withIVA ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">Con IVA</span>
      </label>
    )}
  </div>
);
