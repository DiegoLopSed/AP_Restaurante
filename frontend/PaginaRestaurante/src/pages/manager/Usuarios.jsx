import { useState, useEffect, useMemo } from 'react';
import styles from '../../assets/css/ManagerDashboard.module.css';
import Table from '../../components/Table';
import { 
  fetchUsuarios, 
  createUsuario, 
  updateUsuario 
} from '../../services/usuarios';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

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
    posicion: 'Mesero',
    contrasena: ''
  });

  const POSICIONES = [
    'Gerente',
    'Administrador',
    'Chef',
    'Cocinero',
    'Ayudante de cocina',
    'Mesero',
    'Repartidor',
    'Cajero',
    'Host',
    'Limpieza',
  ];

  function getNombreCompleto(usuario) {
    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Sin nombre';
  }

  const columns = useMemo(
    () => [
      {
        key: 'nombre',
        label: 'Nombre',
        render: (value, row) => getNombreCompleto(row),
      },
      { key: 'correo', label: 'Correo' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'posicion', label: 'Posición' },
      {
        key: 'actions',
        label: 'Acciones',
        render: (value, row) => (
          <button
            type="button"
            onClick={() => handleEdit(row)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--color-primary, #2563eb)',
              background: 'transparent',
              color: 'var(--color-primary, #2563eb)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            aria-label="Editar"
          >
            <PencilIcon style={{ width: 16, height: 16 }} />
            Editar
          </button>
        ),
      },
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
      posicion: usuario.posicion || 'Mesero',
      contrasena: ''
    });
    setIsModalOpen(true);
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
        telefono: formData.telefono,
        posicion: formData.posicion
      };

      // Solo incluir contraseña si es nuevo usuario o si se proporcionó
      if (!editingUsuario || formData.contrasena) {
        data.contrasena = formData.contrasena;
      }

      if (editingUsuario) {
        await updateUsuario(editingUsuario.id_colaborador, data);
      } else {
        if (!formData.contrasena) {
          alert('La contraseña es requerida para nuevos usuarios');
          return;
        }
        if (!formData.posicion?.trim()) {
          alert('La posición es requerida para nuevos usuarios');
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
        posicion: 'Mesero', 
        contrasena: '' 
      });
      await loadData();
    } catch (err) {
      alert(err?.message || 'Error al guardar usuario');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
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
              posicion: 'Mesero', 
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
          rowKey="id_colaborador"
          emptyMessage={
            loading
              ? 'Cargando usuarios...'
              : 'No hay usuarios registrados. Agrega uno con el botón superior.'
          }
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
          zIndex: 1200
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Posición *
                </label>
                <select
                  required
                  value={formData.posicion}
                  onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Selecciona una posición</option>
                  {POSICIONES.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
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

