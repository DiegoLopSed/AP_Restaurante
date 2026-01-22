import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import styles from '../assets/css/Nav.module.css';

const Nav = ({ items = [], activeItem, onItemClick, logoutItem }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleItemClick = (itemId) => {
    onItemClick?.(itemId);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    if (logoutItem?.onClick) {
      logoutItem.onClick();
    }
    setIsMobileMenuOpen(false);
  };

  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={styles.nav} role="navigation" aria-label="Navegación principal">
      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-expanded={isMobileMenuOpen}
        aria-label="Toggle menu"
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
      
      <ul className={`${styles.navList} ${isMobileMenuOpen ? styles.navListOpen : ''}`}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              className={`${styles.navItem} ${activeItem === item.id ? styles.active : ''}`}
              onClick={() => handleItemClick(item.id)}
              aria-current={activeItem === item.id ? 'page' : undefined}
              type="button"
            >
              {item.icon && <span className={styles.icon}>{item.icon}</span>}
              <span className={styles.label}>{item.label}</span>
              {item.hasArrow && <ArrowRightIcon className={styles.arrow} />}
            </button>
          </li>
        ))}
        {logoutItem && (
          <li className={styles.logoutListItem}>
            <button
              className={styles.navItem}
              onClick={handleLogoutClick}
              aria-label={logoutItem.ariaLabel || 'Cerrar sesión'}
              type="button"
            >
              {logoutItem.icon && <span className={styles.icon}>{logoutItem.icon}</span>}
              <span className={styles.label}>{logoutItem.label}</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Nav;

