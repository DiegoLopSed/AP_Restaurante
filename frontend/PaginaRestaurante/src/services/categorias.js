import { apiClient } from './apiClient';

export async function fetchCategorias() {
  const res = await apiClient.get('/categorias.php');
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener categorías');
  }
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchCategoriaById(id) {
  const res = await apiClient.get(`/categorias.php?id=${id}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener la categoría');
  }
  return res.data;
}

export async function createCategoria(categoriaData) {
  const res = await apiClient.post('/categorias.php', categoriaData);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo crear la categoría');
  }
  return res.data;
}

export async function updateCategoria(id, categoriaData) {
  const res = await apiClient.put(`/categorias.php?id=${id}`, categoriaData);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo actualizar la categoría');
  }
  return res.data;
}

export async function deleteCategoria(id) {
  const res = await apiClient.del(`/categorias.php?id=${id}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo eliminar la categoría');
  }
  return res;
}

