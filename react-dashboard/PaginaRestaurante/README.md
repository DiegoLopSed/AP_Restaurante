# Página Restaurante - Frontend

Aplicación frontend desarrollada con React y Vite para la gestión de restaurante.

## Versión de React

Este proyecto utiliza **React 19.2.0** junto con **React DOM 19.2.0**.

## Dependencias Principales

### Dependencias de Producción

- **react**: ^19.2.0 - Biblioteca principal de React
- **react-dom**: ^19.2.0 - Renderizado de React para el DOM
- **react-router-dom**: ^7.12.0 - Enrutamiento para aplicaciones React
- **@heroicons/react**: ^2.1.0 - Iconos SVG optimizados para React

### Dependencias de Desarrollo

- **vite**: ^7.2.4 - Herramienta de construcción y servidor de desarrollo
- **@vitejs/plugin-react**: ^5.1.1 - Plugin oficial de Vite para React
- **eslint**: ^9.39.1 - Linter para JavaScript/React
- **@types/react**: ^19.2.5 - Definiciones de tipos TypeScript para React
- **@types/react-dom**: ^19.2.3 - Definiciones de tipos TypeScript para React DOM

## Instalación y Ejecución

### Prerrequisitos

- Node.js (versión 18 o superior recomendada)
- npm o yarn como gestor de paquetes

### Pasos de Instalación

1. **Navegar al directorio del proyecto:**
   ```bash
   cd react-dashboard/PaginaRestaurante
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```
   o si usas yarn:
   ```bash
   yarn install
   ```

### Ejecución del Entorno de Desarrollo

Para iniciar el servidor de desarrollo con Hot Module Replacement (HMR):

```bash
npm run dev
```

o con yarn:

```bash
yarn dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne automáticamente).

### Otros Comandos Disponibles

- **Construir para producción:**
  ```bash
  npm run build
  ```
  Genera los archivos optimizados en la carpeta `dist/`.

- **Previsualizar la build de producción:**
  ```bash
  npm run preview
  ```
  Permite previsualizar la aplicación construida localmente antes del despliegue.

- **Ejecutar el linter:**
  ```bash
  npm run lint
  ```
  Verifica el código en busca de errores y problemas de estilo.

## Consideraciones para Desarrollo Local

1. **Hot Module Replacement (HMR)**: Vite proporciona HMR por defecto, lo que permite ver los cambios en tiempo real sin recargar la página completa.

2. **Variables de Entorno**: Si necesitas configurar variables de entorno, crea un archivo `.env` en la raíz del proyecto. Las variables deben comenzar con `VITE_` para ser accesibles en el código.

3. **Puerto Personalizado**: Si el puerto 5173 está ocupado, Vite automáticamente intentará usar el siguiente puerto disponible. También puedes especificar un puerto en `vite.config.js`.

4. **Estructura del Proyecto**:
   - `src/components/` - Componentes reutilizables
   - `src/pages/` - Páginas de la aplicación
   - `src/layouts/` - Layouts para diferentes secciones
   - `src/routes/` - Configuración de rutas
   - `src/assets/css/` - Estilos CSS modulares

## Consideraciones para Despliegue

1. **Build de Producción**: Antes de desplegar, ejecuta `npm run build` para generar los archivos optimizados.

2. **Servidor Web**: La aplicación construida requiere un servidor web estático. Puedes usar:
   - Nginx
   - Apache
   - Servicios de hosting estático (Vercel, Netlify, GitHub Pages, etc.)

3. **Configuración del Servidor**: Asegúrate de que el servidor esté configurado para servir `index.html` en todas las rutas (SPA routing), especialmente si usas `react-router-dom`.

4. **Optimizaciones**: Vite ya optimiza automáticamente:
   - Code splitting
   - Minificación
   - Tree shaking
   - Compresión de assets

5. **Variables de Entorno de Producción**: Asegúrate de configurar las variables de entorno necesarias en tu plataforma de despliegue.

## Notas Adicionales

- Este proyecto utiliza CSS Modules para el estilo de componentes.
- El React Compiler no está habilitado por defecto debido a su impacto en el rendimiento de desarrollo y construcción.
- Para expandir la configuración de ESLint o agregar TypeScript, consulta la [documentación oficial de Vite](https://vite.dev/).
