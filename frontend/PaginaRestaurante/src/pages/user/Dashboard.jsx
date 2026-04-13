/**
 * Dashboard.jsx
 * 
 * Panel principal del usuario (colaborador) dentro del sistema.
 * 
 * Funcionalidades principales:
 * - Visualización de información básica del usuario autenticado
 * - Consulta y listado de pedidos finalizados asociados al usuario
 * - Cálculo de métricas (total de pedidos y monto acumulado)
 * - Renderizado de tabla con historial de registros
 * - Sección de información adicional (estado, horario, actividad)
 * - Visualización de datos laborales (RFC, nómina, puesto, departamento)
 * 
 * Características:
 * - Uso de contexto de autenticación (useAuth)
 * - Manejo de estados: carga, error y datos vacíos
 * - Optimización de cálculos con useMemo
 * - Formateo de fechas en formato local (es-MX)
 * 
 * Integraciones:
 * - fetchPedidosRegistrosFinalizados(): obtiene pedidos finalizados del usuario
 * - Table: componente reutilizable para mostrar datos tabulares
 * - Heroicons: iconografía visual
 * 
 * Nota:
 * Este dashboard está enfocado al rol operativo (ej. meseros),
 * mostrando únicamente los pedidos que han finalizado.
 * 
 * @package AP_Restaurante
 * @subpackage UserDashboard.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import { useEffect, useMemo, useState } from 'react';
import styles from '../../assets/css/ManagerDashboard.module.css';
import {
  IdentificationIcon,
  BriefcaseIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Table from '../../components/Table';
import { fetchPedidosRegistrosFinalizados } from '../../services/pedidos';

/**
 * Formatea fechas a formato local (México)
 */
function formatearFechaHora(val) {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

const UserDashboard = () => {

  /**
   * Usuario autenticado desde contexto
   */
  const { usuario } = useAuth();

  /**
   * Estados de registros
   */
  const [registros, setRegistros] = useState([]);
  const [registrosLoading, setRegistrosLoading] = useState(true);
  const [registrosError, setRegistrosError] = useState('');

  /**
   * Carga de pedidos finalizados del usuario
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setRegistrosLoading(true);
      setRegistrosError('');

      try {
        const data = await fetchPedidosRegistrosFinalizados();
        if (!cancelled) setRegistros(data);
      } catch (e) {
        if (!cancelled) {
          setRegistros([]);
          setRegistrosError(
            e?.message || 'No se pudieron cargar los registros'
          );
        }
      } finally {
        if (!cancelled) setRegistrosLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Resumen de métricas
   */
  const resumenRegistros = useMemo(() => {
    const n = registros.length;
    const monto = registros.reduce(
      (acc, p) => acc + Number(p.total || 0),
      0
    );
    return { n, monto };
  }, [registros]);

  /**
   * Columnas de la tabla
   */
  const columnasRegistros = useMemo(
    () => [
      { key: 'nombre_cliente', label: 'Cliente' },
      {
        key: 'total',
        label: 'Total',
        render: (_, row) =>
          `$${Number(row.total || 0).toFixed(2)}`,
      },
      {
        key: 'metodo_pago_nombre',
        label: 'Pago',
        render: (v) =>
          v != null && String(v).trim() !== ''
            ? String(v).trim()
            : '—',
      },
      {
        key: 'hora_salida',
        label: 'Finalizado',
        render: (v) => formatearFechaHora(v),
      },
    ],
    []
  );

  /**
   * Datos del usuario para visualización
   */
  const userData = {
    nombre: usuario
      ? `${usuario.nombre} ${usuario.apellido}`
      : 'Colaborador',
    rfc: usuario?.rfc || 'N/D',
    numeroNomina: usuario?.id_colaborador || 'N/D',
    puesto: usuario?.posicion || 'Sin posición asignada',
    departamento: 'Operaciones',
    fechaIngreso: 'N/D',
    horario: 'Lunes a Viernes, 9:00 AM - 5:00 PM',
    ultimaActividad: 'Sesión actual',
    estado: 'Activo',
  };

  /**
   * Información adicional del usuario
   */
  const additionalInfo = [
    {
      id: 1,
      icon: <ClockIcon />,
      label: 'Horario de trabajo',
      description: userData.horario,
    },
    {
      id: 2,
      icon: <ArrowPathIcon />,
      label: 'Última actividad',
      description: userData.ultimaActividad,
    },
    {
      id: 3,
      icon: <CheckCircleIcon />,
      label: 'Estado actual',
      description: userData.estado,
    },
  ];

  return (
    <div className={styles.dashboard}>

      {/* Saludo */}
      <h1 className={styles.greeting}>
        Hola {userData.nombre.split(' ')[0]} 👋
      </h1>

      {/* Sección de registros */}
      <section
        className={styles.additionalInfoCard}
        aria-label="Registros de pedidos finalizados"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--color-secondary)',
              color: 'var(--color-primary)',
            }}
          >
            <ClipboardDocumentListIcon style={{ width: 22, height: 22 }} />
          </span>

          <h2 className={styles.additionalInfoTitle} style={{ marginBottom: 0 }}>
            Registros
          </h2>
        </div>

        <p style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-small)', color: 'var(--color-text-light)' }}>
          Resumen de pedidos que has finalizado en el sistema.
        </p>

        {/* Error */}
        {registrosError && (
          <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px' }}>
            {registrosError}
          </div>
        )}

        {/* Resumen */}
        {!registrosLoading && !registrosError && (
          <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <div>Pedidos finalizados</div>
              <strong>{resumenRegistros.n}</strong>
            </div>
            <div>
              <div>Monto total</div>
              <strong>${resumenRegistros.monto.toFixed(2)}</strong>
            </div>
          </div>
        )}

        {/* Tabla */}
        <Table
          columns={columnasRegistros}
          data={registros}
          rowKey="id_pedido"
          emptyMessage={
            registrosLoading
              ? 'Cargando registros…'
              : 'No hay pedidos finalizados.'
          }
        />
      </section>

      {/* Información adicional */}
      <section className={styles.additionalInfoCard}>
        <h2 className={styles.additionalInfoTitle}>
          Información adicional
        </h2>

        <div className={styles.additionalInfoList}>
          {additionalInfo.map((item) => (
            <div key={item.id} className={styles.additionalInfoItem}>
              <span className={styles.additionalInfoIcon}>
                {item.icon}
              </span>
              <div>
                <div>{item.label}</div>
                <div>{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Datos del empleado */}
      <section className={styles.contactGrid}>
        <article className={styles.contactCard}>
          <IdentificationIcon />
          <div>RFC</div>
          <div>{userData.rfc}</div>
        </article>

        <article className={styles.contactCard}>
          <IdentificationIcon />
          <div>Nómina</div>
          <div>{userData.numeroNomina}</div>
        </article>

        <article className={styles.contactCard}>
          <BriefcaseIcon />
          <div>Puesto</div>
          <div>{userData.puesto}</div>
        </article>

        <article className={styles.contactCard}>
          <BriefcaseIcon />
          <div>Departamento</div>
          <div>{userData.departamento}</div>
        </article>
      </section>

    </div>
  );
};

export default UserDashboard;