import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/homepage-scoped.css';
import PublicNav from '../components/PublicNav';
import { PLACEHOLDERS, APP_TEXT } from '../config/constants';

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

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
    handleScroll(); // Verificar posición inicial

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="homepage-wrapper">
      {/* Encabezado y Navegación */}
      <PublicNav />

      {/* Sección Hero */}
      <section className="hero">
        <h1 className="animate__animated animate__fadeInUp">{APP_TEXT.BRAND_NAME}</h1>
      </section>

      {/* Sección de Presentación */}
      <section className="presentacion">
        <div>
          <h2>Presentación</h2>
          <p>Body text for your whole article or post...</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        </div>
        <div>
          <img src={PLACEHOLDERS.DISH.LARGE} alt="Plato destacado del restaurante" />
        </div>
      </section>

      {/* Sección de Principales Comidas */}
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
        <button type="button" onClick={() => navigate('/menu')}>¡Conoce todo el menú!</button>
      </section>

      {/* Sección de Información del Negocio */}
      <section className="informacion-negocio">
        <div className="horarios-visitanos">
          <div className="horarios-container">
            <h2>Horarios de atención</h2>
            <div className="horarios-lista">
              <div className="horario-item">
                <span className="dia">LUNES</span>
                <span className="horas">10:00 A 19:00 HS</span>
              </div>
              <div className="horario-item">
                <span className="dia">MARTES</span>
                <span className="horas">10:00 A 19:00 HS</span>
              </div>
              <div className="horario-item">
                <span className="dia">MIÉRCOLES</span>
                <span className="horas">10:00 A 19:00 HS</span>
              </div>
              <div className="horario-item">
                <span className="dia">JUEVES</span>
                <span className="horas">10:00 A 19:00 HS</span>
              </div>
              <div className="horario-item">
                <span className="dia">VIERNES</span>
                <span className="horas">10:00 A 19:00 HS</span>
              </div>
              <div className="horario-item">
                <span className="dia">SÁBADO</span>
                <span className="horas">10:00 A 19:00 HS</span>
              </div>
              <div className="horario-item">
                <span className="dia">DOMINGO</span>
                <span className="horas">CERRADO</span>
              </div>
            </div>
          </div>
          <div className="imagen-container">
            <img src={PLACEHOLDERS.RESTAURANT.MEDIUM} alt="Imagen del restaurante" />
          </div>
          <div className="visitanos-container">
            <div className="visitanos-section">
              <h2>¡Visítanos!</h2>
              <p>Encuéntranos en..</p>
              <p>Dirección...</p>
            </div>
            <button type="button">Como llegar</button>
          </div>
        </div>
      </section>

      {/* Sección de Newsletter/Trends */}
      <section className="newsletter">
        <h2>Sigue las ultimas novedades</h2>
        <p>daily</p>
      </section>

      {/* Pie de Página */}
      <footer>
        <div>
          <p>{APP_TEXT.SITE_NAME}</p>
          <div>
            <a href="#" aria-label="Facebook">F</a>
            <a href="#" aria-label="LinkedIn">In</a>
            <a href="#" aria-label="YouTube">YT</a>
            <a href="#" aria-label="Instagram">IG</a>
          </div>
        </div>
        <div>
          <div>
            <h4>Tema</h4>
            <ul>
              <li><a href="#">Página</a></li>
              <li><a href="#">Página</a></li>
              <li><a href="#">Página</a></li>
            </ul>
          </div>
          <div>
            <h4>Tema</h4>
            <ul>
              <li><a href="#">Página</a></li>
              <li><a href="#">Página</a></li>
              <li><a href="#">Página</a></li>
            </ul>
          </div>
          <div>
            <h4>Tema</h4>
            <ul>
              <li><a href="#">Página</a></li>
              <li><a href="#">Página</a></li>
              <li><a href="#">Página</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

