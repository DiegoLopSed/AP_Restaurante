import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import styles from '../../assets/css/Login.module.css';
import { useAuth } from '../../contexts/AuthContext';

function guessRedirectPath(usuario) {
  const pos = (usuario?.posicion || '').toLowerCase();
  if (pos.includes('gerente') || pos.includes('admin')) return '/manager/dashboard';
  return '/user/dashboard';
}

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, usuario, login } = useAuth();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={guessRedirectPath(usuario)} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!correo.trim() || !contrasena) {
      setError('Correo y contraseña son requeridos');
      return;
    }

    setLoading(true);
    try {
      const { usuario: u } = await login({ correo: correo.trim(), contrasena });
      navigate(guessRedirectPath(u), { replace: true });
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Accede con tu correo y contraseña</p>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
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
      </div>
    </div>
  );
}


