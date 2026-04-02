import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Table from '../../components/Table';
import {
  fetchCorteCajaDia,
  guardarCorteCajaDia,
  fetchHistorialCorteCaja,
  fetchDetalleCorteCaja,
  exportarCorteCajaCSV,
  exportarCorteCajaPDF,
} from '../../services/reportes';
import styles from '../../assets/css/ManagerDashboard.module.css';
import userPedidosStyles from '../../assets/css/UserPedidos.module.css';

function todayYMDLocal() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateTime(isoLike) {
  if (!isoLike) return '—';
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

const Reportes = () => {
  const [fecha, setFecha] = useState(todayYMDLocal());
  const [finalizados, setFinalizados] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reporte, setReporte] = useState(null);
  const [idCorteCaja, setIdCorteCaja] = useState(null);
  const [modalDetallePedido, setModalDetallePedido] = useState(null);

  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState('');
  const [historialCortes, setHistorialCortes] = useState([]);

  const [loadingDetalleCorte, setLoadingDetalleCorte] = useState(false);
  const [modalCorteCaja, setModalCorteCaja] = useState(null); // reporte completo del corte

  const generarReporte = useCallback(async () => {
    setLoading(true);
    setError('');
    setIdCorteCaja(null);
    try {
      const data = await fetchCorteCajaDia({ fecha, finalizados });
      setReporte(data);
    } catch (e) {
      setError(e?.message || 'No se pudo generar el reporte');
    } finally {
      setLoading(false);
    }
  }, [fecha, finalizados]);

  useEffect(() => {
    generarReporte();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarHistorial = useCallback(async () => {
    setLoadingHistorial(true);
    setErrorHistorial('');
    try {
      const items = await fetchHistorialCorteCaja({ limit: 50, offset: 0 });
      setHistorialCortes(items);
    } catch (e) {
      setErrorHistorial(e?.message || 'No se pudo cargar el historial de cortes');
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const guardarCorte = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await guardarCorteCajaDia({ fecha, finalizados });
      setReporte(res?.reporte || null);
      setIdCorteCaja(res?.id_corte_caja ?? null);
    } catch (e) {
      setError(e?.message || 'No se pudo guardar el corte de caja');
    } finally {
      setLoading(false);
    }
  }, [fecha, finalizados]);

  const resumenCards = useMemo(() => {
    const r = reporte?.resumen;
    if (!r) return [];
    const total = Number(r.total_ventas || 0);
    const efectivo = Number(r.total_efectivo || 0);
    const tarjeta = Number(r.total_tarjeta || 0);
    return [
      { label: 'Pedidos', value: String(r.num_pedidos ?? 0) },
      { label: 'Total ventas', value: `$${total.toFixed(2)}` },
      { label: 'Efectivo', value: `$${efectivo.toFixed(2)}` },
      { label: 'Tarjeta', value: `$${tarjeta.toFixed(2)}` },
    ];
  }, [reporte]);

  const columnsPedidos = useMemo(
    () => [
      { key: 'id_pedido', label: 'Pedido' },
      {
        key: 'hora_entrada',
        label: 'Hora entrada',
        render: (v) => formatDateTime(v),
      },
      { key: 'nombre_cliente', label: 'Cliente' },
      {
        key: 'nombre_mesero',
        label: 'Mesero',
        render: (v) => (v && String(v).trim() !== '' ? v : 'Sin mesero'),
      },
      {
        key: 'metodo_pago_nombre',
        label: 'Pago',
        render: (v, row) => (v ? v : row.id_metodo_pago === 2 ? 'Tarjeta' : 'Efectivo'),
      },
      {
        key: 'total',
        label: 'Total',
        render: (v) => `$${Number(v || 0).toFixed(2)}`,
      },
      {
        key: 'acciones',
        label: '',
        render: (_, row) => (
          <button
            type="button"
            className={userPedidosStyles.modalActionBtn}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text)',
              width: 'auto',
              alignSelf: 'center',
            }}
            disabled={loading || loadingDetalleCorte}
            onClick={(e) => {
              e.stopPropagation();
              setModalDetallePedido(row);
            }}
          >
            Ver detalle
          </button>
        ),
      },
    ],
    [loading, loadingDetalleCorte]
  );

  const columnsHistorial = useMemo(
    () => [
      { key: 'id_corte_caja', label: 'ID' },
      { key: 'fecha', label: 'Fecha' },
      {
        key: 'finalizados',
        label: 'Tipo',
        render: (v) => (((v ?? 1) === 1 || v === true) ? 'Finalizados' : 'Todos'),
      },
      {
        key: 'num_pedidos',
        label: '# Pedidos',
        render: (v) => String(v ?? 0),
      },
      {
        key: 'total_ventas',
        label: 'Total ventas',
        render: (v) => `$${Number(v || 0).toFixed(2)}`,
      },
      {
        key: 'realizado_por_nombre',
        label: 'Realizado por',
        render: (v) => v || 'N/D',
      },
      {
        key: 'acciones',
        label: '',
        render: (_, row) => (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={userPedidosStyles.modalActionBtn}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)', width: 'auto' }}
              disabled={loadingDetalleCorte}
              onClick={async (e) => {
                e.stopPropagation();
                setLoadingDetalleCorte(true);
                try {
                  const detalle = await fetchDetalleCorteCaja(row.id_corte_caja);
                  setModalCorteCaja(detalle);
                } catch (err) {
                  alert(err?.message || 'No se pudo cargar el detalle del corte');
                } finally {
                  setLoadingDetalleCorte(false);
                }
              }}
            >
              Ver
            </button>
            <button
              type="button"
              className={userPedidosStyles.modalActionBtn}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)', width: 'auto' }}
              disabled={loadingDetalleCorte}
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await exportarCorteCajaCSV(row.id_corte_caja);
                } catch (err) {
                  alert(err?.message || 'No se pudo exportar CSV');
                }
              }}
            >
              CSV
            </button>
            <button
              type="button"
              className={userPedidosStyles.modalActionBtn}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)', width: 'auto' }}
              disabled={loadingDetalleCorte}
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await exportarCorteCajaPDF(row.id_corte_caja);
                } catch (err) {
                  alert(err?.message || 'No se pudo exportar PDF');
                }
              }}
            >
              PDF
            </button>
          </div>
        ),
      },
    ],
    [loadingDetalleCorte]
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.contentSection}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className={styles.greeting} style={{ marginBottom: 6 }}>
              Reportes
            </h1>
            <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: 'var(--font-size-base)' }}>
              Corte de caja: extrae el reporte completo de la venta del día.
            </p>
          </div>
          <div style={{ color: 'var(--color-text-light)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <ClipboardDocumentListIcon style={{ width: 22, height: 22 }} aria-hidden="true" />
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-background)' }}
              />
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={finalizados}
                onChange={(e) => setFinalizados(e.target.checked)}
              />
              <span style={{ color: 'var(--color-text-light)' }}>Solo finalizados (status=1)</span>
            </label>
          </div>

          <button
            type="button"
            className={userPedidosStyles.primaryButton}
            disabled={loading}
            onClick={guardarCorte}
          >
            {loading ? 'Guardando…' : 'Generar y guardar corte de caja'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: 12, background: '#fee2e2', color: '#dc2626', borderRadius: 8 }}>
            {error}
          </div>
        )}

        {reporte && (
          <>
            {idCorteCaja != null ? (
              <div style={{ marginTop: 14, padding: 12, background: '#dcfce7', color: '#166534', borderRadius: 8, fontWeight: 700 }}>
                Corte de caja guardado correctamente. ID: {idCorteCaja}
              </div>
            ) : null}
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {resumenCards.map((c) => (
                <div
                  key={c.label}
                  style={{
                    background: 'var(--color-background)',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-sm)',
                    padding: 14,
                  }}
                >
                  <div style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-small)', fontWeight: 600 }}>
                    {c.label}
                  </div>
                  <div style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: 'var(--font-size-large)', marginTop: 8 }}>
                    {c.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                  Pedidos del día ({reporte.fecha})
                </h2>
              </div>
              <div className={styles.contentSection} style={{ padding: 0, marginTop: 12 }}>
                <Table
                  columns={columnsPedidos}
                  data={reporte.pedidos}
                  rowKey="id_pedido"
                  emptyMessage={loading ? 'Cargando…' : 'No hay pedidos para el día seleccionado'}
                />
              </div>
            </div>

            {modalDetallePedido && (
              <div
                className={userPedidosStyles.modalOverlayNested}
                role="presentation"
                onClick={() => setModalDetallePedido(null)}
              >
                <div
                  className={userPedidosStyles.modalBoxEditor}
                  role="dialog"
                  aria-modal="true"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={userPedidosStyles.modalEditorBack}>
                    <button type="button" className={userPedidosStyles.catalogBackBtn} onClick={() => setModalDetallePedido(null)}>
                      Volver
                    </button>
                  </div>
                  <h2 className={userPedidosStyles.modalEditorTitle} style={{ marginTop: 0 }}>
                    Pedido #{modalDetallePedido.id_pedido} · {modalDetallePedido.nombre_cliente}
                  </h2>

                  <div style={{ marginTop: 12, color: 'var(--color-text-light)', fontSize: 'var(--font-size-small)' }}>
                    <div>Mesero: {modalDetallePedido.nombre_mesero || 'Sin mesero'}</div>
                    <div>Pago: {modalDetallePedido.metodo_pago_nombre || (modalDetallePedido.id_metodo_pago === 2 ? 'Tarjeta' : 'Efectivo')}</div>
                    <div>Entrada: {formatDateTime(modalDetallePedido.hora_entrada)}</div>
                    {modalDetallePedido.hora_salida ? <div>Salida: {formatDateTime(modalDetallePedido.hora_salida)}</div> : null}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    {modalDetallePedido.lineas && modalDetallePedido.lineas.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', padding: '8px 0', fontSize: 12, color: 'var(--color-text-light)' }}>
                              Cant.
                            </th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', padding: '8px 0', fontSize: 12, color: 'var(--color-text-light)' }}>
                              Producto
                            </th>
                            <th style={{ textAlign: 'right', borderBottom: '1px solid var(--color-border)', padding: '8px 0', fontSize: 12, color: 'var(--color-text-light)' }}>
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {modalDetallePedido.lineas.map((l, idx) => (
                            <tr key={`${l.id_producto}-${idx}`}>
                              <td style={{ padding: '6px 0', fontWeight: 600 }}>{l.cantidad}</td>
                              <td style={{ padding: '6px 0' }}>{l.nombre_producto}</td>
                              <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>${Number(l.subtotal || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ color: 'var(--color-text-light)' }}>Sin líneas</div>
                    )}
                  </div>

                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-large)' }}>
                      Total: ${Number(modalDetallePedido.total || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 26 }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 12 }}>
            Historial de cortes
          </h2>

          {loadingHistorial ? (
            <div style={{ color: 'var(--color-text-light)' }}>Cargando…</div>
          ) : errorHistorial ? (
            <div style={{ padding: 12, background: '#fee2e2', color: '#dc2626', borderRadius: 8 }}>
              {errorHistorial}
            </div>
          ) : (
            <Table
              columns={columnsHistorial}
              data={historialCortes}
              rowKey="id_corte_caja"
              emptyMessage="Aún no hay cortes guardados"
            />
          )}
        </div>

        {modalCorteCaja && (
          <div
            className={userPedidosStyles.modalOverlayNested}
            role="presentation"
            onClick={() => setModalCorteCaja(null)}
          >
            <div
              className={userPedidosStyles.modalBoxEditor}
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={userPedidosStyles.modalEditorBack}>
                <button
                  type="button"
                  className={userPedidosStyles.catalogBackBtn}
                  onClick={() => setModalCorteCaja(null)}
                >
                  Volver
                </button>
              </div>

              <h2 className={userPedidosStyles.modalEditorTitle} style={{ marginTop: 0 }}>
                Corte del día ({modalCorteCaja.fecha})
              </h2>

              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {(() => {
                  const r = modalCorteCaja?.resumen;
                  if (!r) return null;
                  const total = Number(r.total_ventas || 0);
                  const efectivo = Number(r.total_efectivo || 0);
                  const tarjeta = Number(r.total_tarjeta || 0);
                  return (
                    <>
                      <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 14 }}>
                        <div style={{ color: 'var(--color-text-light)', fontWeight: 600, fontSize: 'var(--font-size-small)' }}>Pedidos</div>
                        <div style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 'var(--font-size-large)', marginTop: 8 }}>
                          {Number(r.num_pedidos || 0)}
                        </div>
                      </div>
                      <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 14 }}>
                        <div style={{ color: 'var(--color-text-light)', fontWeight: 600, fontSize: 'var(--font-size-small)' }}>Total ventas</div>
                        <div style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 'var(--font-size-large)', marginTop: 8 }}>
                          ${total.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 14 }}>
                        <div style={{ color: 'var(--color-text-light)', fontWeight: 600, fontSize: 'var(--font-size-small)' }}>Efectivo</div>
                        <div style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 'var(--font-size-large)', marginTop: 8 }}>
                          ${efectivo.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 14 }}>
                        <div style={{ color: 'var(--color-text-light)', fontWeight: 600, fontSize: 'var(--font-size-small)' }}>Tarjeta</div>
                        <div style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 'var(--font-size-large)', marginTop: 8 }}>
                          ${tarjeta.toFixed(2)}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div style={{ marginTop: 16 }}>
                <Table
                  columns={columnsPedidos}
                  data={modalCorteCaja.pedidos}
                  rowKey="id_pedido"
                  emptyMessage="Sin pedidos en este corte"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;

