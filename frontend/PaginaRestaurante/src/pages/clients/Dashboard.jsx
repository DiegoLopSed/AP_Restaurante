/**
 * Dashboard.jsx
 * 
 * Dashboard principal para clientes del sistema del restaurante.
 * 
 * Este componente muestra información relevante del cliente,
 * incluyendo métricas, historial de pedidos, recompensas y promociones.
 * 
 * Funcionalidades principales:
 * - Visualización de datos del cliente
 * - Métricas de actividad (bonos, pedidos, racha)
 * - Historial de pedidos recientes
 * - Recompensas disponibles (programa de lealtad)
 * - Promociones activas
 * 
 * Nota:
 * Actualmente utiliza datos simulados (mock data),
 * pero puede integrarse fácilmente con una API.
 * @package AP_Restaurante
 * @subpackage FrontendDashboard.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */
 

import styles from '../../assets/css/ClientDashboard.module.css';
import Card from '../../components/Card';
import {
  IdentificationIcon,
  ShoppingCartIcon,
  FireIcon,
  GiftIcon,
  TrophyIcon,
  TagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ClientDashboard = () => {

  /**
   * Datos simulados del cliente
   * En producción estos datos vendrían del backend/API
   */
  const clientData = {
    nombre: 'María González López',
    idCliente: 'CLI-2024-001',
    bonosAcumulados: 1250,
    rachaPedidos: 12,
    platilloPreferido: 'Tacos al Pastor'
  };

  /**
   * Lista de pedidos recientes del cliente
   */
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

  /**
   * Recompensas disponibles en el programa de lealtad
   */
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

  /**
   * Promociones activas del restaurante
   */
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

  return (
    <div className={styles.dashboard}>

      {/* Saludo personalizado */}
      <h1 className={styles.greeting}>
        Hola {clientData.nombre.split(' ')[0]} 👋
      </h1>

      {/* Información del cliente */}
      <section className={styles.clientInfoCard} aria-label="Información del cliente">
        <h2 className={styles.clientInfoTitle}>Información del cliente</h2>

        <div className={styles.clientInfoList}>

          {/* ID del cliente */}
          <div className={styles.clientInfoItem}>
            <span className={styles.clientInfoIcon} aria-hidden="true">
              <IdentificationIcon />
            </span>
            <div className={styles.clientInfoContent}>
              <div className={styles.clientInfoLabel}>ID de Cliente</div>
              <div className={styles.clientInfoValue}>{clientData.idCliente}</div>
            </div>
          </div>

          {/* Racha de pedidos */}
          <div className={styles.clientInfoItem}>
            <span className={styles.clientInfoIcon} aria-hidden="true">
              <FireIcon />
            </span>
            <div className={styles.clientInfoContent}>
              <div className={styles.clientInfoLabel}>Racha de pedidos</div>
              <div className={styles.clientInfoValue}>
                {clientData.rachaPedidos} días consecutivos
              </div>
            </div>
          </div>

          {/* Platillo favorito */}
          <div className={styles.clientInfoItem}>
            <span className={styles.clientInfoIcon} aria-hidden="true">
              <ShoppingCartIcon />
            </span>
            <div className={styles.clientInfoContent}>
              <div className={styles.clientInfoLabel}>Platillo preferido</div>
              <div className={styles.clientInfoValue}>
                {clientData.platilloPreferido}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Métricas del cliente */}
      <section className={styles.metricsSection} aria-label="Métricas y bonos">
        <div className={styles.metricsGrid}>

          {/* Bonos acumulados */}
          <Card
            title="Bonos acumulados"
            value={clientData.bonosAcumulados.toLocaleString()}
            subtitle="Puntos disponibles"
            icon={<GiftIcon />}
          />

          {/* Racha */}
          <Card
            title="Racha de pedidos"
            value={clientData.rachaPedidos}
            subtitle="Días consecutivos"
            icon={<FireIcon />}
            trend="up"
            trendPercentage="+3 esta semana"
          />

          {/* Total pedidos */}
          <Card
            title="Total de pedidos"
            value={recentOrders.length.toString()}
            subtitle="Últimos 30 días"
            icon={<ShoppingCartIcon />}
          />

        </div>
      </section>

      {/* Sección inferior */}
      <div className={styles.bottomSection}>

        {/* Historial de pedidos */}
        <section className={styles.ordersSection} aria-label="Historial de pedidos">
          <h3 className={styles.sectionTitle}>Pedidos recientes</h3>

          <div className={styles.ordersList}>
            {recentOrders.map((order) => (
              <article key={order.id} className={styles.orderCard}>

                {/* Encabezado del pedido */}
                <div className={styles.orderHeader}>
                  <div className={styles.orderDate}>
                    {new Date(order.fecha).toLocaleDateString('es-MX')}
                  </div>
                  <div className={styles.orderStatus}>
                    <CheckCircleIcon />
                    <span>{order.estado}</span>
                  </div>
                </div>

                {/* Cuerpo del pedido */}
                <div className={styles.orderBody}>
                  <div className={styles.orderImage}>
                    <div className={styles.orderImagePlaceholder}>
                      <ShoppingCartIcon />
                    </div>
                  </div>

                  <div className={styles.orderDetails}>
                    <div className={styles.orderItem}>{order.platillo}</div>
                    <div className={styles.orderQuantity}>
                      Cantidad: {order.cantidad}
                    </div>
                    <div className={styles.orderTotal}>
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                </div>

              </article>
            ))}
          </div>
        </section>

        {/* Beneficios y promociones */}
        <section className={styles.benefitsSection} aria-label="Beneficios y promociones">

          {/* Recompensas */}
          <div className={styles.rewardsContainer}>
            <h3 className={styles.sectionTitle}>Recompensas disponibles</h3>

            <div className={styles.rewardsList}>
              {rewards.map((reward) => (
                <article
                  key={reward.id}
                  className={`${styles.rewardCard} ${
                    !reward.disponible ? styles.rewardCardDisabled : ''
                  }`}
                >
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

          {/* Promociones */}
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
                    <p className={styles.promotionValid}>
                      Válido hasta: {new Date(promo.validoHasta).toLocaleDateString('es-MX')}
                    </p>
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