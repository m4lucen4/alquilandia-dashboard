import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { isAuthorizedPlatformSession } from "@/types/auth";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { authenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthorizedPlatformSession(authenticated, user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
