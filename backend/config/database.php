<?php
/**
 * Compatibilidad: conexión a DB centralizada.
 *
 * Este proyecto usa variables de entorno (y opcionalmente .env) para configurar la base de datos.
 * Para mantener compatibilidad con el resto del código (controllers/models) que hace:
 *   require_once __DIR__ . '/../../config/database.php';
 * este archivo delega a `conection.php`.
 *
 * Nota: el nombre `conection.php` se conserva por compatibilidad histórica del proyecto.
 */

require_once __DIR__ . '/conection.php';