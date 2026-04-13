/**
 * ManagerLayout.jsx
 * 
 * Layout principal del panel de administrador del sistema del restaurante.
 * 
 * Este componente define la estructura general de la interfaz para los usuarios
 * con rol de administrador, incluyendo:
 * - Menú lateral de navegación
 * - Contenido dinámico mediante rutas anidadas (Outlet)
 * - Control de sesión (logout)
 * 
 * Funcionalidades principales:
 * - Navegación entre secciones del panel
 * - Detección automática de la ruta activa
 * - Manejo de estado del menú activo
 * - Cierre de sesión del usuario
 * @package AP_Restaurante
 * @subpackage FrontendManagerLayout.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 * 
 */

import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CubeIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Nav from '../components/Nav';
import styles from '../assets/css/ManagerLayout.module.css';
import { useAuth } from '../contexts/AuthContext';

const ManagerLayout = () => {

  // Hook para navegación programática entre rutas
  const navigate = useNavigate();

  // Obtiene la ruta actual de la aplicación
  const location = useLocation();

  // Función de logout desde el contexto de autenticación
  const { logout } = useAuth();

  // Estado que controla el item activo del menú lateral
  const [activeItem, setActiveItem] = useState('dashboard');

  /**
   * Lista de opciones del menú de navegación
   * useMemo evita recalcular el arreglo en cada render
   */
  const navItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon />, to: '/manager/dashboard' },
      { id: 'insumos', label: 'Insumos', icon: <CubeIcon />, to: '/manager/insumos' },
      { id: 'categorias', label: 'Categorías', icon: <TagIcon />, to: '/manager/categorias' },
      { id: 'crear-producto', label: 'Crear productos', icon: <CubeIcon />, to: '/manager/productos' },
      { id: 'usuarios', label: 'Usuarios', icon: <UserIcon />, to: '/manager/usuarios' },
      { id: 'employees', label: 'Empleados', icon: <UserGroupIcon />, to: '/manager/employees' },
      { id: 'reports', label: 'Reportes', icon: <ClipboardDocumentListIcon />, to: '/manager/reports' },
      { id: 'settings', label: 'Configuración', icon: <Cog6ToothIcon />, to: '/manager/dashboard' },
    ],
    []
  );

  /**
   * useEffect que sincroniza el item activo del menú
   * con la URL actual (útil al recargar o usar el navegador)
   */
  useEffect(() => {
    const path = location.pathname;

    if (path.includes('/manager/insumos')) setActiveItem('insumos');
    else if (path.includes('/manager/categorias')) setActiveItem('categorias');
    else if (path.includes('/manager/productos')) setActiveItem('crear-producto');
    else if (path.includes('/manager/usuarios')) setActiveItem('usuarios');
    else if (path.includes('/manager/employees')) setActiveItem('employees');
    else if (path.includes('/manager/reports')) setActiveItem('reports');
    else if (path.includes('/manager/settings')) setActiveItem('settings');
    else setActiveItem('dashboard');
  }, [location.pathname]);

  /**
   * Maneja el click en los elementos del menú
   * @param {string} itemId - ID del item seleccionado
   */
  const handleNavClick = (itemId) => {
    const item = navItems.find((i) => i.id === itemId);
    setActiveItem(itemId);

    if (item?.to) {
      navigate(item.to);
    }
  };

  /**
   * Cierra la sesión del usuario y redirige al login
   */
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar del panel */}
      <aside className={styles.sidebar} role="complementary">
        <nav className={styles.navSection} role="navigation">
          <Nav 
            items={navItems} 
            activeItem={activeItem}
            onItemClick={handleNavClick}
            logoutItem={{
              icon: <ArrowRightOnRectangleIcon />,
              label: 'Salir',
              onClick: handleLogout,
              ariaLabel: 'Cerrar sesión'
            }}
          />
        </nav>
      </aside>

      {/* Contenido principal dinámico */}
      <main className={styles.mainContent} role="main">
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;