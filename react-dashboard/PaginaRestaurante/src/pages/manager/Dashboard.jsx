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

const ManagerDashboard = () => {
  // Datos simulados del gerente
  const managerData = {
    nombre: 'Juan Pérez García',
    numeroNomina: '12345',
    puesto: 'Gerente',
    email: 'juan.perez@empresa.co',
    telefono: '+52 55 1234 5678',
    extension: '101',
    oficina: 'Oficina Principal - Piso 2',
    horario: 'Lunes a Viernes, 9:00 AM - 5:00 PM',
    ultimaActividad: 'Hace 2 horas - Registro de pedidos',
    estado: 'Activo - En servicio'
  };

  // KPIs simulados
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

  // Información adicional
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

  // Datos de actividad simulados para el gráfico
  const activityData = {
    value: '82 units',
    fechaIngreso: '20.570',
    trend: 'up'
  };

  // Pedidos recientes simulados
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
      <h1 className={styles.greeting}>Hola {managerData.nombre.split(' ')[0]} 👋</h1>
      
      {/* Sección superior: Perfil e Información Adicional */}
      <div className={styles.topSection}>
        {/* Tarjeta de perfil */}
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
        </div>
      </div>

      {/* Sección media: Detalles de contacto en grid */}
      <div className={styles.contactGrid}>
        <div className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <IdentificationIcon className="w-6 h-6" />
          </div>
          <div className={styles.contactLabel}>Número de nómina</div>
          <div className={styles.contactValue}>{managerData.numeroNomina}</div>
        </div>
        <div className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <BriefcaseIcon className="w-6 h-6" />
          </div>
          <div className={styles.contactLabel}>Puesto</div>
          <div className={styles.contactValue}>{managerData.puesto}</div>
        </div>
        <div className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <EnvelopeIcon className="w-6 h-6" />
          </div>
          <div className={styles.contactLabel}>Contacto</div>
          <div className={styles.contactValue}>{managerData.email}</div>
        </div>
        <div className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <PhoneIcon className="w-6 h-6" />
          </div>
          <div className={styles.contactLabel}>Teléfono</div>
          <div className={styles.contactValue}>{managerData.telefono}</div>
        </div>
      </div>

      {/* Sección inferior: Actividad y Pedidos */}
      <div className={styles.bottomSection}>
        {/* Resumen de actividad */}
        <div className={styles.activitySection}>
          <h3 className={styles.sectionTitle}>Resumen de Actividad</h3>
          <div className={styles.activityChart}>
            <div className={styles.chartBars}>
              {[60, 45, 80, 55, 70, 90, 82].map((height, index) => (
                <div 
                  key={index} 
                  className={styles.chartBar}
                  style={{ height: `${height}%` }}
                  role="img"
                  aria-label={`Actividad ${height}%`}
                />
              ))}
            </div>
          </div>
          <div className={styles.activityMetrics}>
            <div className={styles.activityMetric}>
              <span className={styles.activityMetricLabel}>Actividad de</span>
              <div className={styles.activityMetricValue}>
                <span>{activityData.value}</span>
                <span className={styles.trendUp}>↑</span>
              </div>
            </div>
            <div className={styles.activityMetric}>
              <span className={styles.activityMetricLabel}>Fecha de ingreso</span>
              <div className={styles.activityMetricValue}>
                <span>{activityData.fechaIngreso}</span>
                <span className={styles.trendUp}>↑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gestión de pedidos */}
        <div className={styles.ordersSection}>
          <div className={styles.ordersHeader}>
            <h3 className={styles.sectionTitle}>Gestión de Pedidos</h3>
            <button className={styles.filtersButton} aria-label="Filtros">
              Filtros <ChevronDownIcon className="w-4 h-4 inline" />
            </button>
          </div>
          <div className={styles.ordersContent}>
            <h4 className={styles.ordersSubtitle}>Pedidos recientes</h4>
            <div className={styles.ordersList} role="list">
              {recentOrders.map((order) => (
                <div key={order.id} className={styles.orderItem} role="listitem">
                  <div className={styles.orderAvatar}>{order.avatar}</div>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>Pedidos #{order.id}</div>
                    <div className={styles.orderClient}>{order.cliente}</div>
                  </div>
                  <div className={`${styles.orderAmount} ${order.monto < 0 ? styles.orderAmountNegative : ''}`}>
                    {order.monto < 0 ? '-' : ''} ${Math.abs(order.monto).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
