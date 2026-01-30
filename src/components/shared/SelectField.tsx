import React from "react";

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
}

const BASE_SELECT_CLASSES =
  "block w-full rounded-md bg-white px-3 py-2 text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:bg-gray-100";

const NORMAL_SELECT_CLASSES =
  "border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const ERROR_SELECT_CLASSES =
  "border border-red-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600";

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  placeholder = "Selecciona una opción",
  required = false,
  disabled = false,
  className = "",
  emptyMessage,
}: SelectFieldProps) => {
  const selectId = `select-${name}`;

  const selectClasses = `${BASE_SELECT_CLASSES} ${
    error ? ERROR_SELECT_CLASSES : NORMAL_SELECT_CLASSES
  }`;

  return (
    <div className={className}>
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-900"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-2">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={selectClasses}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${selectId}-error` : undefined}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
      {emptyMessage && options.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
      )}
    </div>
  );
};

export default SelectField;
