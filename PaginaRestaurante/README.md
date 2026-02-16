# PaginaRestaurante — Frontend React + Vite

Frontend del proyecto AP_Restaurante. Desarrollado con **React** y **Vite**, se integra con el backend PHP (XAMPP).

---

## Requisitos previos

- **Node.js** (recomendado: 20.19+ o 22.12+)
- **npm** (incluido con Node.js)
- **Apache/XAMPP** (para el backend y para servir el build en producción)

---

## Instalación

### 1. Entrar al directorio del frontend

```bash
cd PaginaRestaurante
```

(O, si estás en la raíz del repositorio: `cd AP_Restaurante/PaginaRestaurante` según tu ruta.)

### 2. Instalar dependencias de Node (módulos)

```bash
npm install
```

Esto instala React, React Router, Vite, ESLint y el resto de dependencias definidas en `package.json`.

---

## Ejecución del programa

### Modo desarrollo (servidor de Vite)

```bash
npm run dev
```

- Inicia el servidor de desarrollo de Vite con recarga en caliente (HMR).
- Por defecto suele estar en `http://localhost:5173`.
- Las llamadas a `/api/...` se hacen proxy hacia Apache (ver `vite.config.js`); ten Apache/XAMPP levantado para la API.

### Modo producción (build)

Generar el build estático:

```bash
npm run build
```

- El resultado se genera en **`AP_Restaurante/public/app/`**.
- Para ver la app en producción, abre en el navegador:
  - `http://localhost/AP_Restaurante/public/app/`
- El `index.php` en la raíz del proyecto puede redirigir a `public/app/index.html` si el build existe.

### Vista previa del build (opcional)

Para probar el build localmente sin Apache:

```bash
npm run preview
```

---

## Resumen de comandos

| Comando           | Descripción                          |
|-------------------|--------------------------------------|
| `npm install`     | Instala dependencias (módulos Node)  |
| `npm run dev`     | Ejecuta el frontend en desarrollo    |
| `npm run build`   | Genera el build para producción      |
| `npm run preview` | Sirve el build localmente            |
| `npm run lint`    | Ejecuta ESLint                       |

---

## Integración con el backend

- **API PHP**: `AP_Restaurante/public/api/*.php`
- **Build de React**: se sirve desde `AP_Restaurante/public/app/`

En desarrollo, el proxy de Vite evita problemas de CORS al llamar a la API.

---

## Variables de entorno

Opcional. Puedes usar un archivo **`.env`** en la raíz de `PaginaRestaurante` para configurar URLs de API u otras claves si el proyecto lo requiere.
