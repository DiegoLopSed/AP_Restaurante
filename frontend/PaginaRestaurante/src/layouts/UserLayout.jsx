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
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, usuario } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');

  const basePath = location.pathname.startsWith('/clients') ? '/clients' : '/user';
  const esCliente = usuario?.tipo === 'cliente';

  const navItems = useMemo(
    () => {
      const items = [
        { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon />, to: `${basePath}/dashboard` },
      ];

      if (esCliente) {
        items.push(
          { id: 'orders', label: 'Mis pedidos', icon: <ShoppingCartIcon />, to: `${basePath}/pedidos` },
          { id: 'promotions', label: 'Promociones', icon: <TagIcon />, to: `${basePath}/promociones` },
        );
      } else {
        items.push(
          { id: 'profile', label: 'Mi perfil', icon: <UserIcon />, to: '/user/profile' },
          { id: 'orders', label: 'Mis pedidos', icon: <ShoppingCartIcon />, to: '/user/pedidos' },
        );
      }

      return items;
    },
    [basePath, esCliente]
  );

  useEffect(() => {
    const p = location.pathname;

    if (esCliente) {
      if (p.includes('/clients/pedidos')) setActiveItem('orders');
      else if (p.includes('/clients/promociones')) setActiveItem('promotions');
      else setActiveItem('dashboard');
    } else {
      if (p.includes('/user/pedidos')) setActiveItem('orders');
      else if (p.includes('/user/profile') || p.includes('/profile')) setActiveItem('profile');
      else setActiveItem('dashboard');
    }
  }, [location.pathname, esCliente]);

  const handleNavClick = (itemId) => {
    const item = navItems.find((i) => i.id === itemId);
    setActiveItem(itemId);
    if (item?.to) navigate(item.to);
  };

  const handleLogout = () => {
    const esCliente = usuario?.tipo === 'cliente';
    logout();
    navigate(esCliente ? '/lealtad' : '/login', { replace: true });
  };

  return (
    <div className={styles.layout}>
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
      <main className={styles.mainContent} role="main">
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserLayout;

