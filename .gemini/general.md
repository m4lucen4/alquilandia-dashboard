# Instrucciones de Inicio de Proyecto

**Objetivo:** Crear la base de una aplicación profesional de React siempre utilizando las últimas versiones.

**Tecnologías Obligatorias:**

- **Framework:** React con Vite.
- **Lenguaje:** TypeScript.
- **Estilos:** Tailwind CSS en su última versión, debe quedar ya configurado.
- **Estado Global:** Redux Toolkit en su última versión, debe quedar ya configurado.
- **Gestor de paquetes:** pnpm.

**Reglas de Estructura:**

- Instala todo en la carpeta raíz actual.
- Usa nombres de componentes en PascalCase (ej: `UserProfile.tsx`).
- Crea una carpeta `src/redux` para la configuración de Redux, ahí irá el archivo store.ts.
- Configura el alias `@` para que apunte a la carpeta `src/`.
- Esto debe quedar reflejado tanto en `tsconfig.json` (o `tsconfig.app.json`) como en `vite.config.ts`.
- Ejemplo de uso: `import Button from '@/components/Button'`.
- Limpia los archivos por defecto de Vite (borra el logo de React, el CSS de ejemplo, etc.) para dejar un "Hello World" limpio.

**Comportamiento del Agente:**

- Antes de ejecutar comandos de instalación, muéstrame un resumen de lo que vas a instalar.
