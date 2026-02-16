<?php
/**
 * Archivo de conexión a la base de datos
 * Sistema de Gestión de Restaurante
 */

// Desactivar mostrar errores aquí también por si se carga directamente
if (!ini_get('display_errors')) {
    ini_set('display_errors', 0);
}

// Cargar el autoload de Composer (requerido para phpdotenv si se usa .env)
$autoloadPath = __DIR__ . '/../../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
}

/**
 * Cargar .env si existe (opcional). Si no existe, se usarán variables del entorno del servidor.
 * Esto no define constantes; solo carga $_ENV/putenv según la configuración de phpdotenv.
 */
if (class_exists(\Dotenv\Dotenv::class)) {
    $envPath = __DIR__ . '/../..';
    if (file_exists($envPath . '/.env')) {
        $dotenv = \Dotenv\Dotenv::createImmutable($envPath);
        $dotenv->safeLoad();
    }
}

/**
 * Leer variables de entorno de forma limpia y directa
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

if (!function_exists('env_required')) {
    function env_required(string $key): string {
        $value = env_value($key, null);
        if ($value === null) {
            throw new \Exception("Falta variable de entorno requerida: {$key}. Configure su archivo .env o variables del servidor.");
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
         * Cargar configuración desde variables de entorno (y .env si existe)
         */
        private static function getConfig(): array {
            if (self::$config !== null) {
                return self::$config;
            }

            $host = env_required('DB_HOST');
            $user = env_required('DB_USER');
            $pass = env_value('DB_PASS', '') ?? '';
            $name = env_required('DB_NAME');
            $charset = env_required('DB_CHARSET');

            self::$config = [
                'host' => $host,
                'user' => $user,
                'pass' => $pass,
                'name' => $name,
                'charset' => $charset,
            ];

            return self::$config;
        }
        
        /**
         * Constructor privado para implementar patrón Singleton
         */
        private function __construct() {
            try {
                $cfg = self::getConfig();
                $dsn = "mysql:host=" . $cfg['host'] . ";dbname=" . $cfg['name'] . ";charset=" . $cfg['charset'];
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . $cfg['charset']
                ];
                
                $this->connection = new PDO($dsn, $cfg['user'], $cfg['pass'], $options);
            } catch (PDOException $e) {
                // En lugar de die(), lanzar una excepción que pueda ser capturada
                throw new \Exception("Error de conexión a la base de datos: " . $e->getMessage());
            }
        }
        
        /**
         * Obtener instancia única de la conexión (Singleton)
         */
        public static function getInstance() {
            if (self::$instance === null) {
                self::$instance = new self();
            }
            return self::$instance;
        }
        
        /**
         * Obtener la conexión PDO
         */
        public function getConnection() {
            return $this->connection;
        }
        
        /**
         * Prevenir clonación de la instancia
         */
        private function __clone() {}
        
        /**
         * Prevenir deserialización de la instancia
         */
        public function __wakeup() {
            throw new \Exception("No se puede deserializar un singleton");
        }
    }
}

/**
 * Función helper para obtener la conexión
 */
if (!function_exists('getDB')) {
    function getDB() {
        return Database::getInstance()->getConnection();
    }
}

