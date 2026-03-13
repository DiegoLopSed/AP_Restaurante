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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    id_categoria: '',
    stock: 0,
    fecha_ultimo_pedido: ''
  });

  const columns = useMemo(
    () => [
      { key: 'id_insumo', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { 
        key: 'categoria', 
        label: 'Categoría',
        render: (value, row) => {
          const categoria = categorias.find(c => c.id_categoria === row.id_categoria);
          return categoria?.nombre || 'N/A';
        }
      },
      { key: 'stock', label: 'Stock' },
      { 
        key: 'fecha_ultimo_pedido', 
        label: 'Último Pedido',
        render: (value) => value ? new Date(value).toLocaleDateString('es-ES') : 'N/A'
      },
      {
        key: 'actions',
        label: 'Acciones',
        render: (value, row) => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleEdit(row)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Editar"
            >
              <PencilIcon style={{ width: '18px', height: '18px' }} />
            </button>
            <button
              onClick={() => handleDelete(row.id_insumo)}
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
    [categorias]
  );

  useEffect(() => {
    loadData();
  }, []);

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

  const handleEdit = (insumo) => {
    setEditingInsumo(insumo);
    setFormData({
      nombre: insumo.nombre || '',
      id_categoria: insumo.id_categoria || '',
      stock: insumo.stock || 0,
      fecha_ultimo_pedido: insumo.fecha_ultimo_pedido ? insumo.fecha_ultimo_pedido.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        nombre: formData.nombre,
        id_categoria: parseInt(formData.id_categoria),
        stock: parseInt(formData.stock) || 0,
        fecha_ultimo_pedido: formData.fecha_ultimo_pedido || null
      };

      if (editingInsumo) {
        await updateInsumo(editingInsumo.id_insumo, data);
      } else {
        await createInsumo(data);
      }
      
      setIsModalOpen(false);
      setEditingInsumo(null);
      setFormData({ nombre: '', id_categoria: '', stock: 0, fecha_ultimo_pedido: '' });
      await loadData();
    } catch (err) {
      alert(err?.message || 'Error al guardar insumo');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className={styles.greeting}>Gestión de Insumos</h1>
        <button
          onClick={() => {
            setEditingInsumo(null);
            setFormData({ nombre: '', id_categoria: '', stock: 0, fecha_ultimo_pedido: '' });
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
          Agregar Insumo
        </button>
      </div>

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

      <div className={styles.contentSection}>
        <Table 
          columns={columns} 
          data={insumos}
          emptyMessage={loading ? 'Cargando insumos...' : 'No hay insumos registrados'}
        />
      </div>

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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px' }}>
              {editingInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Categoría *
                </label>
                <select
                  required
                  value={formData.id_categoria}
                  onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Fecha Último Pedido
                </label>
                <input
                  type="date"
                  value={formData.fecha_ultimo_pedido}
                  onChange={(e) => setFormData({ ...formData, fecha_ultimo_pedido: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingInsumo(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insumos;

