import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import Accounting from "@/pages/accounting/Accounting";
import Invoices from "@/pages/accounting/Invoices";
import { Budgets } from "@/pages/Budgets";
import { Settings } from "@/pages/Settings";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PublicRoute from "./PublicRoute";

export const router = createBrowserRouter([
  {
    path: "/",
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
            path: "accounting/invoices",
            element: <Invoices />,
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
