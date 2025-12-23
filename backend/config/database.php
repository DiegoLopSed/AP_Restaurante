<?php
/**
 * Archivo de conexión a la base de datos
 * Sistema de Gestión de Restaurante
 */

// Cargar el autoload de Composer (require_once protege contra múltiples cargas)
require_once __DIR__ . '/../../vendor/autoload.php';

// Cargar variables de entorno desde el archivo .env solo si no se han cargado
use Dotenv\Dotenv;

if (!defined('DB_CONFIG_LOADED')) {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
    $dotenv->load();
    
    // Validar que las variables requeridas estén presentes
    $dotenv->required([
        'DB_HOST',
        'DB_USER',
        'DB_NAME',
        'DB_CHARSET'
    ]);
    
    // Configuración de la base de datos desde variables de entorno
    define('DB_HOST', $_ENV['DB_HOST']);
    define('DB_USER', $_ENV['DB_USER']);
    define('DB_PASS', $_ENV['DB_PASS'] ?? '');
    define('DB_NAME', $_ENV['DB_NAME']);
    define('DB_CHARSET', $_ENV['DB_CHARSET']);
    
    define('DB_CONFIG_LOADED', true);
}

if (!class_exists('Database')) {
    class Database {
        private static $instance = null;
        private $connection;
        
        /**
         * Constructor privado para implementar patrón Singleton
         */
        private function __construct() {
            try {
                $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
                ];
                
                $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                die("Error de conexión a la base de datos: " . $e->getMessage());
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
            throw new Exception("No se puede deserializar un singleton");
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

