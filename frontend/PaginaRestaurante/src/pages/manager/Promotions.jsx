/**
 * Promotions.jsx
 * 
 * Componente para la visualización de promociones disponibles
 * dentro de la aplicación.
 * 
 * Funcionalidades principales:
 * - Renderizado de promociones en formato de tarjetas (cards)
 * - Indicadores visuales de estado (Activa, Borrador)
 * - Información de vigencia de cada promoción
 * - Botón de acción para futura configuración
 * 
 * Características:
 * - Uso de datos simulados (mock)
 * - Diseño responsivo con grid
 * - Estilos dinámicos según estado de la promoción
 * - Uso de iconografía para mejorar la experiencia visual
 * 
 * 
 * @package AP_Restaurante
 * @subpackage Promotions.jsx
 * @author Andres Manuel Amaro Ramirez
 * @version 1.0.0
 */

import styles from '../../assets/css/Promotions.module.css';
import { TagIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Promotions = () => {

  /**
   * Datos simulados de promociones
   */
  const promotions = [
    {
      id: 1,
      nombre: '2x1 en hamburguesas',
      descripcion: 'Válido de lunes a jueves después de las 6 PM.',
      estado: 'Activa',
      vigencia: 'Hasta 31/03/2026'
    },
    {
      id: 2,
      nombre: 'Descuento clientes frecuentes',
      descripcion: '10% de descuento en toda la cuenta para clientes de lealtad.',
      estado: 'Activa',
      vigencia: 'Sin fecha de término'
    },
    {
      id: 3,
      nombre: 'Menú ejecutivo',
      descripcion: 'Precio especial en combo del día entre 1 PM y 4 PM.',
      estado: 'Borrador',
      vigencia: 'Próximamente'
    }
  ];

  return (
    <section className={styles.page}>

      {/* Encabezado */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Promociones</h1>
          <p className={styles.subtitle}>
            Descubre las promociones activas y beneficios disponibles.
          </p>
        </div>

        <div className={styles.headerIcon}>
          <SparklesIcon className={styles.headerIconSvg} />
        </div>
      </header>

      {/* Contenido principal */}
      <div className={styles.content}>
        <div className={styles.grid}>

          {promotions.map((promo) => (
            <article key={promo.id} className={styles.card}>

              {/* Header de la tarjeta */}
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <TagIcon className={styles.cardIconSvg} />
                </div>

                <div className={styles.cardTitleGroup}>
                  <h2 className={styles.cardTitle}>{promo.nombre}</h2>

                  {/* Estado dinámico */}
                  <span
                    className={`${styles.status} ${
                      promo.estado === 'Activa'
                        ? styles.statusActive
                        : styles.statusDraft
                    }`}
                  >
                    {promo.estado}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              <p className={styles.cardDescription}>
                {promo.descripcion}
              </p>

              {/* Footer */}
              <div className={styles.cardFooter}>
                <span className={styles.vigencia}>
                  {promo.vigencia}
                </span>

                <button className={styles.primaryButton} type="button">
                  Configurar
                </button>
              </div>

            </article>
          ))}

        </div>
      </div>

    </section>
  );
};

export default Promotions;