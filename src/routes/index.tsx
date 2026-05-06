import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import Accounting from "@/pages/accounting/Accounting";
import Invoices from "@/pages/accounting/Invoices";
import { Budgets } from "@/pages/Budgets";
import { CreateBudgetPage } from "@/pages/CreateBudgetPage";
import { Users } from "@/pages/Users";
import { InventoryPage } from "@/pages/Inventory";
import { Settings } from "@/pages/Settings";
import { Profile } from "@/pages/Profile";
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
            path: "users",
            element: <Users />,
          },
          {
            path: "budgets",
            element: <Budgets />,
          },
          {
            path: "budgets/new",
            element: <CreateBudgetPage />,
          },
          {
            path: "inventory",
            element: <InventoryPage />,
          },
          {
            path: "profile",
            element: <Profile />,
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
