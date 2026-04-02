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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detalleProducto, setDetalleProducto] = useState(null);
  const [selectedInsumos, setSelectedInsumos] = useState([]);

  const [form, setForm] = useState({
    id_categoria: '',
    nombre: '',
    descripcion: '',
    precio: '',
    estatus: 1,
  });

  const columns = useMemo(
    () => [
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
          <button
            type="button"
            onClick={() => handleVerDetalle(row.id_producto)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Ver detalle
          </button>
        ),
      },
    ],
    [categorias]
  );

  useEffect(() => {
    loadData();
  }, []);

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
      setError(e?.message || 'Error al cargar datos de productos');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVerDetalle = async (idProducto) => {
    try {
      setLoading(true);
      const data = await fetchProductoById(idProducto);
      setDetalleProducto(data);
      setDetailModalOpen(true);
    } catch (e) {
      alert(e?.message || 'No se pudo obtener el detalle del producto');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInsumo = (insumo) => {
    setSelectedInsumos((prev) => {
      const exists = prev.find((i) => i.id_insumo === insumo.id_insumo);
      if (exists) {
        return prev.filter((i) => i.id_insumo !== insumo.id_insumo);
      }
      return [
        ...prev,
        {
          id_insumo: insumo.id_insumo,
          cantidad: 1,
          unidad_medida: '',
        },
      ];
    });
  };

  const handleInsumoDetailChange = (id_insumo, field, value) => {
    setSelectedInsumos((prev) =>
      prev.map((item) =>
        item.id_insumo === id_insumo
          ? {
              ...item,
              [field]: field === 'cantidad' ? Number(value) : value,
            }
          : item
      )
    );
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_categoria || !form.nombre || !form.precio) {
      alert('Categoría, nombre y precio son obligatorios');
      return;
    }
    if (selectedInsumos.length === 0) {
      alert('Debe seleccionar al menos un insumo');
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
        insumos: selectedInsumos.map((ins) => ({
          id_insumo: ins.id_insumo,
          cantidad: Number(ins.cantidad) || 1,
          unidad_medida: ins.unidad_medida || null,
        })),
      };

      await createProducto(payload);
      resetForm();
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      alert(e?.message || 'No se pudo crear el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 className={styles.greeting}>Gestión de Productos</h1>
        <button
          onClick={() => {
            resetForm();
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
            fontWeight: '600',
          }}
        >
          <PlusIcon style={{ width: '20px', height: '20px' }} />
          Agregar Producto
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '12px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      <div className={styles.contentSection}>
        <Table
          columns={columns}
          data={productos}
          rowKey="id_producto"
          emptyMessage={loading ? 'Cargando productos...' : 'No hay productos registrados'}
        />
      </div>

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              width: '95%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <h2 style={{ marginBottom: '20px' }}>Nuevo Producto</h2>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.8fr',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label
                      style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}
                    >
                      Categoría *
                    </label>
                    <select
                      name="id_categoria"
                      value={form.id_categoria}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label
                      style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}
                    >
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label
                      style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}
                    >
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label
                      style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}
                    >
                      Precio *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="precio"
                      value={form.precio}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label
                      style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}
                    >
                      Estatus
                    </label>
                    <select
                      name="estatus"
                      value={form.estatus}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <h3 style={{ marginBottom: '8px' }}>Insumos del producto</h3>
              <p style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#6b7280' }}>
                Selecciona los insumos que componen el producto y define la cantidad y unidad de
                medida.
              </p>

              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  marginBottom: '20px',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Usar</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Nombre</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Categoría</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Stock</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Cantidad</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumos.map((insumo) => {
                      const seleccionado = selectedInsumos.find(
                        (i) => i.id_insumo === insumo.id_insumo
                      );
                      return (
                        <tr key={insumo.id_insumo} style={{ borderTop: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="checkbox"
                              checked={!!seleccionado}
                              onChange={() => handleToggleInsumo(insumo)}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>{insumo.nombre}</td>
                          <td style={{ padding: '6px 8px' }}>{insumo.categoria_nombre}</td>
                          <td style={{ padding: '6px 8px' }}>{insumo.stock}</td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={!seleccionado}
                              value={seleccionado?.cantidad ?? ''}
                              onChange={(e) =>
                                handleInsumoDetailChange(
                                  insumo.id_insumo,
                                  'cantidad',
                                  e.target.value
                                )
                              }
                              style={{
                                width: '80px',
                                padding: '4px 6px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                              }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              maxLength={50}
                              disabled={!seleccionado}
                              value={seleccionado?.unidad_medida ?? ''}
                              onChange={(e) =>
                                handleInsumoDetailChange(
                                  insumo.id_insumo,
                                  'unidad_medida',
                                  e.target.value
                                )
                              }
                              placeholder="ej. kg, pieza"
                              style={{
                                width: '100%',
                                padding: '4px 6px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                    {insumos.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '12px', textAlign: 'center' }}>
                          No hay insumos registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailModalOpen && detalleProducto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              width: '95%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2 style={{ margin: 0 }}>{detalleProducto.nombre}</h2>
              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false);
                  setDetalleProducto(null);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Cerrar
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr',
                gap: '20px',
                marginBottom: '16px',
              }}
            >
              <div>
                <img
                  src={
                    detalleProducto.imagen
                      ? `${apiClient.resolveApiBase()}/producto_imagen.php?id=${detalleProducto.id_producto}`
                      : getPlaceholder('PRODUCT', 'MEDIUM')
                  }
                  alt={detalleProducto.nombre}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #e5e7eb',
                  }}
                />
              </div>

              <div>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Categoría:</strong>{' '}
                  {detalleProducto.categoria_nombre || 'Sin categoría'}
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Precio:</strong> ${Number(detalleProducto.precio).toFixed(2)}
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Estatus:</strong>{' '}
                  {Number(detalleProducto.estatus) === 1 ? 'Activo' : 'Inactivo'}
                </p>
                {detalleProducto.descripcion && (
                  <p style={{ marginTop: '12px' }}>
                    <strong>Descripción:</strong> {detalleProducto.descripcion}
                  </p>
                )}
              </div>
            </div>

            <h3 style={{ marginBottom: '8px' }}>Lista de ingredientes</h3>
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                maxHeight: '260px',
                overflowY: 'auto',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Ingrediente</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Insumo base</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Cantidad</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {(detalleProducto.ingredientes || []).map((ing) => (
                    <tr key={ing.id_ingrediente} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '6px 8px' }}>
                        {ing.ingrediente_nombre || ing.insumo_nombre}
                      </td>
                      <td style={{ padding: '6px 8px' }}>{ing.insumo_nombre}</td>
                      <td style={{ padding: '6px 8px' }}>{ing.cantidad}</td>
                      <td style={{ padding: '6px 8px' }}>{ing.unidad_medida || '-'}</td>
                    </tr>
                  ))}
                  {(!detalleProducto.ingredientes ||
                    detalleProducto.ingredientes.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: '12px', textAlign: 'center' }}>
                        No hay ingredientes registrados para este producto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerProductos;


