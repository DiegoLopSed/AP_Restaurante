import { apiClient } from './apiClient';

export async function login({ correo, contrasena }) {
  const res = await apiClient.post('/login.php', { correo, contrasena });
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo iniciar sesión');
  }
  return res.data; // { token, usuario }
}

/** Login para clientes frecuentes (correo o teléfono + contraseña) */
export async function loginCliente({ correoOTelefono, contrasena }) {
  const res = await apiClient.post('/clientes/login.php', {
    correo_o_telefono: correoOTelefono,
    contrasena,
  });
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo iniciar sesión');
  }
  return res.data; // { token, usuario }
}

/** Registro de clientes frecuentes */
export async function registroCliente({ nombre, correo, telefono, direccionEntrega, contrasena }) {
  const res = await apiClient.post('/clientes/registro.php', {
    nombre,
    correo,
    telefono,
    direccion_entrega: direccionEntrega,
    contrasena,
  });
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo completar el registro');
  }
  return res.data;
}

export function logout() {
  localStorage.removeItem('ap_restaurante_token');
  localStorage.removeItem('ap_restaurante_usuario');
}


