---
name: Create Component
description: Estándares para componentes React con TS y Tailwind CSS v4.
trigger: "component, tsx, style, tailwind, classname"
---

# React + Tailwind Best Practices

## 1. Component Template (Tailwind Edition)

Los componentes deben ser "self-contained" en cuanto a estilos.

```typescript
import { FC } from 'react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

export const Button: FC<ButtonProps> = ({ label, variant = 'primary', onClick }) => {
  // Lógica de clases dinámicas
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```
