import { apiClient } from './apiClient';

export async function fetchInsumos() {
  const res = await apiClient.get('/insumos.php');
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener insumos');
  }
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchInsumoById(id) {
  const res = await apiClient.get(`/insumos.php?id=${id}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener el insumo');
  }
  return res.data;
}

export async function createInsumo(insumoData) {
  const res = await apiClient.post('/insumos.php', insumoData);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo crear el insumo');
  }
  return res.data;
}

export async function updateInsumo(id, insumoData) {
  const res = await apiClient.put(`/insumos.php?id=${id}`, insumoData);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo actualizar el insumo');
  }
  return res.data;
}

export async function deleteInsumo(id) {
  const res = await apiClient.del(`/insumos.php?id=${id}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo eliminar el insumo');
  }
  return res;
}

