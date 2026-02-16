import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import UserDashboard from "./pages/user/Dashboard";
import UserProfile from "./pages/user/Profile";
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerEmployees from "./pages/manager/Employees";
import ManagerInsumos from "./pages/manager/Insumos";
import ManagerCategorias from "./pages/manager/Categorias";
import ManagerUsuarios from "./pages/manager/Usuarios";
import ClientDashboard from "./pages/clients/Dashboard";
import Login from "./pages/auth/Login";
import Lealtad from "./pages/lealtad/Lealtad";
import HomePage from "./pages/HomePage";
import Menu from "./pages/Menu";
import RequireAuth from "./routes/RequireAuth";
import RequireManager from "./routes/RequireManager";
import RequireCliente from "./routes/RequireCliente";
import RequireEmpleado from "./routes/RequireEmpleado";
import { useAuth } from "./contexts/AuthContext";
import './App.css';

function App() {
  const { isAuthenticated, usuario } = useAuth();
  const pos = (usuario?.posicion || '').toLowerCase();
  const esCliente = usuario?.tipo === 'cliente';
  const defaultAuthedPath = esCliente
    ? '/clients/dashboard'
    : pos.includes('gerente') || pos.includes('admin')
      ? '/manager/dashboard'
      : '/user/dashboard';

  return (
    // Importante: el build se sirve desde una subruta (ej: /AP_Restaurante/public/app/)
    // basename asegura que React Router no intente navegar desde la raíz del dominio.
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Página principal (Landing) */}
        <Route path="/" element={<HomePage />} />

        {/* Menú público */}
        <Route path="/menu" element={<Menu />} />

        {/* Login sistema de gestión (colaboradores) */}
        <Route path="/login" element={<Login />} />

        {/* Programa de lealtad (clientes frecuentes: registro + login) */}
        <Route path="/lealtad" element={<Lealtad />} />

        {/* Rutas de usuario (empleados) */}
        <Route
          path="/user"
          element={
            <RequireAuth>
              <RequireEmpleado>
                <UserLayout />
              </RequireEmpleado>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Rutas de clientes frecuentes */}
        <Route
          path="/clients"
          element={
            <RequireAuth>
              <RequireCliente>
                <UserLayout />
              </RequireCliente>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/clients/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
        </Route>

        {/* Rutas de gerente */}
        <Route
          path="/manager"
          element={
            <RequireAuth>
              <RequireEmpleado>
                <RequireManager>
                  <ManagerLayout />
                </RequireManager>
              </RequireEmpleado>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="employees" element={<ManagerEmployees />} />
          <Route path="insumos" element={<ManagerInsumos />} />
          <Route path="categorias" element={<ManagerCategorias />} />
          <Route path="usuarios" element={<ManagerUsuarios />} />
        </Route>

        {/* Ruta por defecto para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
