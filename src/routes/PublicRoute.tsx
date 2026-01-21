import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useAppSelector((state) => state.auth.authenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
