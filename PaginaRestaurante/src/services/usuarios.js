import { apiClient } from './apiClient';

export async function fetchUsuarios() {
  const res = await apiClient.get('/registro.php');
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener usuarios');
  }
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchUsuarioById(id) {
  const res = await apiClient.get(`/registro.php?id=${id}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener el usuario');
  }
  return res.data;
}

export async function createUsuario(usuarioData) {
  const res = await apiClient.post('/registro.php', usuarioData);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo crear el usuario');
  }
  return res.data;
}

export async function updateUsuario(id, usuarioData) {
  const res = await apiClient.put(`/registro.php?id=${id}`, usuarioData);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo actualizar el usuario');
  }
  return res.data;
}

export async function deleteUsuario(id) {
  const res = await apiClient.del(`/registro.php?id=${id}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo eliminar el usuario');
  }
  return res;
}

