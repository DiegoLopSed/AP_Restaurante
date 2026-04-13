<?php
/**
 * insumos.php
 * 
 * API REST para la gestión de insumos del sistema.
 * 
 * Este endpoint recibe las solicitudes HTTP del frontend y delega
 * la lógica al InsumoController para su procesamiento.
 * 
 * Funcionalidades:
 * - Manejo de peticiones (GET, POST, PUT, DELETE)
 * - Gestión de insumos (altas, bajas, edición y consulta)
 * - Respuestas en formato JSON
 * - Manejo centralizado de errores
 * 
 * Incluye:
 * - Conversión de errores a excepciones
 * - Uso de buffer de salida para evitar respuestas incorrectas
 * @ package AP_Restaurante
 * @subpackage insumos.php
 * @author Ana Karen Romero Flores
 * @version 1.0.0
 */

// IMPORTANTE: Esto debe ser lo primero
// Configurar error handler para convertir errores en excepciones
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);

// Iniciar buffer de salida ANTES de cualquier require
ob_start();

try {
    require_once __DIR__ . '/../src/Controllers/InsumoController.php';

    // Limpiar cualquier salida previa
    ob_clean();

    // Crear instancia del controlador
    $controller = new \App\Controllers\InsumoController();
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

// Enviar buffer
ob_end_flush();