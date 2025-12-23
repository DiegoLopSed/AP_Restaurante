<?php
// Incluir autoloader de Composer para cargar dependencias
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// Crear instancia de Dotenv y cargar variables desde archivo .env
try {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
    
    // Validar que las variables requeridas existan
    $dotenv->required(['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS']);
} catch (Exception $e) {
    die("Error al cargar configuración: " . $e->getMessage());
}

// ============================================================================
// CONFIGURACIÓN DE BASE DE DATOS
// ============================================================================

// Obtener configuración de base de datos desde variables de entorno
$dbHost = $_ENV['DB_HOST'];
$dbName = $_ENV['DB_NAME'];
$dbUser = $_ENV['DB_USER'];
$dbPass = $_ENV['DB_PASS']; //! Información sensible

// Inicializar variable global para conexión PDO
$pdo = null;

// ============================================================================
// FUNCIONES DE CONEXIÓN
// ============================================================================

/**
 * Establece una conexión PDO a la base de datos
 * 
 * Crea una nueva conexión PDO con configuración de seguridad optimizada:
 * - Modo de error estricto (excepciones)
 * - Fetch mode asociativo por defecto
 * - Deshabilitada la emulación de prepared statements
 * - Charset UTF-8 MB4 para soporte completo de Unicode
 * 
 * @return PDO|null Instancia de PDO si la conexión es exitosa, null en caso de error
 */
function getConnection(): ?PDO {
    global $dbHost, $dbName, $dbUser, $dbPass, $pdo;

    try {
        // Construir string de conexión DSN
        $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";
        
        // Crear nueva instancia PDO con configuración de seguridad
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Habilitar modo de error estricto
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Configurar fetch por defecto
            PDO::ATTR_EMULATE_PREPARES   => false, // Deshabilitar emulación de prepared statements
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4" // Configurar charset
        ]);

        return $pdo;
    } catch (PDOException $e) {
        // Registrar error en log del sistema
        error_log("Error de conexión a la base de datos: " . $e->getMessage());
        return null;
    }
}

/**
 * Verifica si la conexión a la base de datos está activa
 * 
 * Ejecuta una consulta simple para verificar que la conexión PDO
 * esté funcionando correctamente.
 * 
 * @return bool True si la conexión está activa, false en caso contrario
 */
function isConnectionActive(): bool {
    global $pdo;

    try {
        // Ejecutar consulta simple para verificar conexión
        return $pdo instanceof PDO && $pdo->query('SELECT 1') !== false;
    } catch (PDOException $e) {
        return false;
    }
}

/**
 * Cierra la conexión a la base de datos
 * 
 * Establece la variable global $pdo como null para liberar recursos.
 * 
 * @return void
 */
function closeConnection(): void {
    global $pdo;
    $pdo = null;
}

// ============================================================================
// FUNCIONES DE CONSULTA GENÉRICA
// ============================================================================

/**
 * Obtiene datos genéricos de referencia de una tabla
 * 
 * Función auxiliar para obtener listas de datos de referencia (como
 * departamentos, roles, etc.) de cualquier tabla. Útil para poblar
 * selectores en formularios.
 * 
 * @param string $table Nombre de la tabla
 * @param string $idColumn Nombre de la columna de ID
 * @param string $nameColumn Nombre de la columna de nombre/descripción
 * @param string|null $orderBy Columna por la cual ordenar (usa $nameColumn si es null)
 * @param string $orderDirection Dirección del ordenamiento (ASC o DESC)
 * @return array Array asociativo con los datos de referencia
 */
function getReferenceData(string $table, string $idColumn, string $nameColumn, ?string $orderBy = null, string $orderDirection = 'ASC'): array {
    global $pdo;
    
    // Verificar si existe conexión, si no, crear una
    if (!$pdo) {
        $pdo = getConnection();
    }

    try {
        $orderColumn = $orderBy ?? $nameColumn;
        $direction = strtoupper($orderDirection) === 'DESC' ? 'DESC' : 'ASC';
        
        // Preparar consulta SQL dinámica
        $stmt = $pdo->prepare("SELECT $idColumn, $nameColumn FROM $table ORDER BY $orderColumn $direction");
        $stmt->execute();
        
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        // Registrar error en log del sistema
        error_log("Error al consultar tabla $table: " . $e->getMessage());
        return [];
    }
}

// ============================================================================
// INICIALIZACIÓN AUTOMÁTICA DE CONEXIÓN
// ============================================================================

// Verificar si existe conexión, si no, crear una automáticamente
if (!$pdo) {
    $pdo = getConnection();
}

// Terminar ejecución si no se puede conectar a la base de datos
if (!$pdo) {
    die("Error: No se pudo conectar con la base de datos. Revisa tu archivo .env.");
}
?>
