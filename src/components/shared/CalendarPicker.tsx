import { type FC } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "react-day-picker/style.css";

interface CalendarPickerProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CalendarPicker: FC<CalendarPickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={className}>
      <span className="block text-sm/6 font-medium text-gray-900">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      <div
        className="mt-2 inline-block rounded-xl border border-gray-200 bg-white shadow-sm"
        style={
          {
            "--rdp-accent-color": "#2563eb",
            "--rdp-accent-background-color": "#eff6ff",
            "--rdp-today-color": "#2563eb",
          } as React.CSSProperties
        }
      >
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          locale={es}
          disabled={disabled}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2035, 11)}
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
