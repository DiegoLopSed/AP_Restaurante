/**
 * Insumos.jsx
 * 
 * Componente para la gestión de insumos dentro del panel de administrador.
 * 
 * Funcionalidades principales:
 * - CRUD completo de insumos (crear, leer, actualizar, eliminar)
 * - Relación con categorías
 * - Renderizado en tabla dinámica
 * - Formulario en modal para alta/edición
 * - Manejo de estados (loading, error)
 * - Conversión de tipos de datos (string → number)
 * 
 * Características avanzadas:
 * - Uso de Promise.all para carga paralela de datos
 * - Renderizado dinámico de categorías en tabla
 * - Formateo de fechas
 * @package AP_Restaurante
 * @subpackage Insumos.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import styles from '../../assets/css/ManagerDashboard.module.css';
import Table from '../../components/Table';
import { 
  fetchInsumos, 
  createInsumo, 
  updateInsumo, 
  deleteInsumo 
} from '../../services/insumos';
import { fetchCategorias } from '../../services/categorias';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Insumos = () => {

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    id_categoria: '',
    stock: 0,
    fecha_ultimo_pedido: ''
  });

  /**
   * Definición de columnas para la tabla
   */
  const columns = useMemo(
    () => [
      { key: 'nombre', label: 'Nombre' },

      {
        key: 'categoria',
        label: 'Categoría',

        /**
         * Render personalizado:
         * busca el nombre de la categoría según su ID
         */
        render: (value, row) => {
          const categoria = categorias.find(c => c.id_categoria === row.id_categoria);
          return categoria?.nombre || 'N/A';
        }
      },

      { key: 'stock', label: 'Stock' },

      {
        key: 'fecha_ultimo_pedido',
        label: 'Último Pedido',

        /**
         * Formateo de fecha
         */
        render: (value) =>
          value
            ? new Date(value).toLocaleDateString('es-ES')
            : 'N/A'
      },

      {
        key: 'actions',
        label: 'Acciones',

        /**
         * Botones de edición y eliminación
         */
        render: (value, row) => (
          <div style={{ display: 'flex', gap: '8px' }}>

            <button onClick={() => handleEdit(row)}>
              <PencilIcon style={{ width: '18px' }} />
            </button>

            <button onClick={() => handleDelete(row.id_insumo)}>
              <TrashIcon style={{ width: '18px', color: '#dc2626' }} />
            </button>

          </div>
        )
      }
    ],
    [categorias]
  );

  /**
   * Carga inicial de datos
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Obtiene insumos y categorías en paralelo
   */
  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [insumosData, categoriasData] = await Promise.all([
        fetchInsumos(),
        fetchCategorias()
      ]);

      setInsumos(insumosData);
      setCategorias(categoriasData);

    } catch (err) {
      setError(err?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Editar insumo
   */
  const handleEdit = (insumo) => {
    setEditingInsumo(insumo);

    setFormData({
      nombre: insumo.nombre || '',
      id_categoria: insumo.id_categoria || '',
      stock: insumo.stock || 0,

      // Ajuste de formato de fecha
      fecha_ultimo_pedido: insumo.fecha_ultimo_pedido
        ? insumo.fecha_ultimo_pedido.split('T')[0]
        : ''
    });

    setIsModalOpen(true);
  };

  /**
   * Eliminar insumo
   */
  const handleDelete = async (id) => {

    if (!window.confirm('¿Está seguro de que desea eliminar este insumo?')) {
      return;
    }

    try {
      await deleteInsumo(id);
      await loadData();
    } catch (err) {
      alert(err?.message || 'Error al eliminar insumo');
    }
  };

  /**
   * Crear o actualizar insumo
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        nombre: formData.nombre,

        // Conversión de tipos
        id_categoria: parseInt(formData.id_categoria),
        stock: parseInt(formData.stock) || 0,

        fecha_ultimo_pedido: formData.fecha_ultimo_pedido || null
      };

      if (editingInsumo) {
        await updateInsumo(editingInsumo.id_insumo, data);
      } else {
        await createInsumo(data);
      }

      // Reset
      setIsModalOpen(false);
      setEditingInsumo(null);
      setFormData({
        nombre: '',
        id_categoria: '',
        stock: 0,
        fecha_ultimo_pedido: ''
      });

      await loadData();

    } catch (err) {
      alert(err?.message || 'Error al guardar insumo');
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* UI omitida por brevedad */}
    </div>
  );
};

export default Insumos;