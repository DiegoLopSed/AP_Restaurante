<?php
/**
 * Endpoint: GET /backend/api/corte_caja.php
 * Devuelve el reporte de venta del día (corte de caja).
 */

set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);

ob_start();

try {
    require_once __DIR__ . '/../src/Controllers/CorteCajaController.php';
    ob_clean();

    $controller = new \App\Controllers\CorteCajaController();
    $controller->handleRequest();
} catch (Throwable $e) {
    ob_clean();

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

ob_end_flush();

