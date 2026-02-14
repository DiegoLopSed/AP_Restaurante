import styles from '../../assets/css/ClientDashboard.module.css';
import Card from '../../components/Card';
import Table from '../../components/Table';
import {
  UserIcon,
  IdentificationIcon,
  ShoppingCartIcon,
  FireIcon,
  GiftIcon,
  TrophyIcon,
  TagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ClientDashboard = () => {
  // Datos simulados del cliente
  const clientData = {
    nombre: 'María González López',
    idCliente: 'CLI-2024-001',
    bonosAcumulados: 1250,
    rachaPedidos: 12,
    platilloPreferido: 'Tacos al Pastor'
  };

  // Pedidos recientes
  const recentOrders = [
    {
      id: 1,
      fecha: '2024-12-10',
      platillo: 'Tacos al Pastor',
      cantidad: 3,
      total: 150.00,
      estado: 'Completado'
    },
    {
      id: 2,
      fecha: '2024-12-08',
      platillo: 'Quesadillas',
      cantidad: 2,
      total: 120.00,
      estado: 'Completado'
    },
    {
      id: 3,
      fecha: '2024-12-05',
      platillo: 'Tacos al Pastor',
      cantidad: 4,
      total: 200.00,
      estado: 'Completado'
    },
    {
      id: 4,
      fecha: '2024-12-03',
      platillo: 'Burritos',
      cantidad: 2,
      total: 180.00,
      estado: 'Completado'
    }
  ];

  // Recompensas disponibles
  const rewards = [
    {
      id: 1,
      titulo: 'Descuento 10%',
      descripcion: 'En tu próxima compra',
      puntos: 500,
      disponible: true
    },
    {
      id: 2,
      titulo: 'Bebida gratis',
      descripcion: 'Con cualquier platillo',
      puntos: 300,
      disponible: true
    },
    {
      id: 3,
      titulo: 'Postre gratis',
      descripcion: 'En pedidos mayores a $200',
      puntos: 200,
      disponible: false
    }
  ];

  // Promociones activas
  const promotions = [
    {
      id: 1,
      titulo: 'Martes de Tacos',
      descripcion: '2x1 en todos los tacos',
      validoHasta: '2024-12-31'
    },
    {
      id: 2,
      titulo: 'Fin de semana especial',
      descripcion: '15% de descuento en pedidos mayores a $300',
      validoHasta: '2024-12-31'
    }
  ];

  // Columnas para la tabla de pedidos
  const orderColumns = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'platillo', label: 'Platillo' },
    { key: 'cantidad', label: 'Cantidad' },
    { 
      key: 'total', 
      label: 'Total',
      render: (value) => `$${value.toFixed(2)}`
    },
    { key: 'estado', label: 'Estado' }
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.greeting}>Hola {clientData.nombre.split(' ')[0]} 👋</h1>
      
      {/* Sección superior: Perfil e Información del Cliente */}
      <div className={styles.topSection}>
        {/* Tarjeta de perfil */}
        <article className={styles.profileCard}>
          <header className={styles.profileHeader}>
            <div className={styles.profileAvatarContainer}>
              <div className={styles.profileAvatar}>
                <UserIcon />
              </div>
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{clientData.nombre}</h2>
              <p className={styles.profileRole}>Cliente Frecuente</p>
            </div>
          </header>
        </article>

        {/* Información del cliente */}
        <section className={styles.clientInfoCard} aria-label="Información del cliente">
          <h3 className={styles.clientInfoTitle}>Información del cliente</h3>
          <div className={styles.clientInfoList}>
            <div className={styles.clientInfoItem}>
              <span className={styles.clientInfoIcon} aria-hidden="true">
                <IdentificationIcon />
              </span>
              <div className={styles.clientInfoContent}>
                <div className={styles.clientInfoLabel}>ID de Cliente</div>
                <div className={styles.clientInfoValue}>{clientData.idCliente}</div>
              </div>
            </div>
            <div className={styles.clientInfoItem}>
              <span className={styles.clientInfoIcon} aria-hidden="true">
                <FireIcon />
              </span>
              <div className={styles.clientInfoContent}>
                <div className={styles.clientInfoLabel}>Racha de pedidos</div>
                <div className={styles.clientInfoValue}>{clientData.rachaPedidos} días consecutivos</div>
              </div>
            </div>
            <div className={styles.clientInfoItem}>
              <span className={styles.clientInfoIcon} aria-hidden="true">
                <ShoppingCartIcon />
              </span>
              <div className={styles.clientInfoContent}>
                <div className={styles.clientInfoLabel}>Platillo preferido</div>
                <div className={styles.clientInfoValue}>{clientData.platilloPreferido}</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sección media: Métricas y Bonos */}
      <section className={styles.metricsSection} aria-label="Métricas y bonos">
        <div className={styles.metricsGrid}>
          <Card
            title="Bonos acumulados"
            value={clientData.bonosAcumulados.toLocaleString()}
            subtitle="Puntos disponibles"
            icon={<GiftIcon />}
          />
          <Card
            title="Racha de pedidos"
            value={clientData.rachaPedidos}
            subtitle="Días consecutivos"
            icon={<FireIcon />}
            trend="up"
            trendPercentage="+3 esta semana"
          />
          <Card
            title="Total de pedidos"
            value={recentOrders.length.toString()}
            subtitle="Últimos 30 días"
            icon={<ShoppingCartIcon />}
          />
        </div>
      </section>

      {/* Sección inferior: Pedidos y Beneficios */}
      <div className={styles.bottomSection}>
        {/* Historial de pedidos */}
        <section className={styles.ordersSection} aria-label="Historial de pedidos">
          <h3 className={styles.sectionTitle}>Pedidos recientes</h3>
          <div className={styles.ordersList}>
            {recentOrders.map((order) => (
              <article key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderDate}>{new Date(order.fecha).toLocaleDateString('es-MX')}</div>
                  <div className={styles.orderStatus}>
                    <CheckCircleIcon />
                    <span>{order.estado}</span>
                  </div>
                </div>
                <div className={styles.orderBody}>
                  <div className={styles.orderImage}>
                    <div className={styles.orderImagePlaceholder}>
                      <ShoppingCartIcon />
                    </div>
                  </div>
                  <div className={styles.orderDetails}>
                    <div className={styles.orderItem}>{order.platillo}</div>
                    <div className={styles.orderQuantity}>Cantidad: {order.cantidad}</div>
                    <div className={styles.orderTotal}>${order.total.toFixed(2)}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Beneficios y promociones */}
        <section className={styles.benefitsSection} aria-label="Beneficios y promociones">
          <div className={styles.rewardsContainer}>
            <h3 className={styles.sectionTitle}>Recompensas disponibles</h3>
            <div className={styles.rewardsList}>
              {rewards.map((reward) => (
                <article key={reward.id} className={`${styles.rewardCard} ${!reward.disponible ? styles.rewardCardDisabled : ''}`}>
                  <div className={styles.rewardIcon}>
                    <TrophyIcon />
                  </div>
                  <div className={styles.rewardContent}>
                    <h4 className={styles.rewardTitle}>{reward.titulo}</h4>
                    <p className={styles.rewardDescription}>{reward.descripcion}</p>
                    <div className={styles.rewardPoints}>
                      {reward.puntos} puntos
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.promotionsContainer}>
            <h3 className={styles.sectionTitle}>Promociones activas</h3>
            <div className={styles.promotionsList}>
              {promotions.map((promo) => (
                <article key={promo.id} className={styles.promotionCard}>
                  <div className={styles.promotionIcon}>
                    <TagIcon />
                  </div>
                  <div className={styles.promotionContent}>
                    <h4 className={styles.promotionTitle}>{promo.titulo}</h4>
                    <p className={styles.promotionDescription}>{promo.descripcion}</p>
                    <p className={styles.promotionValid}>Válido hasta: {new Date(promo.validoHasta).toLocaleDateString('es-MX')}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClientDashboard;

