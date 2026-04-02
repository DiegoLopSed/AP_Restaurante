import { apiClient } from './apiClient';

// Obtener todos los productos
export async function fetchProductos() {
  const res = await apiClient.get('/productos.php');
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener productos');
  }
  return Array.isArray(res.data) ? res.data : [];
}

// Obtener un producto por ID
export async function fetchProductoById(id) {
  const res = await apiClient.get(`/productos.php?id=${id}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener el producto');
  }
  return res.data;
}

// Crear producto con lista de insumos
export async function createProducto(productoData) {
  // productoData debe incluir:
  // {
  //   id_categoria,
  //   nombre,
  //   descripcion,
  //   precio,
  //   estatus,
  //   insumos: [{ id_insumo, cantidad, unidad_medida }]
  // }
  const res = await apiClient.post('/productos.php', productoData);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo crear el producto');
  }
  return res.data;
}

