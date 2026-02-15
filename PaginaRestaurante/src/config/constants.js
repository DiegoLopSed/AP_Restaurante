/**
 * Constantes globales y recursos compartidos
 * Placeholders de imágenes y otros recursos reutilizables
 */

// Servicio de placeholder de imágenes (placeholder.com)
const PLACEHOLDER_BASE = 'https://via.placeholder.com';

/**
 * Genera una URL de placeholder con dimensiones personalizadas
 * @param {number} width - Ancho en píxeles
 * @param {number} height - Alto en píxeles (opcional, por defecto igual al ancho)
 * @param {string} text - Texto opcional para mostrar en la imagen
 * @param {string} bgColor - Color de fondo (opcional, formato hex sin #)
 * @param {string} textColor - Color del texto (opcional, formato hex sin #)
 * @returns {string} URL del placeholder
 */
export const getPlaceholderImage = (
  width = 400,
  height = null,
  text = '',
  bgColor = 'cccccc',
  textColor = '666666'
) => {
  const h = height || width;
  const params = new URLSearchParams({
    size: `${width}x${h}`,
    bg: bgColor,
    text: text || `${width}x${h}`,
    fg: textColor,
  });
  return `${PLACEHOLDER_BASE}/${width}x${h}?${params.toString()}`;
};

/**
 * Placeholders predefinidos para diferentes usos
 */
export const PLACEHOLDERS = {
  // Imágenes de productos/comida
  PRODUCT: {
    SMALL: getPlaceholderImage(200, 200, 'Producto', 'f5f5f5', '333333'),
    MEDIUM: getPlaceholderImage(400, 400, 'Producto', 'f5f5f5', '333333'),
    LARGE: getPlaceholderImage(600, 600, 'Producto', 'f5f5f5', '333333'),
  },
  
  // Imágenes de platos destacados
  DISH: {
    SMALL: getPlaceholderImage(300, 300, 'Plato', 'e8e8e8', '333333'),
    MEDIUM: getPlaceholderImage(400, 400, 'Plato', 'e8e8e8', '333333'),
    LARGE: getPlaceholderImage(500, 500, 'Plato', 'e8e8e8', '333333'),
  },
  
  // Imágenes del restaurante/lugar
  RESTAURANT: {
    SMALL: getPlaceholderImage(300, 200, 'Restaurante', '2d2d2d', 'ffffff'),
    MEDIUM: getPlaceholderImage(600, 400, 'Restaurante', '2d2d2d', 'ffffff'),
    LARGE: getPlaceholderImage(1200, 800, 'Restaurante', '2d2d2d', 'ffffff'),
  },
  
  // Imágenes de hero/banner
  HERO: {
    SMALL: getPlaceholderImage(800, 400, 'Hero', '1a1a1a', 'ffffff'),
    MEDIUM: getPlaceholderImage(1200, 600, 'Hero', '1a1a1a', 'ffffff'),
    LARGE: getPlaceholderImage(1920, 800, 'Hero', '1a1a1a', 'ffffff'),
  },
  
  // Imágenes de menú (cuadradas)
  MENU_ITEM: {
    SMALL: getPlaceholderImage(200, 200, 'Menú', 'f5f5f5', '333333'),
    MEDIUM: getPlaceholderImage(300, 300, 'Menú', 'f5f5f5', '333333'),
    LARGE: getPlaceholderImage(400, 400, 'Menú', 'f5f5f5', '333333'),
  },
  
  // Avatar/Logo del negocio
  LOGO: {
    SMALL: getPlaceholderImage(50, 50, 'Logo', '000000', 'ffffff'),
    MEDIUM: getPlaceholderImage(100, 100, 'Logo', '000000', 'ffffff'),
    LARGE: getPlaceholderImage(200, 200, 'Logo', '000000', 'ffffff'),
  },
};

/**
 * Función helper para obtener placeholder por tipo y tamaño
 * @param {string} type - Tipo de placeholder (PRODUCT, DISH, RESTAURANT, etc.)
 * @param {string} size - Tamaño (SMALL, MEDIUM, LARGE)
 * @returns {string} URL del placeholder
 */
export const getPlaceholder = (type = 'PRODUCT', size = 'MEDIUM') => {
  return PLACEHOLDERS[type]?.[size] || PLACEHOLDERS.PRODUCT.MEDIUM;
};

/**
 * Constantes de texto y mensajes globales
 */
export const APP_TEXT = {
  BRAND_NAME: 'Titulo del negocio',
  SITE_NAME: 'Nombre del sitio',
  DEFAULT_DESCRIPTION: 'Descripción del producto o servicio',
};

/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  BASE_PATH: import.meta.env.BASE_URL || '/AP_Restaurante/public/app/',
};

