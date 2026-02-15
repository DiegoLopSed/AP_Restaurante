<?php
/**
 * API REST para empleados
 * Endpoint público que delega al controlador
 */

// IMPORTANTE: Esto debe ser lo primero, antes de CUALQUIER otra cosa
// Configurar error handler personalizado para capturar todos los errores
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // Convertir errores a excepciones para que se capturen en el catch
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Desactivar completamente la salida de errores en pantalla
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);

// Iniciar buffer de salida ANTES de cualquier require
ob_start();

try {
    require_once __DIR__ . '/../../backend/src/Controllers/EmpleadoController.php';
    
    // Limpiar cualquier salida capturada
    ob_clean();
    
    // Usar el nombre completo de la clase en lugar de 'use'
    $controller = new \App\Controllers\EmpleadoController();
    $controller->handleRequest();
    
} catch (Throwable $e) {
    // Limpiar cualquier salida previa (incluyendo errores de PHP)
    ob_clean();
    
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// Enviar y limpiar buffer
ob_end_flush();

