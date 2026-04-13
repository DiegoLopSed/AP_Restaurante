/**
 * Orders.jsx
 * 
 * Componente para mostrar el historial de pedidos del usuario.
 * 
 * Funcionalidades principales:
 * - Visualización de pedidos en tabla
 * - Indicadores visuales de estado (entregado, en preparación, cancelado)
 * - Barra de herramientas con filtros (UI preparada)
 * - Contador dinámico de pedidos
 * 
 * Nota:
 * Actualmente utiliza datos simulados (mock),
 * pero está listo para integrarse con una API.
 * @package AP_Restaurante
 * @subpackage Orders.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import styles from '../../assets/css/Orders.module.css';
import {
  ShoppingCartIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Orders = () => {

  /**
   * Datos simulados de pedidos
   */
  const orders = [
    { id: 'ORD-0018', cliente: 'Gonatoto', estado: 'Entregado', total: 30.0, hora: '12:45' },
    { id: 'ORD-0023', cliente: 'Gemtarto', estado: 'Cancelado', total: 286.0, hora: '13:10' },
    { id: 'ORD-0024', cliente: 'Cliente Ejemplo', estado: 'En preparación', total: 45.5, hora: '13:25' }
  ];

  return (
    <section className={styles.page}>

      {/* Encabezado */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis pedidos</h1>

          <p className={styles.subtitle}>
            Revisa el historial de tus pedidos recientes y su estado de forma clara y rápida.
          </p>
        </div>

        <div className={styles.headerIcon}>
          <ShoppingCartIcon className={styles.headerIconSvg} />
        </div>
      </header>

      {/* Barra de herramientas */}
      <div className={styles.toolbar}>

        {/* Botón de filtro (UI futura) */}
        <button className={styles.filterButton} type="button">
          <FunnelIcon className={styles.filterIcon} />
          <span>Filtrar pedidos</span>
        </button>

        <div className={styles.toolbarRight}>
          <span className={styles.badge}>
            <ClockIcon className={styles.badgeIcon} /> Hoy
          </span>

          {/* Contador dinámico */}
          <span className={styles.counter}>
            {orders.length} pedidos
          </span>
        </div>

      </div>

      {/* Contenido principal */}
      <div className={styles.content}>
        <div className={styles.tableWrapper}>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Hora</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={`${order.cliente}-${order.hora}`}>

                  {/* Cliente */}
                  <td>{order.cliente}</td>

                  {/* Estado con estilos dinámicos */}
                  <td>
                    <span
                      className={`${styles.status} ${
                        order.estado === 'Entregado'
                          ? styles.statusSuccess
                          : order.estado === 'En preparación'
                          ? styles.statusWarning
                          : styles.statusError
                      }`}
                    >

                      {/* Icono dinámico según estado */}
                      {order.estado === 'Entregado' && (
                        <CheckCircleIcon className={styles.statusIcon} />
                      )}

                      {order.estado === 'En preparación' && (
                        <ClockIcon className={styles.statusIcon} />
                      )}

                      {order.estado === 'Cancelado' && (
                        <XCircleIcon className={styles.statusIcon} />
                      )}

                      {order.estado}
                    </span>
                  </td>

                  {/* Total */}
                  <td>${order.total.toFixed(2)}</td>

                  {/* Hora */}
                  <td>{order.hora}</td>

                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

    </section>
  );
};

export default Orders;