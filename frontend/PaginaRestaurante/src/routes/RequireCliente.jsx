import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Protege rutas que solo deben ser accesibles por clientes frecuentes */
export default function RequireCliente({ children }) {
  const { usuario } = useAuth();

  if (usuario?.tipo !== 'cliente') {
    return <Navigate to="/lealtad" replace />;
  }

  return children;
}
