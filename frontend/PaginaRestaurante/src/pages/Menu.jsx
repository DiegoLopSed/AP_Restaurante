/**
 * Menu.jsx
 * 
 * Página pública del menú del restaurante.
 * 
 * Funcionalidades principales:
 * - Carga dinámica de categorías y productos desde API
 * - Filtrado de productos por categoría
 * - Visualización en grid de platillos disponibles
 * - Manejo de estados: carga, error y vacío
 * - Navegación de regreso a la página principal
 * 
 * Características:
 * - Solo muestra productos activos (estatus = 1)
 * - Incluye categoría "Todo" para ver todos los productos
 * - Uso de imágenes dinámicas o placeholders
 * - Renderizado optimizado con useMemo
 * 
 * Integraciones:
 * - fetchCategorias(): obtiene categorías del sistema
 * - fetchProductos(): obtiene productos del sistema
 * - apiClient: resuelve rutas de imágenes desde backend
 * 
 *
 * 
 * @package AP_Restaurante
 * @subpackage Menu.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/homepage-scoped.css';
import PublicNav from '../components/PublicNav';
import { PLACEHOLDERS } from '../config/constants';
import { apiClient } from '../services/apiClient';
import { fetchCategorias } from '../services/categorias';
import { fetchProductos } from '../services/productos';

export default function Menu() {

  /**
   * Estado del filtro de categorías
   */
  const [filter, setFilter] = useState('todo');

  /**
   * Estados de datos
   */
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  /**
   * Estados de control
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Navegación entre rutas
   */
  const navigate = useNavigate();

  /**
   * Carga inicial de datos
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [cats, prods] = await Promise.all([
          fetchCategorias(),
          fetchProductos()
        ]);

        setCategorias(cats);

        // Filtrar solo productos activos
        setProductos(
          prods.filter((p) => Number(p.estatus) === 1)
        );

      } catch (e) {
        setError(e?.message || 'Error al cargar el menú');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Categorías con opción "Todo"
   */
  const categoriasConTodo = useMemo(() => {
    const categoriasProducto = categorias.filter(
      (cat) =>
        !cat.tipo_categoria ||
        String(cat.tipo_categoria).toLowerCase() === 'producto'
    );

    const categoriasMapeadas = categoriasProducto.map((cat) => ({
      id: String(cat.id_categoria),
      nombre: cat.nombre,
    }));

    return [
      { id: 'todo', nombre: 'Todo' },
      ...categoriasMapeadas
    ];
  }, [categorias]);

  /**
   * Productos filtrados según categoría seleccionada
   */
  const filteredItems = useMemo(() => {
    return productos.filter(
      (item) =>
        filter === 'todo' ||
        String(item.id_categoria) === String(filter)
    );
  }, [filter, productos]);

  return (
    <>
      {/* Navegación pública */}
      <PublicNav />

      <main className="menu-main">

        {/* Título */}
        <h1 className="menu-title">Menú</h1>

        {/* Mensaje de error */}
        {error && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        {/* Filtros por categoría */}
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

        {/* Sección de productos */}
        <section className="menu-section">

          <h2 className="menu-section-title">
            {filter === 'todo'
              ? 'Platillos destacados'
              : 'Platillos'}
          </h2>

          <div className="menu-grid">

            {/* Estado de carga */}
            {loading ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                Cargando platillos...
              </p>

            /* Estado vacío */
            ) : filteredItems.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                No hay productos disponibles en esta categoría.
              </p>

            /* Render de productos */
            ) : (
              filteredItems.map((item) => (
                <article
                  key={item.id_producto}
                  className="menu-item"
                  data-category={item.id_categoria}
                >
                  {/* Imagen */}
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

                  {/* Contenido */}
                  <div className="menu-item-content">
                    <h3 className="menu-item-title">
                      {item.nombre}
                    </h3>

                    {item.descripcion && (
                      <p className="menu-item-description">
                        {item.descripcion}
                      </p>
                    )}

                    <div className="menu-item-price">
                      ${Number(item.precio).toFixed(2)}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Call to Action */}
          <div className="menu-cta">
            <p className="menu-cta-text">
              ¡Explora nuestros principales platillos!
            </p>

            <button
              className="menu-cta-button"
              type="button"
              onClick={() => navigate('/')}
            >
              <span>→</span>
            </button>
          </div>

        </section>
      </main>
    </>
  );
}