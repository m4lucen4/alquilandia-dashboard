import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { isAuthorizedPlatformSession } from "@/types/auth";

/**
 * Componente que protege rutas accesibles solo para usuarios ADMIN
 * Si el usuario no está autenticado o no tiene role ADMIN, redirige al Home
 */
const AdminRoute = () => {
  const { authenticated, user } = useAppSelector((state) => state.auth);

  // Si no está autenticado, redirige a login
  if (!isAuthorizedPlatformSession(authenticated, user)) {
    return <Navigate to="/login" replace />;
  }

  // Si no es ADMIN, redirige al Home
  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
