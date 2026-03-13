import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const isClientRoute = location.pathname.startsWith('/clients');
    const redirectTo = isClientRoute ? '/lealtad' : '/login';
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return children;
}


