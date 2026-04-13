/**
 * Profile.jsx
 * 
 * Componente para la visualización del perfil del usuario.
 * 
 * Funcionalidades:
 * - Muestra una sección informativa del perfil
 * - Indica el estado actual de la página (en construcción)
 * 
 * Características:
 * - Uso de estilos reutilizables del dashboard
 * - Estructura preparada para futuras funcionalidades
 * 
 * Nota:
 * Este módulo servirá para visualizar y editar datos del usuario
 * en futuras versiones del sistema.
 * 
 * @package AP_Restaurante
 * @subpackage Profile.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import styles from '../../assets/css/ManagerDashboard.module.css';

const UserProfile = () => {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.greeting}>Mi perfil</h1>

      <section className={styles.additionalInfoCard} aria-label="Estado del perfil">
        <h2 className={styles.additionalInfoTitle}>Estado</h2>
        <div className={styles.additionalInfoList}>
          <div className={styles.additionalInfoItem}>
            <div className={styles.additionalInfoContent}>
              <div className={styles.additionalInfoLabel}>Página de perfil</div>
              <div className={styles.additionalInfoDescription}>
                En construcción. Aquí podrás ver y editar tus datos cuando esté disponible.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserProfile;
