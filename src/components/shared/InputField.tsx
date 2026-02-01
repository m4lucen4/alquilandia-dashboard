import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  type?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  onBlur?:
    | ((e: React.FocusEvent<HTMLInputElement>) => void)
    | ((e: React.FocusEvent<HTMLTextAreaElement>) => void);
  onKeyDown?:
    | ((e: React.KeyboardEvent<HTMLInputElement>) => void)
    | ((e: React.KeyboardEvent<HTMLTextAreaElement>) => void);
  as?: "input" | "textarea";
  rows?: number;
}

// Hoist static CSS classes outside component to avoid recalculation on every render
const BASE_INPUT_CLASSES =
  "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 sm:text-sm/6 transition-colors";

const NORMAL_INPUT_CLASSES =
  "outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600";

const ERROR_INPUT_CLASSES =
  "outline-1 -outline-offset-1 outline-red-500 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600";

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  className = "",
  onBlur,
  onKeyDown,
  as = "input",
  rows = 3,
}: InputFieldProps) => {
  const inputId = `input-${name}`;

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
        {as === "textarea" ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
            onBlur={onBlur as (e: React.FocusEvent<HTMLTextAreaElement>) => void}
            onKeyDown={onKeyDown as (e: React.KeyboardEvent<HTMLTextAreaElement>) => void}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={inputClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            onBlur={onBlur as (e: React.FocusEvent<HTMLInputElement>) => void}
            onKeyDown={onKeyDown as (e: React.KeyboardEvent<HTMLInputElement>) => void}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            className={inputClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        )}
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

export default InputField;
