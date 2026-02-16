import styles from '../../assets/css/UserDashboard.module.css';
import {
  UserIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  // Datos simulados del usuario
  const userData = {
    nombre: 'Juan Pérez García',
    rfc: 'PEGJ850315ABC',
    numeroNomina: '12345',
    puesto: 'Mesero',
    departamento: 'Servicio',
    fechaIngreso: '2022-03-15',
    horario: 'Lunes a Viernes, 9:00 AM - 5:00 PM',
    ultimaActividad: 'Hace 2 horas - Registro de pedidos',
    estado: 'Activo - En servicio'
  };

  // Información adicional
  const additionalInfo = [
    {
      id: 1,
      icon: <ClockIcon />,
      label: 'Horario de trabajo',
      description: userData.horario
    },
    {
      id: 2,
      icon: <ArrowPathIcon />,
      label: 'Última actividad',
      description: userData.ultimaActividad
    },
    {
      id: 3,
      icon: <CheckCircleIcon />,
      label: 'Estado actual',
      description: userData.estado
    }
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.greeting}>Hola {userData.nombre.split(' ')[0]} 👋</h1>
      
      {/* Sección superior: Perfil e Información Adicional */}
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
              <h2 className={styles.profileName}>{userData.nombre}</h2>
              <p className={styles.profileRole}>{userData.puesto}</p>
            </div>
          </header>
        </article>

        {/* Información adicional */}
        <section className={styles.additionalInfoCard} aria-label="Información adicional">
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
        </section>
      </div>

      {/* Sección media: Detalles principales en grid */}
      <section className={styles.detailsGrid} aria-label="Detalles del empleado">
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

