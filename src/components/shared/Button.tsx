import React from 'react';

export interface ButtonProps {
  /** Text displayed in the button */
  title: string;
  /** Click handler function */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** If true, button takes full width of parent container */
  block?: boolean;
  /** If true, button is disabled and shows disabled styles */
  disabled?: boolean;
  /** Button variant for different visual styles */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Optional icon element to display before title */
  icon?: React.ReactNode;
  /** Button type attribute for forms */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

// Hoist static CSS classes outside component (Section 6.3: Hoist Static JSX Elements)
// This prevents recalculation on every render
const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT_CLASSES = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
} as const;

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
} as const;

// Loading spinner component (hoisted outside to avoid recreating on each render)
const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Button = ({
  title,
  onClick,
  block = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  type = 'button',
  className = '',
  ariaLabel,
}: ButtonProps) => {
  // Build className string once (avoid recalculation on each render)
  const buttonClasses = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${
    block ? 'w-full' : ''
  } ${className}`;

  // Combine disabled states
  const isDisabled = disabled || loading;

  // Section 5.7: Use Functional setState Updates
  // Use event handler with stable reference patterns
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={buttonClasses}
      aria-label={ariaLabel || title}
      aria-busy={loading}
    >
      {loading ? <Spinner /> : icon}
      {title}
    </button>
  );
};

export default Button;
