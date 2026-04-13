/**
 * Usuarios.jsx
 * 
 * Componente para la gestión de usuarios (colaboradores) dentro del sistema.
 * 
 * Funcionalidades principales:
 * - Visualización de usuarios en tabla
 * - Creación de nuevos usuarios
 * - Edición de usuarios existentes
 * - Formulario dinámico con validaciones básicas
 * - Selección de rol/posición del usuario
 * 
 * Manejo de estado:
 * - Control de carga de datos
 * - Manejo de errores de API
 * - Control de modal (crear/editar usuario)
 * - Manejo de formulario controlado
 * 
 * Validaciones:
 * - Campos obligatorios (nombre, apellido, RFC, CURP, correo, teléfono, posición)
 * - Contraseña obligatoria solo en creación
 * 
 * Notas:
 * - Utiliza servicios externos para operaciones CRUD
 * - Permite reutilizar el formulario para crear y editar
 * - Convierte RFC y CURP a mayúsculas automáticamente
 * 
 * @package AP_Restaurante
 * @subpackage Usuarios.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

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

  /**
   * Estados principales
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  /**
   * Estados de UI
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  /**
   * Estado del formulario
   */
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

  /**
   * Catálogo de posiciones disponibles
   */
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

  /**
   * Obtiene el nombre completo del usuario
   */
  function getNombreCompleto(usuario) {
    return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Sin nombre';
  }

  /**
   * Definición de columnas para la tabla
   */
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
          >
            <PencilIcon style={{ width: 16, height: 16 }} />
            Editar
          </button>
        ),
      },
    ],
    []
  );

  /**
   * Cargar usuarios al iniciar
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Obtiene los usuarios desde API
   */
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

  /**
   * Maneja edición de usuario
   */
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

  /**
   * Maneja envío del formulario
   */
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

      // Incluir contraseña solo si aplica
      if (!editingUsuario || formData.contrasena) {
        data.contrasena = formData.contrasena;
      }

      if (editingUsuario) {
        await updateUsuario(editingUsuario.id_colaborador, data);
      } else {
        if (!formData.contrasena) {
          alert('La contraseña es obligatoria');
          return;
        }
        await createUsuario(data);
      }

      // Reset
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
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className={styles.greeting}>Gestión de Usuarios</h1>

        <button onClick={() => setIsModalOpen(true)}>
          <PlusIcon style={{ width: '20px' }} />
          Agregar Usuario
        </button>
      </div>

      {/* Error */}
      {error && <div>{error}</div>}

      {/* Tabla */}
      <Table
        columns={columns}
        data={usuarios}
        rowKey="id_colaborador"
        emptyMessage={loading ? 'Cargando...' : 'Sin usuarios'}
      />

      {/* Modal */}
      {isModalOpen && (
        <div>
          <h2>{editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />

            <input
              type="text"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
            />

            <button type="submit">Guardar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Usuarios;