# Reglas de Navegación

**Librería:** React Router (última versión estable).

**Estilo de Configuración:**

- Usa el nuevo "Data Router" (usando `createBrowserRouter`).
- Las rutas deben estar en un archivo separado en `src/routes/index.tsx`.
- Usa "MainLayout" para envolver las páginas protegidas.

**Reglas para el Agente:**

- Cada vez que crees una página nueva, regístrala automáticamente en el archivo de rutas.
- Usa los alias `@/pages/...` para las importaciones.
