/**
 * ManagerDashboard.jsx
 * 
 * Dashboard principal para el administrador (gerente) del sistema.
 * 
 * Este componente muestra información relevante del usuario administrador,
 * métricas del sistema y actividad reciente.
 * 
 * Funcionalidades principales:
 * - Visualización de perfil del gerente
 * - KPIs (indicadores clave del negocio)
 * - Información de contacto y estado
 * - Resumen de actividad (gráfica simulada)
 * - Lista de pedidos recientes
 * 
 * Nota:
 * Algunos datos son simulados (mock data), pero están preparados
 * para integrarse con una API real.
 * @package AP_Restaurante
 * @subpackage ManagerDashboard.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import styles from '../../assets/css/ManagerDashboard.module.css';
import Card from '../../components/Card';
import {
  UserIcon,
  BriefcaseIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ManagerDashboard = () => {

  // Obtiene datos del usuario autenticado
  const { usuario } = useAuth();

  /**
   * Información del gerente
   * Se construye dinámicamente desde el contexto
   */
  const managerData = {
    nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Gerente',
    numeroNomina: usuario?.id_colaborador || 'N/D',
    puesto: usuario?.posicion || 'Sin posición asignada',
    email: usuario?.correo || 'N/D',
    telefono: usuario?.telefono || 'N/D',
    extension: 'N/D',
    oficina: 'Oficina Principal',
    horario: 'Lunes a Viernes, 9:00 AM - 5:00 PM',
    ultimaActividad: 'Sesión actual',
    estado: 'Activo - En servicio'
  };

  /**
   * KPIs del sistema (datos simulados)
   */
  const kpis = [
    {
      id: 1,
      title: 'Ordenes totales',
      value: '423',
      subtitle: 'Total de órdenes procesadas',
      trend: 'up',
      trendPercentage: '16% this month',
      icon: <ShoppingCartIcon className="w-6 h-6" />
    },
    {
      id: 2,
      title: 'Ganancias totales',
      value: '$ 1,893',
      subtitle: 'Ganancia neta del período',
      trend: 'down',
      trendPercentage: '1% this month',
      icon: <CurrencyDollarIcon className="w-6 h-6" />
    },
    {
      id: 3,
      title: 'Total de compras',
      value: '189',
      subtitle: 'Pedidos de compra realizados',
      icon: <DocumentIcon className="w-6 h-6" />
    }
  ];

  /**
   * Información adicional del usuario
   */
  const additionalInfo = [
    {
      id: 1,
      icon: <ClockIcon className="w-6 h-6" />,
      label: 'Horario de trabajo',
      description: managerData.horario
    },
    {
      id: 2,
      icon: <ArrowPathIcon className="w-6 h-6" />,
      label: 'Última actividad',
      description: managerData.ultimaActividad
    },
    {
      id: 3,
      icon: <CheckCircleIcon className="w-6 h-6" />,
      label: 'Estado actual',
      description: managerData.estado
    }
  ];

  /**
   * Datos simulados para gráfica de actividad
   */
  const activityData = {
    value: '82 units',
    fechaIngreso: '20.570',
    trend: 'up'
  };

  /**
   * Pedidos recientes simulados
   */
  const recentOrders = [
    {
      id: 18,
      cliente: 'Gonatoto',
      monto: 30.00,
      avatar: <UserIcon className="w-5 h-5" />
    },
    {
      id: 23,
      cliente: 'Gemtarto',
      monto: -286.00,
      avatar: <UserIcon className="w-5 h-5" />
    },
    {
      id: 24,
      cliente: 'Cliente Ejemplo',
      monto: 45.50,
      avatar: <UserIcon className="w-5 h-5" />
    }
  ];

  return (
    <div className={styles.dashboard}>

      {/* Saludo */}
      <h1 className={styles.greeting}>
        Hola {managerData.nombre.split(' ')[0]} 👋
      </h1>

      {/* Sección superior */}
      <div className={styles.topSection}>

        {/* Perfil */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatarContainer}>
              <div className={styles.profileAvatar}>
                <UserIcon className="w-12 h-12" />
              </div>
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{managerData.nombre}</h2>
              <p className={styles.profileRole}>{managerData.puesto}</p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className={styles.additionalInfoCard}>
          <h3 className={styles.additionalInfoTitle}>Información adicional</h3>

          <div className={styles.additionalInfoList}>
            {additionalInfo.map((item) => (
              <div key={item.id} className={styles.additionalInfoItem}>
                <span className={styles.additionalInfoIcon}>
                  {item.icon}
                </span>

                <div className={styles.additionalInfoContent}>
                  <div className={styles.additionalInfoLabel}>{item.label}</div>
                  <div className={styles.additionalInfoDescription}>{item.description}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Datos de contacto */}
      <div className={styles.contactGrid}>
        {/* Tarjetas de info */}
      </div>

      {/* Sección inferior */}
      <div className={styles.bottomSection}>

        {/* Actividad */}
        <div className={styles.activitySection}>
          <h3 className={styles.sectionTitle}>Resumen de Actividad</h3>

          {/* Gráfica simulada */}
          <div className={styles.activityChart}>
            <div className={styles.chartBars}>
              {[60, 45, 80, 55, 70, 90, 82].map((height, index) => (
                <div
                  key={index}
                  className={styles.chartBar}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pedidos */}
        <div className={styles.ordersSection}>
          <div className={styles.ordersHeader}>
            <h3 className={styles.sectionTitle}>Gestión de Pedidos</h3>

            <button className={styles.filtersButton}>
              Filtros <ChevronDownIcon className="w-4 h-4 inline" />
            </button>
          </div>

          <div className={styles.ordersList}>
            {recentOrders.map((order, index) => (
              <div key={index} className={styles.orderItem}>
                <div className={styles.orderAvatar}>{order.avatar}</div>
                <div className={styles.orderInfo}>
                  <div>{order.cliente}</div>
                </div>
                <div className={styles.orderAmount}>
                  ${order.monto.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};

export default ManagerDashboard;