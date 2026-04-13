<?php
/**
 * Configuración de conexión a la base de datos
 * 
 * Este archivo centraliza la conexión al motor MySQL mediante PDO,
 * utilizando variables de entorno (.env) para mayor seguridad.
 * 
 * Funcionalidades:
 * - Carga automática de variables desde .env (phpdotenv)
 * - Acceso seguro a variables de entorno
 * - Implementación del patrón Singleton para una sola conexión
 * - Configuración optimizada de PDO
 * 
 * Características:
 * - Manejo de errores mediante excepciones
 * - Prevención de múltiples conexiones innecesarias
 * - Compatibilidad con entornos locales y producción
 * 
 * Uso:
 * - getDB(): retorna la conexión activa a la base de datos
 * 
 * @package AP_Restaurante
 * @subpackage DatabaseConfig
 * @author  Diego Lopez Sedeño
 * @version 1.0.0
 */

// Evitar mostrar errores en producción
if (!ini_get('display_errors')) {
    ini_set('display_errors', 0);
}

// Cargar autoload de Composer (para phpdotenv)
$autoloadPath = __DIR__ . '/../../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
}

/**
 * Cargar archivo .env si existe
 */
if (class_exists(\Dotenv\Dotenv::class)) {
    $envPath = __DIR__ . '/../..';
    if (file_exists($envPath . '/.env')) {
        $dotenv = \Dotenv\Dotenv::createImmutable($envPath);
        $dotenv->safeLoad();
    }
}

/**
 * Obtener variable de entorno (opcional)
 */
if (!function_exists('env_value')) {
    function env_value(string $key, ?string $default = null): ?string {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
        if ($value === false || $value === null || $value === '') {
            return $default;
        }
        return (string)$value;
    }
}

/**
 * Obtener variable de entorno obligatoria
 */
if (!function_exists('env_required')) {
    function env_required(string $key): string {
        $value = env_value($key, null);
        if ($value === null) {
            throw new \Exception("Falta variable de entorno requerida: {$key}");
        }
        return $value;
    }
}

if (!class_exists('Database')) {
    class Database {

        private static $instance = null;
        private $connection;
        private static $config = null;

        /**
         * Cargar configuración desde variables de entorno
         */
        private static function getConfig(): array {
            if (self::$config !== null) {
                return self::$config;
            }

            self::$config = [
                'host'    => env_required('DB_HOST'),
                'user'    => env_required('DB_USER'),
                'pass'    => env_value('DB_PASS', '') ?? '',
                'name'    => env_required('DB_NAME'),
                'charset' => env_required('DB_CHARSET'),
            ];

            return self::$config;
        }
        
        /**
         * Constructor privado (Singleton)
         */
        private function __construct() {
            try {
                $cfg = self::getConfig();

                $dsn = "mysql:host={$cfg['host']};dbname={$cfg['name']};charset={$cfg['charset']}";

                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$cfg['charset']}"
                ];
                
                $this->connection = new PDO($dsn, $cfg['user'], $cfg['pass'], $options);

            } catch (PDOException $e) {
                throw new \Exception("Error de conexión a la base de datos: " . $e->getMessage());
            }
        }
        
        /**
         * Obtener instancia única
         */
        public static function getInstance() {
            if (self::$instance === null) {
                self::$instance = new self();
            }
            return self::$instance;
        }
        
        /**
         * Obtener conexión PDO
         */
        public function getConnection() {
            return $this->connection;
        }
        
        private function __clone() {}

        public function __wakeup() {
            throw new \Exception("No se puede deserializar un singleton");
        }
    }
}

/**
 * Helper para obtener conexión rápidamente
 */
if (!function_exists('getDB')) {
    function getDB() {
        return Database::getInstance()->getConnection();
    }
}