import { useState, useEffect, useMemo } from 'react';
import styles from '../../assets/css/ManagerDashboard.module.css';
import Table from '../../components/Table';
import { 
  fetchUsuarios, 
  createUsuario, 
  updateUsuario, 
  deleteUsuario 
} from '../../services/usuarios';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Usuarios = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rfc: '',
    curp: '',
    correo: '',
    telefono: '',
    contrasena: ''
  });

  const columns = useMemo(
    () => [
      { key: 'id_registro', label: 'ID' },
      { 
        key: 'nombreCompleto', 
        label: 'Nombre Completo',
        render: (value, row) => `${row.nombre || ''} ${row.apellido || ''}`.trim()
      },
      { key: 'rfc', label: 'RFC' },
      { key: 'curp', label: 'CURP' },
      { key: 'correo', label: 'Correo' },
      { key: 'telefono', label: 'Teléfono' },
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
              onClick={() => handleDelete(row.id_registro)}
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
      const data = await fetchUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      rfc: usuario.rfc || '',
      curp: usuario.curp || '',
      correo: usuario.correo || '',
      telefono: usuario.telefono || '',
      contrasena: '' // No mostrar contraseña
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return;
    }
    try {
      await deleteUsuario(id);
      await loadData();
    } catch (err) {
      alert(err?.message || 'Error al eliminar usuario');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        rfc: formData.rfc,
        curp: formData.curp,
        correo: formData.correo,
        telefono: formData.telefono
      };

      // Solo incluir contraseña si es nuevo usuario o si se proporcionó
      if (!editingUsuario || formData.contrasena) {
        data.contrasena = formData.contrasena;
      }

      if (editingUsuario) {
        await updateUsuario(editingUsuario.id_registro, data);
      } else {
        if (!formData.contrasena) {
          alert('La contraseña es requerida para nuevos usuarios');
          return;
        }
        await createUsuario(data);
      }
      
      setIsModalOpen(false);
      setEditingUsuario(null);
      setFormData({ 
        nombre: '', 
        apellido: '', 
        rfc: '', 
        curp: '', 
        correo: '', 
        telefono: '', 
        contrasena: '' 
      });
      await loadData();
    } catch (err) {
      alert(err?.message || 'Error al guardar usuario');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className={styles.greeting}>Gestión de Usuarios</h1>
        <button
          onClick={() => {
            setEditingUsuario(null);
            setFormData({ 
              nombre: '', 
              apellido: '', 
              rfc: '', 
              curp: '', 
              correo: '', 
              telefono: '', 
              contrasena: '' 
            });
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
          Agregar Usuario
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
          data={usuarios}
          emptyMessage={loading ? 'Cargando usuarios...' : 'No hay usuarios registrados'}
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px' }}>
              {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
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
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    RFC *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    CURP *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.curp}
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Correo *
                </label>
                <input
                  type="email"
                  required
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
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
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
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
                  Contraseña {editingUsuario ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingUsuario}
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
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
                    setEditingUsuario(null);
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

export default Usuarios;

