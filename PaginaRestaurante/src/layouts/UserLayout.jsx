import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  UserIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
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
        { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon />, hasArrow: true, to: `${basePath}/dashboard` },
        ...(esCliente ? [] : [{ id: 'profile', label: 'Mi Perfil', icon: <UserIcon />, hasArrow: true, to: '/user/profile' }]),
        { id: 'orders', label: 'Mis Pedidos', icon: <ShoppingCartIcon />, hasArrow: true, to: `${basePath}/dashboard` },
      ];
      return items;
    },
    [basePath, esCliente]
  );

  useEffect(() => {
    const p = location.pathname;
    if (!esCliente && (p.includes('/user/profile') || p.includes('/profile'))) {
      setActiveItem('profile');
    } else {
      setActiveItem('dashboard');
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
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <BoltIcon />
          </div>
          <span className={styles.logoText}>Dashboard v.01</span>
        </div>
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
        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <ArrowRightOnRectangleIcon />
          <span>Salir</span>
        </button>
      </aside>
      <main className={styles.mainContent} role="main">
        <div className={styles.contentArea}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default UserLayout;

