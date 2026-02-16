import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon,
  CubeIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import styles from '../assets/css/ManagerLayout.module.css';
import { useAuth } from '../contexts/AuthContext';

const ManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');

  const navItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon />, hasArrow: true, to: '/manager/dashboard' },
      { id: 'insumos', label: 'Insumos', icon: <CubeIcon />, hasArrow: true, to: '/manager/insumos' },
      { id: 'categorias', label: 'Categorías', icon: <TagIcon />, hasArrow: true, to: '/manager/categorias' },
      { id: 'usuarios', label: 'Usuarios', icon: <UserIcon />, hasArrow: true, to: '/manager/usuarios' },
      { id: 'employees', label: 'Empleados', icon: <UserGroupIcon />, hasArrow: true, to: '/manager/employees' },
      { id: 'reports', label: 'Reportes', icon: <ClipboardDocumentListIcon />, hasArrow: true, to: '/manager/dashboard' },
      { id: 'settings', label: 'Configuración', icon: <Cog6ToothIcon />, hasArrow: true, to: '/manager/dashboard' },
    ],
    []
  );

  useEffect(() => {
    // Mantener activo el item según la URL (cuando recargan o navegan con el navegador)
    const p = location.pathname;
    if (p.includes('/manager/insumos')) setActiveItem('insumos');
    else if (p.includes('/manager/categorias')) setActiveItem('categorias');
    else if (p.includes('/manager/usuarios')) setActiveItem('usuarios');
    else if (p.includes('/manager/employees')) setActiveItem('employees');
    else if (p.includes('/manager/reports')) setActiveItem('reports');
    else if (p.includes('/manager/settings')) setActiveItem('settings');
    else setActiveItem('dashboard');
  }, [location.pathname]);

  const handleNavClick = (itemId) => {
    const item = navItems.find((i) => i.id === itemId);
    setActiveItem(itemId);
    if (item?.to) navigate(item.to);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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

export default ManagerLayout;

