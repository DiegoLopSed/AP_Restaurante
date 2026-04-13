/**
 * Categorias.jsx
 * 
 * Componente para la gestión de categorías en el panel de administrador.
 * 
 * Permite realizar operaciones CRUD:
 * - Crear categorías
 * - Leer (listar) categorías
 * - Actualizar categorías
 * - Eliminar categorías
 * 
 * Funcionalidades principales:
 * - Consumo de API (categorías)
 * - Renderizado de tabla dinámica
 * - Modal para crear/editar categorías
 * - Manejo de estados (loading, error)
 * - Confirmación antes de eliminar
 *  @package AP_Restaurante
 * @subpackage Categorias.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import styles from '../../assets/css/ManagerDashboard.module.css';
import Table from '../../components/Table';
import { 
  fetchCategorias, 
  createCategoria, 
  updateCategoria, 
  deleteCategoria 
} from '../../services/categorias';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Categorias = () => {

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo_categoria: 'producto',
  });

  /**
   * Definición de columnas para la tabla
   * useMemo optimiza el render
   */
  const columns = useMemo(
    () => [
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' },

      {
        key: 'actions',
        label: 'Acciones',
        render: (value, row) => (
          <div style={{ display: 'flex', gap: '8px' }}>

            {/* Botón editar */}
            <button
              onClick={() => handleEdit(row)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              aria-label="Editar"
            >
              <PencilIcon style={{ width: '18px', height: '18px' }} />
            </button>

            {/* Botón eliminar */}
            <button
              onClick={() => handleDelete(row.id_categoria)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#dc2626'
              }}
              aria-label="Eliminar"
            >
              <TrashIcon style={{ width: '18px', height: '18px' }} />
            </button>

          </div>
        )
      }
    ],
    []
  );

  /**
   * Carga inicial de datos
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Obtiene las categorías desde la API
   */
  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const data = await fetchCategorias();
      setCategorias(data);
    } catch (err) {
      setError(err?.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Abre el modal en modo edición
   */
  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);

    setFormData({
      nombre: categoria.nombre || '',
      descripcion: categoria.descripcion || '',
      tipo_categoria: categoria.tipo_categoria || 'producto',
    });

    setIsModalOpen(true);
  };

  /**
   * Elimina una categoría
   */
  const handleDelete = async (id) => {

    // Confirmación antes de eliminar
    if (!window.confirm('¿Está seguro de que desea eliminar esta categoría?')) {
      return;
    }

    try {
      await deleteCategoria(id);
      await loadData(); // recarga datos
    } catch (err) {
      alert(err?.message || 'Error al eliminar categoría');
    }
  };

  /**
   * Maneja el envío del formulario (crear o editar)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        tipo_categoria: formData.tipo_categoria || 'producto',
      };

      if (editingCategoria) {
        // Actualizar
        await updateCategoria(editingCategoria.id_categoria, data);
      } else {
        // Crear
        await createCategoria(data);
      }

      // Reset de estado
      setIsModalOpen(false);
      setEditingCategoria(null);
      setFormData({ nombre: '', descripcion: '', tipo_categoria: 'producto' });

      await loadData();

    } catch (err) {
      alert(err?.message || 'Error al guardar categoría');
    }
  };

  return (
    <div className={styles.dashboard}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className={styles.greeting}>Gestión de Categorías</h1>

        {/* Botón crear */}
        <button
          onClick={() => {
            setEditingCategoria(null);
            setFormData({ nombre: '', descripcion: '', tipo_categoria: 'producto' });
            setIsModalOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <PlusIcon style={{ width: '20px', height: '20px' }} />
          Agregar Categoría
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px',
          background: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className={styles.contentSection}>
        <Table
          columns={columns}
          data={categorias}
          rowKey="id_categoria"
          emptyMessage={loading ? 'Cargando categorías...' : 'No hay categorías registradas'}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2>
              {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              {/* Inputs aquí */}
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Categorias;