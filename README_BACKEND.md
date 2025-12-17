# Backend - Sistema de Gestión de Restaurante

## Estructura del Proyecto

```
AP_Restaurante/
├── api/                    # Endpoints de la API REST
│   ├── empleados.php      # API de empleados
│   └── productos.php      # API de productos/inventario
├── config/                 # Archivos de configuración
│   ├── config.php         # Configuración general
│   └── database.php       # Configuración de base de datos
├── controllers/            # Controladores (lógica de negocio)
│   ├── EmpleadoController.php
│   └── ProductoController.php
├── models/                 # Modelos (acceso a datos)
│   ├── Empleado.php
│   └── Producto.php
├── database/               # Scripts de base de datos
│   └── schema.sql         # Esquema de la base de datos
├── includes/               # Archivos auxiliares
│   └── functions.php      # Funciones de utilidad
└── .htaccess              # Configuración de Apache
```

## Instalación

1. **Crear la base de datos:**
   ```sql
   -- Ejecutar el archivo database/schema.sql en phpMyAdmin o MySQL
   ```

2. **Configurar la conexión:**
   - Editar `config/database.php` con los datos de tu base de datos:
     ```php
     define('DB_HOST', 'localhost');
     define('DB_USER', 'root');
     define('DB_PASS', '');
     define('DB_NAME', 'restaurante_db');
     ```

3. **Permisos:**
   - Asegúrate de que Apache tenga permisos de lectura en las carpetas

## Uso de la API

### Endpoints de Empleados

**Base URL:** `/AP_Restaurante/api/empleados.php`

- **GET** `/api/empleados.php` - Obtener todos los empleados
- **GET** `/api/empleados.php?id=1` - Obtener un empleado por ID
- **POST** `/api/empleados.php` - Crear un nuevo empleado
- **PUT** `/api/empleados.php?id=1` - Actualizar un empleado
- **DELETE** `/api/empleados.php?id=1` - Eliminar un empleado

**Ejemplo de creación:**
```json
POST /api/empleados.php
Content-Type: application/json

{
    "nombre": "Juan",
    "apellido": "Pérez",
    "cargo": "Mesero",
    "telefono": "555-1234",
    "email": "juan@example.com",
    "fecha_contratacion": "2024-01-15",
    "salario": 5000.00
}
```

### Endpoints de Productos

**Base URL:** `/AP_Restaurante/api/productos.php`

- **GET** `/api/productos.php` - Obtener todos los productos
- **GET** `/api/productos.php?id=1` - Obtener un producto por ID
- **POST** `/api/productos.php` - Crear un nuevo producto
- **PUT** `/api/productos.php?id=1` - Actualizar un producto
- **DELETE** `/api/productos.php?id=1` - Eliminar un producto

**Ejemplo de creación:**
```json
POST /api/productos.php
Content-Type: application/json

{
    "nombre": "Tomates",
    "categoria": "Alimentos",
    "cantidad": 50,
    "unidad": "Kg",
    "precio_unitario": 25.50,
    "proveedor": "Proveedor ABC",
    "fecha_vencimiento": "2024-12-31",
    "minimo": 10,
    "descripcion": "Tomates frescos"
}
```

## Estructura MVC

El proyecto sigue el patrón Modelo-Vista-Controlador:

- **Models:** Contienen la lógica de acceso a datos
- **Controllers:** Manejan las peticiones HTTP y coordinan con los modelos
- **Views:** (Frontend) En las carpetas `pages/` y archivos HTML

## Seguridad

- Todas las consultas utilizan `real_escape_string()` para prevenir SQL injection
- Validación de datos en los controladores
- Headers CORS configurados para desarrollo
- Protección de archivos sensibles en `.htaccess`

## Flujo de Trabajo con Git

### Estrategia de Ramas (Git Flow)

Se recomienda utilizar el **Git Flow** adaptado para proyectos pequeños/medianos:

```
main (production)
  ├── develop (desarrollo)
  │   ├── feature/nombre-feature (nuevas características)
  │   └── feature/nombre-feature-2
  └── hotfix/nombre-hotfix (correcciones urgentes)
```

### Descripción de Ramas

#### 1. **main** (Producción)
- **Propósito:** Código en producción, estable y probado
- **Origen:** Rama principal del repositorio
- **Merge desde:** `develop` (releases), `hotfix/*`
- **Permisos:**
  - **Push directo:** ❌ Prohibido
  - **Merge:** ✅ Solo Lead Developer / Tech Lead
  - **Protección:** ✅ Requiere Pull Request + Revisión + Tests

#### 2. **develop** (Desarrollo)
- **Propósito:** Rama de integración para desarrollo continuo
- **Origen:** Rama de `main`
- **Merge desde:** `feature/*`, `hotfix/*` (cuando no están en main)
- **Permisos:**
  - **Push directo:** ❌ Prohibido
  - **Merge:** ✅ Developers + Senior Developers
  - **Protección:** ✅ Requiere Pull Request + Revisión (opcional: 1 aprobación)

#### 3. **feature/nombre-feature** (Nuevas Características)
- **Propósito:** Desarrollo de nuevas funcionalidades
- **Origen:** Rama desde `develop`
- **Merge a:** `develop`
- **Nomenclatura:** `feature/agregar-login`, `feature/modulo-ventas`, `feature/notificaciones`
- **Permisos:**
  - **Push directo:** ✅ Developers (todos)
  - **Merge:** ✅ Desarrollador propietario de la rama
  - **Protección:** ✅ Requiere Pull Request hacia `develop`

