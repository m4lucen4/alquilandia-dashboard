# AGENTS.md — alquilandia-dashboard

Dashboard de gestión para Alquilandia.
React + TypeScript + Tailwind CSS v4 + Redux Toolkit.

## Stack
React 19 · TypeScript · Tailwind CSS v4 · Redux Toolkit · redux-persist · Heroicons

## Arquitectura
src/
  services/       ← HTTP calls (apiClient)
  types/          ← interfaces + slice state shapes
  redux/
    actions/      ← createAsyncThunk
    slices/       ← createSlice + extraReducers
  components/
  pages/

## Decisiones tomadas
- HTTP exclusivamente via `apiClient` (src/services/api.ts)
- Redux Toolkit para estado global; redux-persist persiste auth
- Tailwind CSS v4 utility-first; no CSS Modules
- TypeScript estricto en todo el proyecto

## Convenciones
- Código en inglés · explicaciones en español
- Named exports + Functional Components
- Sufijo `Thunk` cuando el nombre del thunk colisiona con la función del service
- Constante `requestIdle = { inProgress: false, messages: "", ok: false }` en todo slice
- `apiClient` detecta `FormData` y omite `Content-Type` automáticamente

## Skills disponibles

| Skill | Cuándo invocar | Estado |
|---|---|---|
| `/create-component` | Crear o refactorizar componentes UI | activa |
| `/create-action-rtk` | Añadir acciones RTK (service + thunk + types + slice) | activa |
| `/pdf-generation` | Modificar o añadir generación de PDFs | activa |

> Antes de ejecutar una skill, lee `skills/<nombre>/SKILL.md`.

## Prohibido
- `any` en TypeScript
- `axios` o `fetch` directo — siempre `apiClient`
- CSS Modules salvo limitación técnica demostrable
- `Content-Type` manual en peticiones FormData
- Thunks para cleaners de redux — usar `reducers` síncronos del slice
