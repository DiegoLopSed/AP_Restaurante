const DEFAULT_TIMEOUT_MS = 15000;

function resolveApiBase() {
  // Dev: usar el proxy de Vite (/api -> Apache/XAMPP)
  if (import.meta.env.DEV) return '/api';

  // Prod: derivar desde BASE_URL cuando sea posible (ej: /AP_Restaurante/public/app/)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // Reemplazar el último segmento "app/" por "api/"
  if (normalized.endsWith('app/')) return normalized.replace(/app\/$/, 'api');

  // Fallback (por si cambian la estructura)
  return '/AP_Restaurante/public/api';
}

async function request(path, { method = 'GET', headers, body, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const apiBase = resolveApiBase();
  const url = `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = localStorage.getItem('ap_restaurante_token');

    const res = await fetch(url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : null),
        ...(token ? { Authorization: `Bearer ${token}` } : null),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { success: false, message: 'Respuesta no es JSON', raw: text };
    }

    if (!res.ok) {
      const msg = data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' }),
  resolveApiBase,
};

