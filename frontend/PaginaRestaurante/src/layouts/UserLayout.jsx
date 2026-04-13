/**
 * UserLayout.jsx
 * 
 * Layout principal para usuarios del sistema del restaurante.
 * 
 * Este componente define la estructura de navegación para usuarios normales
 * y clientes, adaptando dinámicamente las opciones del menú según el tipo
 * de usuario autenticado.
 * 
 * Funcionalidades principales:
 * - Renderiza menú lateral dinámico según el rol (cliente o usuario)
 * - Maneja navegación entre secciones
 * - Detecta la ruta activa automáticamente
 * - Permite cerrar sesión
 * - Renderiza contenido dinámico mediante <Outlet />
 * 
 * Diferencias por tipo de usuario:
 * - Cliente:
 *   * Mis pedidos
 *   * Promociones
 * - Usuario normal:
 *   * Perfil
 *   * Pedidos
 * @package AP_Restaurante
 * @subpackage FrontendUserLayout.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  UserIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import Nav from '../components/Nav';
import styles from '../assets/css/UserLayout.module.css';
import { useAuth } from '../contexts/AuthContext';

const UserLayout = () => {

  // Hook para navegación entre rutas
  const navigate = useNavigate();

  // Obtiene la ruta actual
  const location = useLocation();

  // Contexto de autenticación (usuario y logout)
  const { logout, usuario } = useAuth();

  // Estado para controlar el item activo del menú
  const [activeItem, setActiveItem] = useState('dashboard');

  /**
   * Determina la ruta base según el tipo de usuario
   * /clients → clientes
   * /user → usuarios normales
   */
  const basePath = location.pathname.startsWith('/clients') ? '/clients' : '/user';

  // Verifica si el usuario autenticado es cliente
  const esCliente = usuario?.tipo === 'cliente';

  /**
   * Genera dinámicamente los items del menú
   * dependiendo del tipo de usuario
   */
  const navItems = useMemo(
    () => {
      const items = [
        { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon />, to: `${basePath}/dashboard` },
      ];

      if (esCliente) {
        // Opciones para clientes
        items.push(
          { id: 'orders', label: 'Mis pedidos', icon: <ShoppingCartIcon />, to: `${basePath}/pedidos` },
          { id: 'promotions', label: 'Promociones', icon: <TagIcon />, to: `${basePath}/promociones` },
        );
      } else {
        // Opciones para usuarios normales
        items.push(
          { id: 'profile', label: 'Mi perfil', icon: <UserIcon />, to: '/user/profile' },
          { id: 'orders', label: 'Mis pedidos', icon: <ShoppingCartIcon />, to: '/user/pedidos' },
        );
      }

      return items;
    },
    [basePath, esCliente]
  );

  /**
   * Sincroniza el menú activo con la URL actual
   */
  useEffect(() => {
    const path = location.pathname;

    if (esCliente) {
      if (path.includes('/clients/pedidos')) setActiveItem('orders');
      else if (path.includes('/clients/promociones')) setActiveItem('promotions');
      else setActiveItem('dashboard');
    } else {
      if (path.includes('/user/pedidos')) setActiveItem('orders');
      else if (path.includes('/user/profile') || path.includes('/profile')) setActiveItem('profile');
      else setActiveItem('dashboard');
    }
  }, [location.pathname, esCliente]);

  /**
   * Maneja el click en el menú
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
   * Cierra sesión y redirige según el tipo de usuario
   * - Cliente → página de lealtad
   * - Usuario normal → login
   */
  const handleLogout = () => {
    const esCliente = usuario?.tipo === 'cliente';

    logout();

    navigate(esCliente ? '/lealtad' : '/login', { replace: true });
  };

  return (
    <div className={styles.layout}>

      {/* Sidebar de navegación */}
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

export default UserLayout;