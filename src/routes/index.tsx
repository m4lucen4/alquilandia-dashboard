import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import Accounting from "@/pages/accounting/Accounting";
import { Budgets } from "@/pages/Budgets";
import { Settings } from "@/pages/Settings";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PublicRoute from "./PublicRoute";
import { store } from "@/redux/store";

// Loader para verificar autenticación antes de renderizar
const protectedLoader = () => {
  const state = store.getState();
  const isAuthenticated = state.auth.authenticated;

  if (!isAuthenticated) {
    return redirect("/login");
  }

  return null;
};

// Loader para verificar que el usuario sea ADMIN
const adminLoader = () => {
  const state = store.getState();
  const { authenticated, user } = state.auth;

  if (!authenticated) {
    return redirect("/login");
  }

  if (user?.role !== "ADMIN") {
    return redirect("/");
  }

  return null;
};

export const router = createBrowserRouter([
  {
    path: "/",
    loader: protectedLoader,
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "accounting",
            element: <Accounting />,
          },
          {
            path: "budgets",
            element: <Budgets />,
          },
        ],
      },
    ],
  },
  {
    path: "/settings",
    loader: adminLoader,
    element: <AdminRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Settings />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
