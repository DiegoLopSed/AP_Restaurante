import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Protege rutas de empleados/colaboradores (user, manager). Redirige clientes al dashboard de clientes. */
export default function RequireEmpleado({ children }) {
  const { usuario } = useAuth();

  if (usuario?.tipo === 'cliente') {
    return <Navigate to="/clients/dashboard" replace />;
  }

  return children;
}
