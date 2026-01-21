import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';

const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.authenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
