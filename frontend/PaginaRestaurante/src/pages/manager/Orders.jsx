import styles from '../../assets/css/Orders.module.css';
import { ShoppingCartIcon, FunnelIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Orders = () => {
  const orders = [
    { id: 'ORD-0018', cliente: 'Gonatoto', estado: 'Entregado', total: 30.0, hora: '12:45' },
    { id: 'ORD-0023', cliente: 'Gemtarto', estado: 'Cancelado', total: 286.0, hora: '13:10' },
    { id: 'ORD-0024', cliente: 'Cliente Ejemplo', estado: 'En preparación', total: 45.5, hora: '13:25' }
  ];

  return (
    <section className={styles.page}>
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

      <div className={styles.toolbar}>
        <button className={styles.filterButton} type="button">
          <FunnelIcon className={styles.filterIcon} />
          <span>Filtrar pedidos</span>
        </button>
        <div className={styles.toolbarRight}>
          <span className={styles.badge}>
            <ClockIcon className={styles.badgeIcon} /> Hoy
          </span>
          <span className={styles.counter}>{orders.length} pedidos</span>
        </div>
      </div>

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
                  <td>{order.cliente}</td>
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
                      {order.estado === 'Entregado' && <CheckCircleIcon className={styles.statusIcon} />}
                      {order.estado === 'En preparación' && <ClockIcon className={styles.statusIcon} />}
                      {order.estado === 'Cancelado' && <XCircleIcon className={styles.statusIcon} />}
                      {order.estado}
                    </span>
                  </td>
                  <td>${order.total.toFixed(2)}</td>
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

