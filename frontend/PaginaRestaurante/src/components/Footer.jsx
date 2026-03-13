import styles from '../assets/css/Footer.module.css';

const Footer = ({ children }) => {
  return (
    <footer className={styles.footer} role="contentinfo">
      {children || (
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Restaurante Dashboard. Todos los derechos reservados.
        </p>
      )}
    </footer>
  );
};

export default Footer;

