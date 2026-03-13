import { createContext, useContext, useMemo, useState } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext(null);

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ap_restaurante_token') || '');
  const [usuario, setUsuario] = useState(() => safeJsonParse(localStorage.getItem('ap_restaurante_usuario')) || null);

  const isAuthenticated = Boolean(token && usuario);

  async function login({ correo, contrasena }) {
    const data = await authService.login({ correo, contrasena });
    const nextToken = data?.token || '';
    const nextUser = data?.usuario || null;

    localStorage.setItem('ap_restaurante_token', nextToken);
    localStorage.setItem('ap_restaurante_usuario', JSON.stringify(nextUser));

    setToken(nextToken);
    setUsuario(nextUser);

    return { token: nextToken, usuario: nextUser };
  }

  /** Login de clientes frecuentes (correo o teléfono + contraseña) */
  async function loginCliente({ correoOTelefono, contrasena }) {
    const data = await authService.loginCliente({ correoOTelefono, contrasena });
    const nextToken = data?.token || '';
    const nextUser = data?.usuario || null;

    localStorage.setItem('ap_restaurante_token', nextToken);
    localStorage.setItem('ap_restaurante_usuario', JSON.stringify(nextUser));

    setToken(nextToken);
    setUsuario(nextUser);

    return { token: nextToken, usuario: nextUser };
  }

  /** Registro de clientes frecuentes */
  async function registroCliente({ nombre, correo, telefono, direccionEntrega, contrasena }) {
    return authService.registroCliente({
      nombre,
      correo,
      telefono,
      direccionEntrega,
      contrasena,
    });
  }

  function logout() {
    authService.logout();
    setToken('');
    setUsuario(null);
  }

  const value = useMemo(
    () => ({
      token,
      usuario,
      isAuthenticated,
      login,
      loginCliente,
      registroCliente,
      logout,
    }),
    [token, usuario, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider />');
  }
  return ctx;
}


