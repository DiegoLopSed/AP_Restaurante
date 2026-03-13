import styles from '../assets/css/Card.module.css';

const Card = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendPercentage, 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <article className={`${styles.card} ${className}`} {...props}>
      {children ? (
        children
      ) : (
        <>
          <div className={styles.cardHeader}>
            {icon && (
              <div className={styles.iconContainer}>
                {icon}
              </div>
            )}
            <div className={styles.cardTitleContainer}>
              <h3 className={styles.cardTitle}>{title}</h3>
              {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
            </div>
          </div>
          {value && (
            <div className={styles.cardValue}>
              <span className={styles.value}>{value}</span>
              {trend && trendPercentage && (
                <span className={`${styles.trend} ${styles[`trend${trend}`]}`}>
                  {trend === 'up' ? '↑' : '↓'} {trendPercentage}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
};

export default Card;

