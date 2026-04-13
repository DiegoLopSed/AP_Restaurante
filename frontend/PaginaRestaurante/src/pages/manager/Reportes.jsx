/**
 * Reportes.jsx
 * 
 * Componente para la generación, visualización y gestión de reportes de ventas
 * (corte de caja) dentro del sistema.
 * 
 * Funcionalidades principales:
 * - Generación de corte de caja por fecha (con opción de filtrar pedidos finalizados)
 * - Visualización de resumen de ventas (total, efectivo, tarjeta, número de pedidos)
 * - Listado detallado de pedidos del día
 * - Visualización de detalle individual de pedidos
 * - Guardado de cortes de caja en el sistema
 * - Historial de cortes de caja generados
 * - Consulta de detalle de cortes históricos
 * - Exportación de reportes en formatos CSV y PDF
 * 
 * Manejo de estado:
 * - Control de carga para reportes y tablas
 * - Manejo de errores en operaciones API
 * - Control de modales (detalle de pedido y corte de caja)
 * 
 * Notas:
 * - Utiliza servicios externos para consumir la API
 * - Permite trabajar con datos dinámicos del backend
 * - Incluye utilidades para formateo de fechas
 * 
 * @package AP_Restaurante
 * @subpackage Reportes.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

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

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (local)
 */
function todayYMDLocal() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formatea fecha/hora a formato legible (es-MX)
 */
function formatDateTime(isoLike) {
  if (!isoLike) return '—';
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

const Reportes = () => {

  /**
   * Estados principales
   */
  const [fecha, setFecha] = useState(todayYMDLocal());
  const [finalizados, setFinalizados] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reporte, setReporte] = useState(null);
  const [idCorteCaja, setIdCorteCaja] = useState(null);
  const [modalDetallePedido, setModalDetallePedido] = useState(null);

  /**
   * Estados de historial
   */
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState('');
  const [historialCortes, setHistorialCortes] = useState([]);

  /**
   * Estados de detalle de corte
   */
  const [loadingDetalleCorte, setLoadingDetalleCorte] = useState(false);
  const [modalCorteCaja, setModalCorteCaja] = useState(null);

  /**
   * Genera el reporte del día
   */
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

  /**
   * Ejecutar al montar
   */
  useEffect(() => {
    generarReporte();
  }, []);

  /**
   * Cargar historial de cortes
   */
  const cargarHistorial = useCallback(async () => {
    setLoadingHistorial(true);
    setErrorHistorial('');

    try {
      const items = await fetchHistorialCorteCaja({ limit: 50, offset: 0 });
      setHistorialCortes(items);
    } catch (e) {
      setErrorHistorial(e?.message || 'No se pudo cargar el historial');
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  /**
   * Guarda el corte de caja
   */
  const guardarCorte = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await guardarCorteCajaDia({ fecha, finalizados });
      setReporte(res?.reporte || null);
      setIdCorteCaja(res?.id_corte_caja ?? null);
    } catch (e) {
      setError(e?.message || 'No se pudo guardar el corte');
    } finally {
      setLoading(false);
    }
  }, [fecha, finalizados]);

  /**
   * Resumen del reporte
   */
  const resumenCards = useMemo(() => {
    const r = reporte?.resumen;
    if (!r) return [];

    return [
      { label: 'Pedidos', value: String(r.num_pedidos ?? 0) },
      { label: 'Total ventas', value: `$${Number(r.total_ventas || 0).toFixed(2)}` },
      { label: 'Efectivo', value: `$${Number(r.total_efectivo || 0).toFixed(2)}` },
      { label: 'Tarjeta', value: `$${Number(r.total_tarjeta || 0).toFixed(2)}` },
    ];
  }, [reporte]);

  return (
    <div className={styles.dashboard}>
      {/* Encabezado */}
      <div className={styles.contentSection}>
        <h1 className={styles.greeting}>Reportes</h1>
        <p>Corte de caja del día</p>

        {/* Filtros */}
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={finalizados}
            onChange={(e) => setFinalizados(e.target.checked)}
          />
          Solo finalizados
        </label>

        <button onClick={guardarCorte} disabled={loading}>
          {loading ? 'Guardando...' : 'Generar corte'}
        </button>

        {/* Error */}
        {error && <div>{error}</div>}

        {/* Resumen */}
        {reporte && (
          <div>
            {resumenCards.map((c) => (
              <div key={c.label}>
                <strong>{c.label}:</strong> {c.value}
              </div>
            ))}
          </div>
        )}

        {/* Historial */}
        <h2>Historial de cortes</h2>
        <Table
          columns={[]}
          data={historialCortes}
          rowKey="id_corte_caja"
        />
      </div>
    </div>
  );
};

export default Reportes;