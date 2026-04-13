/**
 * Productos.jsx
 * 
 * Componente para la gestión de productos dentro del panel de administración.
 * 
 * Funcionalidades principales:
 * - Visualización de productos en tabla
 * - Carga de categorías e insumos desde la API
 * - Creación de nuevos productos con selección de insumos
 * - Modal para agregar productos
 * - Modal para ver detalle de producto
 * - Asociación de insumos con cantidad y unidad de medida
 * 
 * Características:
 * - Uso de hooks (useState, useEffect, useMemo)
 * - Manejo de estados de carga y guardado
 * - Validaciones básicas en formulario
 * - Renderizado dinámico de tablas
 * 
 * Nota:
 * Este componente está conectado a servicios API reales para:
 * - Productos
 * - Categorías
 * - Insumos
 * 
 * @package AP_Restaurante
 * @subpackage Productos.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import { useEffect, useMemo, useState } from 'react';
import styles from '../../assets/css/ManagerDashboard.module.css';
import Table from '../../components/Table';
import { fetchCategorias } from '../../services/categorias';
import { fetchInsumos } from '../../services/insumos';
import { createProducto, fetchProductoById, fetchProductos } from '../../services/productos';
import { apiClient } from '../../services/apiClient';
import { getPlaceholder } from '../../config/constants';
import { PlusIcon } from '@heroicons/react/24/outline';

const ManagerProductos = () => {

  /**
   * Estados principales del componente
   */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /**
   * Datos principales
   */
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [insumos, setInsumos] = useState([]);

  /**
   * Estados de modales
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  /**
   * Detalle de producto seleccionado
   */
  const [detalleProducto, setDetalleProducto] = useState(null);

  /**
   * Insumos seleccionados para el producto
   */
  const [selectedInsumos, setSelectedInsumos] = useState([]);

  /**
   * Estado del formulario de creación
   */
  const [form, setForm] = useState({
    id_categoria: '',
    nombre: '',
    descripcion: '',
    precio: '',
    estatus: 1,
  });

  /**
   * Definición de columnas para la tabla de productos
   */
  const columns = useMemo(() => [
    { key: 'nombre', label: 'Nombre' },
    {
      key: 'categoria',
      label: 'Categoría',
      render: (value, row) => {
        const cat = categorias.find((c) => c.id_categoria === row.id_categoria);
        return cat?.nombre || 'N/A';
      },
    },
    {
      key: 'precio',
      label: 'Precio',
      render: (value, row) => `$${Number(row.precio).toFixed(2)}`,
    },
    {
      key: 'estatus',
      label: 'Estatus',
      render: (value) => (Number(value) === 1 ? 'Activo' : 'Inactivo'),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (value, row) => (
        <button onClick={() => handleVerDetalle(row.id_producto)}>
          Ver detalle
        </button>
      ),
    },
  ], [categorias]);

  /**
   * useEffect para carga inicial de datos
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Carga productos, categorías e insumos desde la API
   */
  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [prods, cats, ins] = await Promise.all([
        fetchProductos(),
        fetchCategorias(),
        fetchInsumos(),
      ]);
      setProductos(prods);
      setCategorias(cats);
      setInsumos(ins);
    } catch (e) {
      setError(e?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Maneja cambios en inputs del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Obtiene y muestra el detalle de un producto
   */
  const handleVerDetalle = async (idProducto) => {
    try {
      setLoading(true);
      const data = await fetchProductoById(idProducto);
      setDetalleProducto(data);
      setDetailModalOpen(true);
    } catch (e) {
      alert('Error al obtener detalle');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agrega o elimina un insumo seleccionado
   */
  const handleToggleInsumo = (insumo) => {
    setSelectedInsumos((prev) => {
      const exists = prev.find((i) => i.id_insumo === insumo.id_insumo);
      if (exists) {
        return prev.filter((i) => i.id_insumo !== insumo.id_insumo);
      }
      return [...prev, {
        id_insumo: insumo.id_insumo,
        cantidad: 1,
        unidad_medida: '',
      }];
    });
  };

  /**
   * Actualiza cantidad o unidad de un insumo
   */
  const handleInsumoDetailChange = (id, field, value) => {
    setSelectedInsumos((prev) =>
      prev.map((item) =>
        item.id_insumo === id
          ? { ...item, [field]: field === 'cantidad' ? Number(value) : value }
          : item
      )
    );
  };

  /**
   * Reinicia el formulario
   */
  const resetForm = () => {
    setForm({
      id_categoria: '',
      nombre: '',
      descripcion: '',
      precio: '',
      estatus: 1,
    });
    setSelectedInsumos([]);
  };

  /**
   * Envía el formulario para crear un producto
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_categoria || !form.nombre || !form.precio) {
      alert('Campos obligatorios faltantes');
      return;
    }

    if (selectedInsumos.length === 0) {
      alert('Debe seleccionar insumos');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id_categoria: Number(form.id_categoria),
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precio: Number(form.precio),
        estatus: Number(form.estatus),
        insumos: selectedInsumos,
      };

      await createProducto(payload);
      resetForm();
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      alert('Error al crear producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* UI omitida por brevedad */}
    </div>
  );
};

export default ManagerProductos;