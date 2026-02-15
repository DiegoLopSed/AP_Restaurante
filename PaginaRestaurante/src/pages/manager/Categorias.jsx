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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const columns = useMemo(
    () => [
      { key: 'id_categoria', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' },
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

  useEffect(() => {
    loadData();
  }, []);

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

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre || '',
      descripcion: categoria.descripcion || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta categoría?')) {
      return;
    }
    try {
      await deleteCategoria(id);
      await loadData();
    } catch (err) {
      alert(err?.message || 'Error al eliminar categoría');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null
      };

      if (editingCategoria) {
        await updateCategoria(editingCategoria.id_categoria, data);
      } else {
        await createCategoria(data);
      }
      
      setIsModalOpen(false);
      setEditingCategoria(null);
      setFormData({ nombre: '', descripcion: '' });
      await loadData();
    } catch (err) {
      alert(err?.message || 'Error al guardar categoría');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className={styles.greeting}>Gestión de Categorías</h1>
        <button
          onClick={() => {
            setEditingCategoria(null);
            setFormData({ nombre: '', descripcion: '' });
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
          data={categorias}
          emptyMessage={loading ? 'Cargando categorías...' : 'No hay categorías registradas'}
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
              {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategoria(null);
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

export default Categorias;

