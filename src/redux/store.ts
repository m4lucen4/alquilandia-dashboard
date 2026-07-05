import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import budgetsReducer from "./slices/budgetsSlice";
import budgetWizardReducer from "./slices/budgetWizardSlice";
import businessReducer from "./slices/businessSlice";
import taxesTypesReducer from "./slices/taxesTypesSlice";
import invoicesTypesReducer from "./slices/invoicesTypesSlice";
import invoicesReducer from "./slices/invoicesSlice";
import profileReducer from "./slices/profileSlice";
import usersReducer from "./slices/usersSlice";
import shippingCostsReducer from "./slices/shippingCostsSlice";
import warehousesReducer from "./slices/warehousesSlice";
import inventoryCategoriesReducer from "./slices/inventoryCategoriesSlice";
import inventoryReducer from "./slices/inventorySlice";
import discountsReducer from "./slices/discountsSlice";

const persistConfig = {
  key: "auth",
  storage,
};

const wizardPersistConfig = {
  key: "budgetWizard",
  storage,
  blacklist: [
    "createBudgetRequest",
    "updateEventDetailsRequest",
    "fetchCatalogRequest",
    "fetchStockRequest",
    "updateLinesRequest",
    "catalogProducts",
    "catalogTotal",
    "catalogPage",
    "catalogFiltersQuery",
    "stockByProductId",
    "finalizeRequest",
    "unavailableProducts",
  ],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedBudgetWizardReducer = persistReducer(wizardPersistConfig, budgetWizardReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    budgets: budgetsReducer,
    budgetWizard: persistedBudgetWizardReducer,
    business: businessReducer,
    taxesTypes: taxesTypesReducer,
    invoicesTypes: invoicesTypesReducer,
    invoices: invoicesReducer,
    profile: profileReducer,
    users: usersReducer,
    shippingCosts: shippingCostsReducer,
    warehouses: warehousesReducer,
    inventoryCategories: inventoryCategoriesReducer,
    inventory: inventoryReducer,
    discounts: discountsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
