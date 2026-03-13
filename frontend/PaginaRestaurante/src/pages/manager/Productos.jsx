import styles from '../../assets/css/ManagerDashboard.module.css';

const ManagerProductos = () => {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.greeting}>Crear productos</h1>
      <div className={styles.topSection}>
        <div className={styles.profileCard}>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>Nuevo producto</h2>
            <p className={styles.profileRole}>
              Aquí podrás registrar nuevos productos para el menú del restaurante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProductos;

