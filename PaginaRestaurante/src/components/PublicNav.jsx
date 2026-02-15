import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/homepage.css';

const PublicNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    const next = !isMenuOpen;
    setIsMenuOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      closeMenu();
    }
  };

  return (
    <header id="main-header" className="scrolled">
      <nav>
        <div className="logo">
          <Link to="/" onClick={handleNavClick}>
            {/* Reemplaza este span por tu <img src="..."> cuando tengas el logo */}
            <span>Logo</span>
          </Link>
        </div>
        <button
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          id="menu-toggle"
          type="button"
          aria-label="Abrir menú"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul id="nav-menu" className={isMenuOpen ? 'active' : ''}>
          <li>
            <Link to="/menu" onClick={handleNavClick}>
              Menu
            </Link>
          </li>
          <li>
            <a
              href="/AP_Restaurante/public/website/pages/contacto.html"
              onClick={handleNavClick}
            >
              Contacto
            </a>
          </li>
          <li>
            <Link to="/login" onClick={handleNavClick}>
              Sistema de Gestión
            </Link>
          </li>
        </ul>
      </nav>
      <div
        className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}
        id="menu-overlay"
        onClick={closeMenu}
      ></div>
    </header>
  );
};

export default PublicNav;


