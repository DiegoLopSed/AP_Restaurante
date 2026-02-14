import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import styles from '../assets/css/ManagerLayout.module.css';

const ManagerLayout = () => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <ChartBarIcon />,
      hasArrow: true
    },
    {
      id: 'employees',
      label: 'Empleados',
      icon: <UserGroupIcon />,
      hasArrow: true
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: <ClipboardDocumentListIcon />,
      hasArrow: true
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Cog6ToothIcon />,
      hasArrow: true
    }
  ];

  const handleLogout = () => {
    // Lógica de logout aquí
    console.log('Cerrar sesión');
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

export default ManagerLayout;

