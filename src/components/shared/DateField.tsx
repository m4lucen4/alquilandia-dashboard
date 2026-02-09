import React from "react";

interface DateFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

// Hoist static CSS classes outside component to avoid recalculation on every render
const BASE_INPUT_CLASSES =
  "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 sm:text-sm/6 transition-colors";

const NORMAL_INPUT_CLASSES =
  "outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600";

const ERROR_INPUT_CLASSES =
  "outline-1 -outline-offset-1 outline-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600";

const DateField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  onBlur,
  onKeyDown,
}: DateFieldProps) => {
  const inputId = `date-${name}`;

  const inputClasses = `${BASE_INPUT_CLASSES} ${
    error ? ERROR_INPUT_CLASSES : NORMAL_INPUT_CLASSES
  }`;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="block text-sm/6 font-medium text-gray-900"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-2">
        <input
          id={inputId}
          name={name}
          type="date"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default DateField;
