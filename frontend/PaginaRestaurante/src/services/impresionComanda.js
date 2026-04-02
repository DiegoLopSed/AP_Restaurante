/**
 * Impresión de comandas desde el navegador (diálogo del sistema → impresora térmica/PDF).
 * Usa un iframe oculto para evitar bloqueadores de ventanas emergentes.
 */

export const STORAGE_AUTO_IMPRIMIR_AL_AGREGAR = 'ap_restaurante_auto_imprimir_al_agregar';
export const STORAGE_NOMBRE_EN_TICKET = 'ap_restaurante_nombre_en_ticket';
/** Si es true, las comandas se envían al backend → impresora IP (ESC/POS); si no, impresión del navegador. */
export const STORAGE_IMPRESION_USAR_RED_TERMICA = 'ap_restaurante_impresion_red_termica';

export function getAutoImprimirAlAgregar() {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(STORAGE_AUTO_IMPRIMIR_AL_AGREGAR) === '1';
}

export function setAutoImprimirAlAgregar(activo) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_AUTO_IMPRIMIR_AL_AGREGAR, activo ? '1' : '0');
}

export function getNombreEnTicket() {
  if (typeof localStorage === 'undefined') return 'Restaurante';
  const v = localStorage.getItem(STORAGE_NOMBRE_EN_TICKET);
  return v != null && String(v).trim() !== '' ? String(v).trim() : 'Restaurante';
}

export function setNombreEnTicket(nombre) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_NOMBRE_EN_TICKET, String(nombre || '').trim());
}

export function getImprimirPorRedTermica() {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(STORAGE_IMPRESION_USAR_RED_TERMICA) === '1';
}

export function setImprimirPorRedTermica(activo) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_IMPRESION_USAR_RED_TERMICA, activo ? '1' : '0');
}

function escaparHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Genera documento HTML listo para impresión (ancho orientado a ticket ~80mm).
 */
export function generarHtmlComanda({ pedido, lineas = [], nombreMesero = '', nombreLocal }) {
  const local = nombreLocal != null && String(nombreLocal).trim() !== ''
    ? String(nombreLocal).trim()
    : getNombreEnTicket();
  const filas = (lineas || []).map((l) => {
    const cant = escaparHtml(l.cantidad);
    const nom = escaparHtml(l.nombre_producto);
    const sub = Number(l.subtotal || 0).toFixed(2);
    return `<tr><td class="qty">${cant}×</td><td class="prod">${nom}</td><td class="sub">$${sub}</td></tr>`;
  }).join('');

  const sinLineas = !filas
    ? '<tr><td colspan="3" class="muted">(Sin productos — comanda inicial)</td></tr>'
    : '';

  const fecha = new Date().toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const pago = pedido?.metodo_pago_nombre
    ? escaparHtml(pedido.metodo_pago_nombre)
    : Number(pedido?.id_metodo_pago) === 2
      ? 'Tarjeta'
      : 'Efectivo';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Comanda #${escaparHtml(pedido?.id_pedido)}</title>
  <style>
    * { box-sizing: border-box; }
    @page { margin: 4mm; size: auto; }
    @media print {
      body { margin: 0; padding: 4px; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      max-width: 72mm;
      margin: 0 auto;
      padding: 8px;
      font-size: 12px;
      color: #111;
    }
    h1 {
      font-size: 15px;
      margin: 0 0 6px;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .tipo {
      text-align: center;
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 8px;
      border-bottom: 2px dashed #000;
      padding-bottom: 8px;
    }
    .meta div { margin: 2px 0; font-size: 11px; }
    .meta strong { display: inline-block; min-width: 72px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th {
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      padding: 4px 2px;
    }
    td { padding: 5px 2px; vertical-align: top; border-bottom: 1px dotted #ccc; font-size: 11px; }
    td.qty { width: 14%; white-space: nowrap; }
    td.sub { text-align: right; width: 28%; }
    tfoot td {
      border-top: 2px solid #000;
      border-bottom: none;
      font-weight: 700;
      font-size: 13px;
      padding-top: 8px;
    }
    .muted { color: #666; font-style: italic; }
    .pie { margin-top: 12px; font-size: 10px; text-align: center; color: #444; }
  </style>
</head>
<body>
  <h1>${escaparHtml(local)}</h1>
  <div class="tipo">COMANDA — COCINA / BAR</div>
  <div class="meta">
    <div><strong>Pedido</strong>#${escaparHtml(pedido?.id_pedido)}</div>
    <div><strong>Cliente</strong>${escaparHtml(pedido?.nombre_cliente)}</div>
    <div><strong>Mesero</strong>${escaparHtml(nombreMesero)}</div>
    <div><strong>Pago</strong>${pago}</div>
    <div><strong>Fecha</strong>${escaparHtml(fecha)}</div>
  </div>
  <table>
    <thead>
      <tr><th>Cant.</th><th>Producto</th><th style="text-align:right">Subt.</th></tr>
    </thead>
    <tbody>${filas || sinLineas}</tbody>
    <tfoot>
      <tr>
        <td colspan="2">TOTAL</td>
        <td style="text-align:right">$${Number(pedido?.total || 0).toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
  <p class="pie">Impreso desde sistema de pedidos</p>
</body>
</html>`;
}

/**
 * Abre el diálogo de impresión del sistema con el HTML dado.
 * @returns {Promise<boolean>} false si no se pudo crear el iframe
 */
export function enviarHtmlAImpresion(html) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Comanda impresión');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';

    const eliminar = () => {
      try {
        document.body.removeChild(iframe);
      } catch {
        /* noop */
      }
    };

    let yaDisparado = false;
    const disparar = () => {
      if (yaDisparado) return;
      yaDisparado = true;
      try {
        const win = iframe.contentWindow;
        if (win) {
          win.focus();
          win.print();
        }
      } catch {
        /* noop */
      } finally {
        setTimeout(() => {
          eliminar();
          resolve(true);
        }, 400);
      }
    };

    document.body.appendChild(iframe);
    const win = iframe.contentWindow;
    if (!win) {
      eliminar();
      resolve(false);
      return;
    }

    const doc = win.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(disparar, 120);
  });
}

/**
 * @param {object} params
 * @param {object} params.pedido — fila pedido (id_pedido, nombre_cliente, total, …)
 * @param {Array} params.lineas — líneas con nombre_producto, cantidad, subtotal
 * @param {string} [params.nombreMesero]
 * @param {string} [params.nombreLocal] — nombre del establecimiento en el ticket
 */
export async function imprimirComandaPedido({ pedido, lineas, nombreMesero = '', nombreLocal }) {
  if (!pedido?.id_pedido) {
    return false;
  }
  const html = generarHtmlComanda({ pedido, lineas: lineas || [], nombreMesero, nombreLocal });
  return enviarHtmlAImpresion(html);
}
