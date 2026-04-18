---
name: create-action-rtk
description: "Adds a new RTK action to this project: service function, async thunk, type updates, and slice extraReducers. Use when the user asks to add one or more API actions."
---

# Create RTK Action — alquilandia-dashboard

Follow this methodology exactly when adding new actions to the Redux Toolkit layer.

## Architecture overview

```
src/
  services/        ← HTTP calls (fetch via apiClient)
  types/           ← TypeScript interfaces + slice state shape
  redux/
    actions/       ← createAsyncThunk (one file per domain)
    slices/        ← createSlice with initialState + extraReducers
```

## Step 1 — Service function (`src/services/<domain>Service.ts`)

- Import `apiClient` from `./api`. Never use axios or raw fetch.
- Always `await apiClient(url, options)` then `.json()` the response.
- For `POST/PUT/DELETE` set `method` and `body: JSON.stringify(payload)`.
- For **FormData** (file uploads) do NOT stringify. Pass `body: formData` directly — `apiClient` auto-detects `FormData` and omits `Content-Type` so the browser sets the boundary.
- Export any parameter interfaces needed by the thunk from this file.

```typescript
// GET example
export const getFoo = async (id: string): Promise<Foo> => {
  const response = await apiClient(`/foos/${id}`);
  return response.json();
};

// POST example
export const createFoo = async (body: Partial<Foo>): Promise<Foo> => {
  const response = await apiClient("/foos/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.json();
};

// FormData example
export const uploadFoo = async (data: FooUploadData): Promise<void> => {
  const { file, ...rest } = data;
  const formData = new FormData();
  formData.append("payload", JSON.stringify(rest));
  if (file) formData.append("file", file);
  await apiClient("/foos/upload", { method: "POST", body: formData });
};
```

## Step 2 — Async thunk (`src/redux/actions/<domain>.ts`)

- Use `createAsyncThunk` for every action, no exceptions.
- Name format: `"domain/actionName"` (e.g. `"users/create"`).
- Always wrap in try/catch and call `rejectWithValue(errorMessage)` on failure.
- When the thunk takes `{ id, body }` or similar, type the argument as an inline object.
- Add `Thunk` suffix to the export name when it would collide with the service function name (e.g. `createFooThunk`).

```typescript
export const createFooThunk = createAsyncThunk(
  "foos/create",
  async (body: Partial<Foo>, { rejectWithValue }) => {
    try {
      return await createFoo(body);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al crear el foo";
      return rejectWithValue(errorMessage);
    }
  },
);

export const editFooThunk = createAsyncThunk(
  "foos/edit",
  async ({ id, body }: { id: string; body: Partial<Foo> }, { rejectWithValue }) => {
    try {
      return await editFoo(id, body);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al editar el foo";
      return rejectWithValue(errorMessage);
    }
  },
);
```

## Step 3 — Types (`src/types/<domain>.ts`)

Add to the `<Domain>State` interface:

- **Fetch actions that store data**: add `items: T[]`, `total: number`, and `fetchItemsRequest: IRequest`.
- **Fetch actions that load a single record**: add `currentItem: T | null` and `fetchItemRequest: IRequest`.
- **Mutation actions** (create/edit/delete/block/etc.): add only `<actionName>Request: IRequest`.

`IRequest` shape (from `src/types/auth.ts`):
```typescript
interface IRequest {
  inProgress: boolean;
  messages: string;
  ok: boolean;
}
```

## Step 4 — Slice (`src/redux/slices/<domain>Slice.ts`)

### initialState

Use a shared `requestIdle` constant to avoid repetition:
```typescript
const requestIdle = { inProgress: false, messages: "", ok: false };
```

Add every new field from the updated State interface to `initialState`.

### extraReducers

For **every** thunk add all three cases: `.pending`, `.fulfilled`, `.rejected`.

```typescript
// Fetch that stores a list
builder
  .addCase(fetchFoosThunk.pending, (state) => {
    state.fetchFoosRequest = { inProgress: true, messages: "", ok: false };
  })
  .addCase(fetchFoosThunk.fulfilled, (state, action) => {
    state.foos = action.payload.foos;
    state.foosTotal = action.payload.total ?? 0;
    state.fetchFoosRequest = { inProgress: false, messages: "", ok: true };
  })
  .addCase(fetchFoosThunk.rejected, (state, action) => {
    state.fetchFoosRequest = {
      inProgress: false,
      messages: (action.payload as string) || "Error al obtener foos",
      ok: false,
    };
  });

// Mutation (no data stored, just request state)
builder
  .addCase(createFooThunk.pending, (state) => {
    state.createFooRequest = { inProgress: true, messages: "", ok: false };
  })
  .addCase(createFooThunk.fulfilled, (state) => {
    state.createFooRequest = { inProgress: false, messages: "", ok: true };
  })
  .addCase(createFooThunk.rejected, (state, action) => {
    state.createFooRequest = {
      inProgress: false,
      messages: (action.payload as string) || "Error al crear el foo",
      ok: false,
    };
  });
```

### reducers (synchronous cleaners)

Add a cleaner reducer when the UI needs to reset state (e.g. closing a modal):
```typescript
reducers: {
  clearFoos: (state) => {
    state.foos = [];
    state.foosTotal = 0;
    state.fetchFoosRequest = requestIdle;
  },
},
```

## Checklist

When the user provides one or more old-style thunk functions to migrate:

- [ ] Read the relevant service file before editing it
- [ ] Read the relevant actions file before editing it
- [ ] Read the relevant slice file and its types before editing them
- [ ] Skip actions that already exist in another domain service (e.g. auth, profile)
- [ ] Skip "redux cleaners" — convert to synchronous `reducers` instead
- [ ] `apiClient` handles 401 → redirect to /login automatically; no need to handle it in thunks
- [ ] Never import axios or use raw fetch in service files
- [ ] Export new reducers (clearers) from the slice
