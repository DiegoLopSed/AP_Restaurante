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
  const { usuario } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [registrosLoading, setRegistrosLoading] = useState(true);
  const [registrosError, setRegistrosError] = useState('');

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
          setRegistrosError(e?.message || 'No se pudieron cargar los registros');
        }
      } finally {
        if (!cancelled) setRegistrosLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resumenRegistros = useMemo(() => {
    const n = registros.length;
    const monto = registros.reduce((acc, p) => acc + Number(p.total || 0), 0);
    return { n, monto };
  }, [registros]);

  const columnasRegistros = useMemo(
    () => [
      { key: 'nombre_cliente', label: 'Cliente' },
      {
        key: 'total',
        label: 'Total',
        render: (_, row) => `$${Number(row.total || 0).toFixed(2)}`,
      },
      {
        key: 'metodo_pago_nombre',
        label: 'Pago',
        render: (v) => (v != null && String(v).trim() !== '' ? String(v).trim() : '—'),
      },
      {
        key: 'hora_salida',
        label: 'Finalizado',
        render: (v) => formatearFechaHora(v),
      },
    ],
    []
  );

  const userData = {
    nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Colaborador',
    rfc: usuario?.rfc || 'N/D',
    numeroNomina: usuario?.id_colaborador || 'N/D',
    puesto: usuario?.posicion || 'Sin posición asignada',
    departamento: 'Operaciones',
    fechaIngreso: 'N/D',
    horario: 'Lunes a Viernes, 9:00 AM - 5:00 PM',
    ultimaActividad: 'Sesión actual',
    estado: 'Activo',
  };

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
      <h1 className={styles.greeting}>
        Hola {userData.nombre.split(' ')[0]} 👋
      </h1>

      <section className={styles.additionalInfoCard} aria-label="Registros de pedidos finalizados">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: 'var(--spacing-md)',
            flexWrap: 'wrap',
          }}
        >
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
            aria-hidden
          >
            <ClipboardDocumentListIcon style={{ width: 22, height: 22 }} />
          </span>
          <h2 className={styles.additionalInfoTitle} style={{ marginBottom: 0 }}>
            Registros
          </h2>
        </div>
        <p
          style={{
            margin: '0 0 var(--spacing-md) 0',
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-light)',
          }}
        >
          Resumen de pedidos que has finalizado (solo estatus finalizado). Coinciden con tu nombre como
          mesero en el sistema.
        </p>

        {registrosError && (
          <div
            style={{
              padding: '12px',
              background: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {registrosError}
          </div>
        )}

        {!registrosLoading && !registrosError && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-light)' }}>
                Pedidos finalizados
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
                {resumenRegistros.n}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-light)' }}>
                Monto total registrado
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
                ${resumenRegistros.monto.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <Table
          columns={columnasRegistros}
          data={registros}
          rowKey="id_pedido"
          emptyMessage={
            registrosLoading
              ? 'Cargando registros…'
              : 'No hay pedidos finalizados a tu nombre. Al cerrar pedidos en Mis pedidos, aparecerán aquí.'
          }
        />
      </section>

      <section className={styles.additionalInfoCard} aria-label="Información adicional">
        <h2 className={styles.additionalInfoTitle}>Información adicional</h2>
        <div className={styles.additionalInfoList}>
          {additionalInfo.map((item) => (
            <div key={item.id} className={styles.additionalInfoItem}>
              <span className={styles.additionalInfoIcon} aria-hidden="true">
                {item.icon}
              </span>
              <div className={styles.additionalInfoContent}>
                <div className={styles.additionalInfoLabel}>{item.label}</div>
                <div className={styles.additionalInfoDescription}>{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.contactGrid} aria-label="Detalles del empleado">
        <article className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <IdentificationIcon />
          </div>
          <div className={styles.contactLabel}>RFC</div>
          <div className={styles.contactValue}>{userData.rfc}</div>
        </article>
        <article className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <IdentificationIcon />
          </div>
          <div className={styles.contactLabel}>Número de nómina</div>
          <div className={styles.contactValue}>{userData.numeroNomina}</div>
        </article>
        <article className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <BriefcaseIcon />
          </div>
          <div className={styles.contactLabel}>Puesto</div>
          <div className={styles.contactValue}>{userData.puesto}</div>
        </article>
        <article className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <BriefcaseIcon />
          </div>
          <div className={styles.contactLabel}>Departamento</div>
          <div className={styles.contactValue}>{userData.departamento}</div>
        </article>
      </section>
    </div>
  );
};

export default UserDashboard;
