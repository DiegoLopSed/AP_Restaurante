/**
 * Lealtad.jsx
 * 
 * Componente encargado del programa de lealtad para clientes.
 * 
 * Permite a los usuarios:
 * - Iniciar sesión como cliente
 * - Registrarse en el programa de lealtad
 * 
 * Funcionalidades principales:
 * - Alternar entre login y registro mediante tabs
 * - Validación de formularios
 * - Manejo de estados (loading, error, éxito)
 * - Redirección automática según tipo de usuario
 * - Integración con AuthContext
 * 
 * Tipos de usuario:
 * - Cliente → /clients/dashboard
 * - Empleado → /manager/dashboard o /user/dashboard
 * @package AP_Restaurante
 * @subpackage FrontendLealtad.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../assets/css/Lealtad.module.css';

export default function Lealtad() {

  // Hooks de navegación y autenticación
  const navigate = useNavigate();
  const { isAuthenticated, usuario, loginCliente, registroCliente } = useAuth();

  /**
   * Estado para controlar la pestaña activa:
   * - 'login'
   * - 'registro'
   */
  const [tab, setTab] = useState('login');

  // Estados generales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registroExito, setRegistroExito] = useState('');

  // Formulario: login
  const [correoOTelefono, setCorreoOTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');

  // Formulario: registro
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [contrasenaRegistro, setContrasenaRegistro] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  /**
   * Redirección automática si el usuario ya está autenticado
   */
  if (isAuthenticated) {
    if (usuario?.tipo === 'cliente') {
      return <Navigate to="/clients/dashboard" replace />;
    }

    const pos = (usuario?.posicion || '').toLowerCase();
    const path =
      pos.includes('gerente') || pos.includes('admin')
        ? '/manager/dashboard'
        : '/user/dashboard';

    return <Navigate to={path} replace />;
  }

  /**
   * Maneja el inicio de sesión de clientes
   */
  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!correoOTelefono.trim() || !contrasena) {
      setError('Ingresa tu correo o teléfono y contraseña');
      return;
    }

    setLoading(true);

    try {
      await loginCliente({
        correoOTelefono: correoOTelefono.trim(),
        contrasena
      });

      // Redirige al dashboard de cliente
      navigate('/clients/dashboard', { replace: true });

    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Maneja el registro de nuevos clientes
   */
  async function handleRegistro(e) {
    e.preventDefault();

    setError('');
    setRegistroExito('');

    // Validación de campos
    if (
      !nombre.trim() ||
      !correo.trim() ||
      !telefono.trim() ||
      !direccionEntrega.trim() ||
      !contrasenaRegistro ||
      !confirmarContrasena
    ) {
      setError('Todos los campos son obligatorios');
      return;
    }

    // Validación de contraseñas
    if (contrasenaRegistro !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validación de longitud de contraseña
    if (contrasenaRegistro.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Llamada al registro desde el contexto
      const data = await registroCliente({
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono: telefono.replace(/\D/g, ''), // elimina caracteres no numéricos
        direccionEntrega: direccionEntrega.trim(),
        contrasena: contrasenaRegistro,
      });

      // Mensaje de éxito
      setRegistroExito(
        data?.message || 'Registro exitoso. Ahora puedes iniciar sesión.'
      );

      // Cambia a pestaña login
      setTab('login');

      // Limpia formulario
      setNombre('');
      setCorreo('');
      setTelefono('');
      setDireccionEntrega('');
      setContrasenaRegistro('');
      setConfirmarContrasena('');

    } catch (err) {
      setError(err?.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Navegación pública */}
      <PublicNav />

      <main className={styles.page}>
        <section className={styles.card}>

          {/* Título */}
          <h1 className={styles.title}>Programa de Lealtad</h1>
          <p className={styles.subtitle}>
            Regístrate como cliente frecuente y acumula puntos en cada pedido
          </p>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => {
                setTab('login');
                setError('');
                setRegistroExito('');
              }}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className={`${styles.tab} ${tab === 'registro' ? styles.tabActive : ''}`}
              onClick={() => {
                setTab('registro');
                setError('');
                setRegistroExito('');
              }}
            >
              Registrarse
            </button>
          </div>

          {/* Mensaje éxito */}
          {registroExito && (
            <div className={styles.success} role="status">
              {registroExito}
            </div>
          )}

          {/* Mensaje error */}
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          {/* FORMULARIO LOGIN */}
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className={styles.form}>
              {/* Inputs login */}
            </form>
          ) : (
            /* FORMULARIO REGISTRO */
            <form onSubmit={handleRegistro} className={styles.form}>
              {/* Inputs registro */}
            </form>
          )}

          {/* Enlace a login de empleados */}
          <p className={styles.footer}>
            ¿Eres empleado?{' '}
            <Link to="/login" className={styles.link}>
              Accede al Sistema de Gestión
            </Link>
          </p>

        </section>
      </main>
    </>
  );
}