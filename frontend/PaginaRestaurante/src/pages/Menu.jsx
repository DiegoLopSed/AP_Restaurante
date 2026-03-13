import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/homepage-scoped.css';
import PublicNav from '../components/PublicNav';
import { PLACEHOLDERS } from '../config/constants';

const CATEGORIES = [
  { id: 'todo', label: 'Todo' },
  { id: 'entradas', label: 'Entradas' },
  { id: 'platos-fuertes', label: 'Platos fuertes' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'postres', label: 'Postres' },
];

const ITEMS = [
  {
    id: 1,
    nombre: 'Classic',
    descripcion: 'Bebida clásica de la casa con notas tostadas.',
    precio: 10,
    categoria: 'bebidas',
  },
  {
    id: 2,
    nombre: 'Vanilla Bean Larem',
    descripcion: 'Suave combinación de vainilla y crema.',
    precio: 8,
    categoria: 'bebidas',
  },
  {
    id: 3,
    nombre: 'Spiced Chai',
    descripcion: 'Mezcla de especias aromáticas y té negro.',
    precio: 9,
    categoria: 'bebidas',
  },
  {
    id: 4,
    nombre: 'Cold Brew Concentrat',
    descripcion: 'Concentrado frío, intenso y refrescante.',
    precio: 6,
    categoria: 'bebidas',
  },
  {
    id: 5,
    nombre: 'Cappuccino',
    descripcion: 'Clásico cappuccino con espuma cremosa.',
    precio: 5,
    categoria: 'bebidas',
  },
  {
    id: 6,
    nombre: 'Mocha Swirl',
    descripcion: 'Chocolate y café en una mezcla perfecta.',
    precio: 7,
    categoria: 'bebidas',
  },
  {
    id: 7,
    nombre: 'Entrada de la casa',
    descripcion: 'Selección de bocadillos para compartir.',
    precio: 12,
    categoria: 'entradas',
  },
  {
    id: 8,
    nombre: 'Plato fuerte especial',
    descripcion: 'Corte de carne con guarnición de temporada.',
    precio: 22,
    categoria: 'platos-fuertes',
  },
  {
    id: 9,
    nombre: 'Postre del día',
    descripcion: 'Sugerencia dulce del chef.',
    precio: 9,
    categoria: 'postres',
  },
];

export default function Menu() {
  const [filter, setFilter] = useState('todo');
  const navigate = useNavigate();

  const filteredItems = useMemo(
    () =>
      ITEMS.filter((item) => filter === 'todo' || item.categoria === filter),
    [filter]
  );

  return (
    <>
      <PublicNav />

      <main className="menu-main">
        <h1 className="menu-title">Menú</h1>

        <div className="menu-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <section className="menu-section">
          <h2 className="menu-section-title">
            {filter === 'todo' ? 'Más vendidos' : 'Platillos'}
          </h2>

          <div className="menu-grid">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="menu-item"
                data-category={item.categoria}
              >
                <div className="menu-item-image">
                  <img src={PLACEHOLDERS.MENU_ITEM.MEDIUM} alt={item.nombre} />
                </div>
                <div className="menu-item-content">
                  <h3 className="menu-item-title">{item.nombre}</h3>
                  <p className="menu-item-description">{item.descripcion}</p>
                  <div className="menu-item-price">${item.precio}</div>
                </div>
              </article>
            ))}
          </div>

          <div className="menu-cta">
            <p className="menu-cta-text">Explora nuestros principales platillos!</p>
            <button className="menu-cta-button" type="button" onClick={() => navigate('/')}>
              <span>→</span>
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

