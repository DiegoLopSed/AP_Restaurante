import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import UserDashboard from "./pages/user/Dashboard";
import UserProfile from "./pages/user/Profile";
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerEmployees from "./pages/manager/Employees";
import ClientDashboard from "./pages/clients/Dashboard";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de usuario */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Rutas de clientes frecuentes */}
        <Route path="/clients" element={<UserLayout />}>
          <Route index element={<Navigate to="/clients/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
        </Route>

        {/* Rutas de gerente */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="employees" element={<ManagerEmployees />} />
        </Route>

        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
