/**
 * Login.jsx
 * 
 * Componente encargado del inicio de sesión del sistema.
 * 
 * Permite autenticación de:
 * - Empleados (admin / gerente / staff)
 * - Redirección automática según rol
 * 
 * Funcionalidades principales:
 * - Validación de campos (correo y contraseña)
 * - Manejo de estado de carga (loading)
 * - Manejo de errores
 * - Redirección automática si ya está autenticado
 * - Redirección según tipo de usuario
 *  @package AP_Restaurante
 * @subpackage FrontendLogin.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import styles from '../../assets/css/Login.module.css';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Determina la ruta de redirección para empleados
 * @param {Object} usuario - Usuario autenticado
 * @returns {string} Ruta destino
 */
function getEmpleadoRedirectPath(usuario) {
  const pos = (usuario?.posicion || '').toLowerCase();

  // Si es gerente o admin → panel de administrador
  if (pos.includes('gerente') || pos.includes('admin')) {
    return '/manager/dashboard';
  }

  // Si no → panel de usuario normal
  return '/user/dashboard';
}

export default function Login() {

  // Hook para navegación
  const navigate = useNavigate();

  // Contexto de autenticación
  const { isAuthenticated, usuario, login } = useAuth();

  // Estados del formulario
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Si el usuario ya está autenticado,
   * redirige automáticamente según su tipo
   */
  if (isAuthenticated) {
    if (usuario?.tipo === 'cliente') {
      return <Navigate to="/clients/dashboard" replace />;
    }

    return <Navigate to={getEmpleadoRedirectPath(usuario)} replace />;
  }

  /**
   * Maneja el envío del formulario de login
   * @param {Event} e - Evento del formulario
   */
  async function handleSubmit(e) {
    e.preventDefault();

    // Limpia errores previos
    setError('');

    // Validación básica
    if (!correo.trim() || !contrasena) {
      setError('Correo y contraseña son requeridos');
      return;
    }

    setLoading(true);

    try {
      // Llamada al login desde el contexto
      const { usuario: u } = await login({
        correo: correo.trim(),
        contrasena
      });

      // Redirección según rol
      navigate(getEmpleadoRedirectPath(u), { replace: true });

    } catch (err) {
      // Manejo de errores
      setError(err?.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Navegación pública */}
      <PublicNav />

      <div className={styles.page}>
        <div className={styles.card}>

          {/* Título */}
          <h1 className={styles.title}>Sistema de Gestión</h1>
          <p className={styles.subtitle}>
            Inicio de sesión para empleados y colaboradores
          </p>

          {/* Mensaje de error */}
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className={styles.form}>

            {/* Campo correo */}
            <label className={styles.label}>
              Correo
              <input
                className={styles.input}
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@dominio.com"
                autoComplete="email"
                disabled={loading}
                required
              />
            </label>

            {/* Campo contraseña */}
            <label className={styles.label}>
              Contraseña
              <input
                className={styles.input}
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="********"
                autoComplete="current-password"
                disabled={loading}
                required
              />
            </label>

            {/* Botón login */}
            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            {/* Enlace a programa de lealtad */}
            <p className={styles.footer}>
              ¿Eres cliente frecuente?{' '}
              <Link to="/lealtad" className={styles.link}>
                Programa de Lealtad
              </Link>
            </p>

          </form>
        </div>
      </div>
    </>
  );
}