import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../assets/css/Lealtad.module.css';

export default function Lealtad() {
  const navigate = useNavigate();
  const { isAuthenticated, usuario, loginCliente, registroCliente } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'registro'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registroExito, setRegistroExito] = useState('');

  // Form: login
  const [correoOTelefono, setCorreoOTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');

  // Form: registro
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [contrasenaRegistro, setContrasenaRegistro] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  if (isAuthenticated) {
    if (usuario?.tipo === 'cliente') {
      return <Navigate to="/clients/dashboard" replace />;
    }
    const pos = (usuario?.posicion || '').toLowerCase();
    const path = pos.includes('gerente') || pos.includes('admin') ? '/manager/dashboard' : '/user/dashboard';
    return <Navigate to={path} replace />;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    if (!correoOTelefono.trim() || !contrasena) {
      setError('Ingresa tu correo o teléfono y contraseña');
      return;
    }

    setLoading(true);
    try {
      await loginCliente({ correoOTelefono: correoOTelefono.trim(), contrasena });
      navigate('/clients/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegistro(e) {
    e.preventDefault();
    setError('');
    setRegistroExito('');

    if (!nombre.trim() || !correo.trim() || !telefono.trim() || !direccionEntrega.trim() || !contrasenaRegistro || !confirmarContrasena) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (contrasenaRegistro !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (contrasenaRegistro.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const data = await registroCliente({
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono: telefono.replace(/\D/g, ''),
        direccionEntrega: direccionEntrega.trim(),
        contrasena: contrasenaRegistro,
      });
      setRegistroExito(data?.message || 'Registro exitoso. Ahora puedes iniciar sesión.');
      setTab('login');
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
      <PublicNav />
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Programa de Lealtad</h1>
          <p className={styles.subtitle}>
            Regístrate como cliente frecuente y acumula puntos en cada pedido
          </p>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => { setTab('login'); setError(''); setRegistroExito(''); }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'registro' ? styles.tabActive : ''}`}
              onClick={() => { setTab('registro'); setError(''); setRegistroExito(''); }}
            >
              Registrarse
            </button>
          </div>

          {registroExito && (
            <div className={styles.success} role="status">
              {registroExito}
            </div>
          )}

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className={styles.form}>
              <label className={styles.label}>
                Correo electrónico o teléfono
                <input
                  className={styles.input}
                  type="text"
                  value={correoOTelefono}
                  onChange={(e) => setCorreoOTelefono(e.target.value)}
                  placeholder="ejemplo@correo.com o 2211234567"
                  autoComplete="username"
                  disabled={loading}
                  required
                />
              </label>

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

              <button className={styles.button} type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegistro} className={styles.form}>
              <label className={styles.label}>
                Nombre completo
                <input
                  className={styles.input}
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  disabled={loading}
                  required
                />
              </label>

              <label className={styles.label}>
                Correo electrónico
                <input
                  className={styles.input}
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </label>

              <label className={styles.label}>
                Número de teléfono
                <input
                  className={styles.input}
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="10 dígitos"
                  autoComplete="tel"
                  disabled={loading}
                  required
                />
              </label>

              <label className={styles.label}>
                Dirección de entrega por defecto
                <textarea
                  className={styles.textarea}
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                  placeholder="Calle, número, colonia, ciudad..."
                  rows={3}
                  disabled={loading}
                  required
                />
              </label>

              <label className={styles.label}>
                Contraseña
                <input
                  className={styles.input}
                  type="password"
                  value={contrasenaRegistro}
                  onChange={(e) => setContrasenaRegistro(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
              </label>

              <label className={styles.label}>
                Confirmar contraseña
                <input
                  className={styles.input}
                  type="password"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
              </label>

              <button className={styles.button} type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          )}

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
