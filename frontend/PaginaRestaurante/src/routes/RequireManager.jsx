import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireManager({ children }) {
  const { usuario } = useAuth();
  const pos = (usuario?.posicion || '').toLowerCase();
  const isManager = pos.includes('gerente') || pos.includes('admin');

  if (!isManager) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
}


