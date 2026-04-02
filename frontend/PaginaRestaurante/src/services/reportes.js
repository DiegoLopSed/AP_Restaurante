import { apiClient } from './apiClient';

/**
 * Corte de caja / Venta del día.
 * @param {object} params
 * @param {string} params.fecha YYYY-MM-DD (opcional; default hoy)
 * @param {boolean} params.finalizados default true (status=1)
 */
export async function fetchCorteCajaDia({ fecha, finalizados = true } = {}) {
  const q = new URLSearchParams();
  if (fecha) q.set('fecha', String(fecha));
  q.set('finalizados', finalizados ? '1' : '0');

  const res = await apiClient.get(`/corte_caja.php?${q.toString()}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener el corte de caja');
  }
  return res.data;
}

/**
 * Genera y guarda el corte de caja (info general) en BD.
 * Devuelve { ...reporte, id_corte_caja } desde backend.
 */
export async function guardarCorteCajaDia({ fecha, finalizados = true } = {}) {
  const body = { fecha, finalizados: !!finalizados };
  const res = await apiClient.post('/corte_caja.php', body);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo guardar el corte de caja');
  }
  return {
    reporte: res?.data,
    id_corte_caja: res?.id_corte_caja,
  };
}

export async function fetchHistorialCorteCaja({ limit = 50, offset = 0 } = {}) {
  const q = new URLSearchParams();
  q.set('limit', String(limit));
  q.set('offset', String(offset));

  const res = await apiClient.get(`/historial_corte_caja.php?${q.toString()}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener el historial de cortes');
  }
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchDetalleCorteCaja(idCorteCaja) {
  const res = await apiClient.get(`/detalle_corte_caja.php?id_corte_caja=${encodeURIComponent(String(idCorteCaja))}`);
  if (!res?.success) {
    throw new Error(res?.message || 'No se pudo obtener el detalle del corte');
  }
  return res.data;
}

function getAuthToken() {
  try {
    return localStorage.getItem('ap_restaurante_token') || '';
  } catch {
    return '';
  }
}

async function fetchWithAuthRaw(url, { timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const token = getAuthToken();
    const res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      // intentamos parsear json si aplica
      try {
        const j = JSON.parse(text);
        throw new Error(j?.message || `HTTP ${res.status}`);
      } catch {
        throw new Error(text || `HTTP ${res.status}`);
      }
    }
    return { res, text };
  } finally {
    clearTimeout(timeout);
  }
}

export async function exportarCorteCajaCSV(idCorteCaja) {
  const apiBase = apiClient.resolveApiBase();
  const url = `${apiBase}/export_corte_caja_csv.php?id_corte_caja=${encodeURIComponent(String(idCorteCaja))}`;
  const token = getAuthToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const filename = `corte_caja_${String(idCorteCaja)}.csv`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  } finally {
    clearTimeout(timeout);
  }
}

export async function exportarCorteCajaPDF(idCorteCaja) {
  const apiBase = apiClient.resolveApiBase();
  const url = `${apiBase}/export_corte_caja_pdf.php?id_corte_caja=${encodeURIComponent(String(idCorteCaja))}`;
  const win = window.open('', '_blank');
  if (!win) {
    throw new Error('El navegador bloqueó la ventana para el PDF. Permite popups para exportar.');
  }

  const { text } = await fetchWithAuthRaw(url, { timeoutMs: 60000 });
  win.document.open();
  win.document.write(text);
  win.document.close();
}

