import { apiClient } from './apiClient';

export async function fetchEmpleados() {
  // Backend expone: public/api/empleados.php
  // Respuesta esperada: { success: boolean, data: [...] }
  const res = await apiClient.get('/empleados.php');
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener empleados');
  }
  return Array.isArray(res.data) ? res.data : [];
}


