import React from "react";
import DateField from "./DateField";

interface DateRangeFieldProps {
  label: string;
  nameFrom: string;
  nameTo: string;
  valueFrom: string;
  valueTo: string;
  onChangeFrom: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeTo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholderFrom?: string;
  placeholderTo?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const DateRangeField = ({
  label,
  nameFrom,
  nameTo,
  valueFrom,
  valueTo,
  onChangeFrom,
  onChangeTo,
  error,
  placeholderFrom = "Desde",
  placeholderTo = "Hasta",
  required = false,
  disabled = false,
  className = "",
}: DateRangeFieldProps) => {
  return (
    <div className={className}>
      <label className="block text-sm/6 font-medium text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <DateField
          label="Desde"
          name={nameFrom}
          value={valueFrom}
          onChange={onChangeFrom}
          placeholder={placeholderFrom}
          disabled={disabled}
          className=""
        />
        <DateField
          label="Hasta"
          name={nameTo}
          value={valueTo}
          onChange={onChangeTo}
          placeholder={placeholderTo}
          disabled={disabled}
          className=""
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default DateRangeField;
