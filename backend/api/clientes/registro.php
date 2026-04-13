<?php
/**
 * API REST para registro de clientes frecuentes
 * 
 * Endpoint encargado de registrar nuevos clientes dentro del
 * programa de lealtad del sistema. Recibe datos en formato JSON
 * y delega la lógica al ClienteController.
 * 
 * Funcionalidades:
 * - Registro de nuevos clientes
 * - Recepción y procesamiento de datos JSON
 * - Validación del método HTTP (POST)
 * - Soporte para CORS
 * 
 * Características:
 * - Manejo de preflight (OPTIONS)
 * - Control de errores centralizado
 * - Uso de buffer de salida para evitar respuestas corruptas
 * - Delegación de lógica al controlador
 * 
 * @package AP_Restaurante
 * @subpackage ClienteRegistroAPI
 * @author Ana Karen Romero Flores
 * @version 1.0.0
 */

// Manejo de errores: convierte errores en excepciones
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);

// Iniciar buffer de salida
ob_start();

// Configuración CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejo de preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_flush();
    exit();
}

// Validar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    ob_end_flush();
    exit();
}

try {
    require_once __DIR__ . '/../../src/Controllers/ClienteController.php';

    // Limpiar salida previa
    ob_clean();

    // Obtener datos JSON del request
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: [];

    // Definir acción de registro
    $input['action'] = 'registro';

    // Ejecutar controlador con input modificado
    $controller = new \App\Controllers\ClienteController();
    $controller->handleRequestWithInput($input);

} catch (Throwable $e) {
    // Manejo de errores
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