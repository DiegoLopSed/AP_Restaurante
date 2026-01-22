import { useState } from 'react';
import { Outlet } from 'react-router-dom';
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

const UserLayout = () => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <ChartBarIcon />,
      hasArrow: true
    },
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: <UserIcon />,
      hasArrow: true
    },
    {
      id: 'orders',
      label: 'Mis Pedidos',
      icon: <ShoppingCartIcon />,
      hasArrow: true
    }
  ];

  const handleLogout = () => {
    // Redirigir al index.html fuera de react-dashboard
    // Usar ruta absoluta desde la raíz del servidor
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/index.html`;
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
            onItemClick={setActiveItem}
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