#### 4. **hotfix/nombre-hotfix** (Correcciones Urgentes)
- **Propósito:** Correcciones críticas en producción
- **Origen:** Rama desde `main`
- **Merge a:** `main` y `develop`
- **Nomenclatura:** `hotfix/corregir-sql-injection`, `hotfix/fix-login-bug`
- **Permisos:**
  - **Push directo:** ✅ Senior Developers + Lead
  - **Merge:** ✅ Lead Developer / Tech Lead
  - **Protección:** ✅ Requiere Pull Request + Revisión crítica

#### 5. **release/v1.0.0** (Pre-lanzamiento) - Opcional
- **Propósito:** Preparación de versiones para producción
- **Origen:** Rama desde `develop`
- **Merge a:** `main` y `develop`
- **Nomenclatura:** `release/v1.0.0`, `release/v1.1.0`
- **Permisos:**
  - **Push directo:** ✅ Senior Developers
  - **Merge:** ✅ Lead Developer / Tech Lead
  - **Protección:** ✅ Requiere Pull Request + Tests completos

### Flujo de Trabajo Recomendado

#### Para Desarrollar una Nueva Característica:

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear rama feature
git checkout -b feature/nombre-caracteristica

# 3. Desarrollar y hacer commits
git add .
git commit -m "feat: agregar nueva característica X"

# 4. Push de la rama
git push origin feature/nombre-caracteristica

# 5. Crear Pull Request a develop
# (En GitHub/GitLab/Bitbucket)

# 6. Después del merge, eliminar rama local
git checkout develop
git pull origin develop
git branch -d feature/nombre-caracteristica
```

#### Para Corregir un Bug Urgente (Hotfix):

```bash
# 1. Crear hotfix desde main
git checkout main
git pull origin main
git checkout -b hotfix/corregir-bug-urgente

# 2. Corregir y commitear
git add .
git commit -m "fix: corregir bug crítico en login"

# 3. Merge a main y develop
git checkout main
git merge hotfix/corregir-bug-urgente
git push origin main

git checkout develop
git merge hotfix/corregir-bug-urgente
git push origin develop

# 4. Eliminar rama hotfix
git branch -d hotfix/corregir-bug-urgente
git push origin --delete hotfix/corregir-bug-urgente
```

### Convención de Commits

Se recomienda usar **Conventional Commits**:

```
tipo(alcance): descripción breve

Descripción detallada (opcional)

[tipo]: feat, fix, docs, style, refactor, test, chore
```

**Ejemplos:**
- `feat(api): agregar endpoint para reportes`
- `fix(models): corregir validación de email en Empleado`
- `docs(readme): actualizar documentación de API`
- `refactor(controllers): simplificar lógica de ProductoController`

### Matriz de Permisos Resumida

| Rama | Push Directo | Merge Directo | Requiere PR | Aprobaciones | Personas Autorizadas |
|------|--------------|---------------|-------------|--------------|----------------------|
| **main** | ❌ No | ❌ No | ✅ Sí | 2+ | Lead Developer |
| **develop** | ❌ No | ❌ No | ✅ Sí | 1+ | Developers + |
| **feature/** | ✅ Sí | ❌ No | ✅ Sí | 1 | Todos los devs |
| **hotfix/** | ✅ Sí* | ❌ No | ✅ Sí | 2+ | Senior + Lead |
| **release/** | ✅ Sí* | ❌ No | ✅ Sí | 2+ | Senior + Lead |

*Solo para Senior Developers y Lead

### Reglas de Protección Recomendadas

#### Para `main`:
- ✅ Requiere Pull Request
- ✅ Requiere revisión de al menos 2 aprobadores
- ✅ Requiere que los tests pasen
- ✅ No permite merge sin revisión
- ✅ Bloquea push directo
- ✅ Requiere que la rama esté actualizada antes del merge

#### Para `develop`:
- ✅ Requiere Pull Request
- ✅ Requiere revisión de al menos 1 aprobador
- ✅ Requiere que los tests pasen (si existen)
- ✅ Bloquea push directo

#### Para `feature/*`, `hotfix/*`, `release/*`:
- ✅ Requiere Pull Request hacia rama destino
- ✅ Bloquea push directo a ramas protegidas
- ✅ Permite push directo a su propia rama

### Roles del Equipo

- **Lead Developer / Tech Lead:**
  - Merge a `main`
  - Merge a `hotfix/*` y `release/*`
  - Gestión de releases

- **Senior Developers:**
  - Merge a `develop`
  - Crear y gestionar `hotfix/*` y `release/*`
  - Revisión de Pull Requests

- **Developers:**
  - Crear y desarrollar `feature/*`
  - Merge de sus propias `feature/*` a `develop` (vía PR)
  - Participar en revisiones

### Buenas Prácticas

1. **Nunca hacer push directo a `main` o `develop`**
2. **Siempre crear Pull Requests** para merge entre ramas principales
3. **Mantener las ramas actualizadas** antes de crear PRs
4. **Eliminar ramas después del merge** para mantener el repositorio limpio
5. **Usar nombres descriptivos** para ramas y commits
6. **Hacer commits frecuentes** con mensajes claros
7. **Sincronizar regularmente** con `develop` mientras trabajas en features

## Notas

- El proyecto está configurado para XAMPP por defecto
- La zona horaria está configurada para México
- El encoding es UTF-8 para soportar caracteres especiales
