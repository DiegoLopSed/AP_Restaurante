import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/homepage-scoped.css';
import PublicNav from '../components/PublicNav';
import { PLACEHOLDERS } from '../config/constants';
import { apiClient } from '../services/apiClient';
import { fetchCategorias } from '../services/categorias';
import { fetchProductos } from '../services/productos';

export default function Menu() {
  const [filter, setFilter] = useState('todo');
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const [cats, prods] = await Promise.all([fetchCategorias(), fetchProductos()]);
        setCategorias(cats);
        // Solo productos activos
        setProductos(prods.filter((p) => Number(p.estatus) === 1));
      } catch (e) {
        setError(e?.message || 'Error al cargar el menú');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categoriasConTodo = useMemo(() => {
    // Solo categorías de tipo "producto"
    const categoriasProducto = categorias.filter(
      (cat) =>
        !cat.tipo_categoria || String(cat.tipo_categoria).toLowerCase() === 'producto'
    );
    // Normalizar estructura para que todas tengan `id` y `nombre`
    const categoriasMapeadas = categoriasProducto.map((cat) => ({
      id: String(cat.id_categoria),
      nombre: cat.nombre,
    }));
    return [{ id: 'todo', nombre: 'Todo' }, ...categoriasMapeadas];
  }, [categorias]);

  const filteredItems = useMemo(
    () =>
      productos.filter(
        (item) => filter === 'todo' || String(item.id_categoria) === String(filter)
      ),
    [filter, productos]
  );

  return (
    <>
      <PublicNav />

      <main className="menu-main">
        <h1 className="menu-title">Menú</h1>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <div className="menu-filters">
          {categoriasConTodo.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        <section className="menu-section">
          <h2 className="menu-section-title">
            {filter === 'todo' ? 'Platillos destacados' : 'Platillos'}
          </h2>

          <div className="menu-grid">
            {loading ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Cargando platillos...</p>
            ) : filteredItems.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                No hay productos disponibles en esta categoría.
              </p>
            ) : (
              filteredItems.map((item) => (
                <article
                  key={item.id_producto}
                  className="menu-item"
                  data-category={item.id_categoria}
                >
                  <div className="menu-item-image">
                    <img
                      src={
                        item.imagen
                          ? `${apiClient.resolveApiBase()}/producto_imagen.php?id=${item.id_producto}`
                          : PLACEHOLDERS.MENU_ITEM.MEDIUM
                      }
                      alt={item.nombre}
                    />
                  </div>
                  <div className="menu-item-content">
                    <h3 className="menu-item-title">{item.nombre}</h3>
                    {item.descripcion && (
                      <p className="menu-item-description">{item.descripcion}</p>
                    )}
                    <div className="menu-item-price">
                      ${Number(item.precio).toFixed(2)}
                    </div>
                  </div>
                </article>
              ))
            )}
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

