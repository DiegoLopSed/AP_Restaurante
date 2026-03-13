import styles from '../../assets/css/UserDashboard.module.css';

const UserProfile = () => {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.greeting}>Mi Perfil</h1>
      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Página de perfil</div>
          <div className={styles.infoValue}>En construcción</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

