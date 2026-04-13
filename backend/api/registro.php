<?php
/**
 * API REST para registro de usuarios
 * 
 * Endpoint público encargado de gestionar el alta de nuevos usuarios
 * en el sistema. Recibe los datos desde el cliente y delega la lógica
 * al controlador correspondiente.
 * 
 * Funcionalidades:
 * - Registro de nuevos usuarios
 * - Validación de datos mediante el controlador
 * - Respuesta en formato JSON
 * 
 * Características:
 * - Manejo centralizado de errores
 * - Uso de buffer de salida para evitar respuestas corruptas
 * - Retorno estructurado para consumo del frontend
 * 
 * @package AP_Restaurante
 * @subpackage Registro.php
 * @author Ana Karen Romero Flores
 * @version 1.0.0
 */

// Manejo de errores: convierte errores en excepciones
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Configuración de errores (no mostrar en pantalla)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);

// Iniciar buffer de salida
ob_start();

try {
    require_once __DIR__ . '/../src/Controllers/RegistroController.php';

    // Limpiar cualquier salida previa
    ob_clean();

    // Ejecutar controlador
    $controller = new \App\Controllers\RegistroController();
    $controller->handleRequest();

} catch (Throwable $e) {
    // Limpiar salida en caso de error
    ob_clean();

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// Enviar buffer final
ob_end_flush();