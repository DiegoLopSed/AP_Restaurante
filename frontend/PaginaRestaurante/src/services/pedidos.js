import { apiClient } from './apiClient';

// Obtener pedidos activos (status = 0)
export async function fetchPedidosActivos() {
  const res = await apiClient.get('/pedidos.php');
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudieron obtener los pedidos');
  }
  return Array.isArray(res.data) ? res.data : [];
}

/** Pedidos finalizados (status = 1) del colaborador autenticado (por nombre de mesero). Requiere token. */
export async function fetchPedidosRegistrosFinalizados() {
  const res = await apiClient.get('/pedidos.php?registros=1');
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudieron obtener los registros');
  }
  return Array.isArray(res.data) ? res.data : [];
}

// Crear un nuevo pedido sencillo
export async function createPedido(pedidoData) {
  // pedidoData: { nombre_cliente, nombre_mesero, id_metodo_pago? }
  const res = await apiClient.post('/pedidos.php', pedidoData);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo crear el pedido');
  }
  return res.data;
}

// Agregar producto a un pedido
export async function addProductoAPedido({ id_pedido, id_producto, cantidad }) {
  const res = await apiClient.post('/pedido_productos.php', {
    id_pedido,
    id_producto,
    cantidad,
  });
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo agregar el producto al pedido');
  }
  return res.data;
}

/** Líneas de un pedido activo (con nombre_producto, cantidad, subtotal, etc.) */
export async function fetchLineasPedido(idPedido) {
  const q = new URLSearchParams({ id_pedido: String(idPedido) });
  const res = await apiClient.get(`/pedido_productos.php?${q.toString()}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudieron obtener las líneas del pedido');
  }
  return Array.isArray(res.data) ? res.data : [];
}

/** Establece la cantidad absoluta de una línea (>= 1) */
export async function updateCantidadLineaPedido({ id_pedido, id_producto, cantidad }) {
  const res = await apiClient.put('/pedido_productos.php', {
    id_pedido,
    id_producto,
    cantidad,
  });
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo actualizar la cantidad');
  }
  return res.data;
}

/** Elimina un producto del pedido */
export async function removeProductoDePedido(idPedido, idProducto) {
  const q = new URLSearchParams({
    id_pedido: String(idPedido),
    id_producto: String(idProducto),
  });
  const res = await apiClient.del(`/pedido_productos.php?${q.toString()}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo eliminar el producto del pedido');
  }
  return res.data;
}

/** Marca el pedido como finalizado (deja de aparecer en activos) */
export async function finalizarPedido(idPedido) {
  const res = await apiClient.patch('/pedidos.php', {
    id_pedido: idPedido,
    accion: 'finalizar',
  });
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo finalizar el pedido');
  }
  return res.data;
}

/** Elimina el pedido activo por completo */
export async function eliminarPedido(idPedido) {
  const q = new URLSearchParams({ id_pedido: String(idPedido) });
  const res = await apiClient.del(`/pedidos.php?${q.toString()}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo eliminar el pedido');
  }
  return res.data;
}

/**
 * Envía la comanda al servidor; este imprime por ESC/POS en THERMAL_PRINTER_HOST (.env).
 * Requiere colaborador autenticado. Timeout mayor por conexión TCP a la impresora.
 */
export async function enviarComandaImpresoraRed(idPedido) {
  const res = await apiClient.post(
    '/comanda_red.php',
    { id_pedido: idPedido },
    { timeoutMs: 25000 }
  );
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo enviar la comanda a la impresora de red');
  }
  return res.data;
}

