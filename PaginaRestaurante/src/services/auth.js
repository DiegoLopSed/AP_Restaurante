import { apiClient } from './apiClient';

export async function login({ correo, contrasena }) {
  const res = await apiClient.post('/login.php', { correo, contrasena });
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo iniciar sesión');
  }
  return res.data; // { token, usuario }
}

export function logout() {
  // Solo frontend: el backend actualmente no maneja sesión server-side
  localStorage.removeItem('ap_restaurante_token');
  localStorage.removeItem('ap_restaurante_usuario');
}


