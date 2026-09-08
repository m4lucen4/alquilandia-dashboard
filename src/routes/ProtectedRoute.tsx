import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { isAuthorizedPlatformSession } from "@/types/auth";

const ProtectedRoute = () => {
  const { authenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthorizedPlatformSession(authenticated, user)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
