/**
 * HomePage.jsx
 * 
 * Página principal pública del sistema del restaurante.
 * 
 * Funcionalidades principales:
 * - Renderizado de la página de inicio con secciones informativas
 * - Efecto dinámico en el header al hacer scroll
 * - Navegación hacia el menú mediante React Router
 * - Uso de imágenes placeholder configurables
 * - Integración con componente de navegación pública
 * 
 * Secciones incluidas:
 * - Hero (branding principal)
 * - Presentación del restaurante
 * - Principales comidas destacadas
 * - Información del negocio (horarios y ubicación)
 * - Newsletter / novedades
 * 
 * Nota:
 * Esta vista es completamente estática por ahora,
 * pero está preparada para integrarse con datos dinámicos desde API.
 * 
 * @package AP_Restaurante
 * @subpackage HomePage.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/homepage-scoped.css';
import PublicNav from '../components/PublicNav';
import { PLACEHOLDERS, APP_TEXT } from '../config/constants';

const HomePage = () => {

  /**
   * Estado para detectar scroll y modificar header
   */
  const [isScrolled, setIsScrolled] = useState(false);

  /**
   * Hook de navegación
   */
  const navigate = useNavigate();

  /**
   * Efecto para detectar el scroll y aplicar estilos dinámicos al header
   */
  useEffect(() => {
    const header = document.getElementById('main-header');
    const heroSection = document.querySelector('.hero');

    const handleScroll = () => {
      if (!heroSection) return;
      
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollPosition >= heroBottom) {
        setIsScrolled(true);
        if (header) header.classList.add('scrolled');
      } else {
        setIsScrolled(false);
        if (header) header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="homepage-wrapper">

      {/* Navegación pública */}
      <PublicNav />

      {/* Sección principal (Hero) */}
      <section className="hero">
        <h1 className="animate__animated animate__fadeInUp">
          {APP_TEXT.BRAND_NAME}
        </h1>
      </section>

      {/* Sección de presentación */}
      <section className="presentacion">
        <div>
          <h2>Presentación</h2>
          <p>Body text for your whole article or post...</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div>
          <img
            src={PLACEHOLDERS.DISH.LARGE}
            alt="Plato destacado del restaurante"
          />
        </div>
      </section>

      {/* Sección de productos destacados */}
      <section className="principales-comidas">
        <h2>Principales comidas</h2>

        <div className="comidas-grid">
          <article>
            <img src={PLACEHOLDERS.PRODUCT.MEDIUM} alt="Sushi" />
            <h3>Subtitulo</h3>
            <p>Descripcion general de producto</p>
          </article>

          <article>
            <img src={PLACEHOLDERS.PRODUCT.MEDIUM} alt="Carne" />
            <h3>Subtitulo</h3>
            <p>Descripcion general de producto</p>
          </article>

          <article>
            <img src={PLACEHOLDERS.PRODUCT.MEDIUM} alt="Alitas" />
            <h3>Subtitulo</h3>
            <p>Descripcion general de producto</p>
          </article>
        </div>

        {/* Botón para navegar al menú */}
        <button type="button" onClick={() => navigate('/menu')}>
          ¡Conoce todo el menú!
        </button>
      </section>

      {/* Información del negocio */}
      <section className="informacion-negocio">
        <div className="horarios-visitanos">

          {/* Horarios */}
          <div className="horarios-container">
            <h2>Horarios de atención</h2>

            <div className="horarios-lista">
              <div className="horario-item"><span>LUNES</span><span>10:00 A 19:00 HS</span></div>
              <div className="horario-item"><span>MARTES</span><span>10:00 A 19:00 HS</span></div>
              <div className="horario-item"><span>MIÉRCOLES</span><span>10:00 A 19:00 HS</span></div>
              <div className="horario-item"><span>JUEVES</span><span>10:00 A 19:00 HS</span></div>
              <div className="horario-item"><span>VIERNES</span><span>10:00 A 19:00 HS</span></div>
              <div className="horario-item"><span>SÁBADO</span><span>10:00 A 19:00 HS</span></div>
              <div className="horario-item"><span>DOMINGO</span><span>CERRADO</span></div>
            </div>
          </div>

          {/* Imagen del restaurante */}
          <div className="imagen-container">
            <img
              src={PLACEHOLDERS.RESTAURANT.MEDIUM}
              alt="Imagen del restaurante"
            />
          </div>

          {/* Sección de ubicación */}
          <div className="visitanos-container">
            <div>
              <h2>¡Visítanos!</h2>
              <p>Encuéntranos en..</p>
              <p>Dirección...</p>
            </div>

            <button type="button">
              Como llegar
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <h2>Sigue las ultimas novedades</h2>
        <p>daily</p>
      </section>

    </div>
  );
};

export default HomePage;