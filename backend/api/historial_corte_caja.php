<?php
/**
 * historial_corte_caja.php
 * 
 * API REST para consultar el historial de cortes de caja.
 * 
 * Este endpoint recibe solicitudes desde el frontend y delega
 * la lógica al HistorialCorteCajaController para obtener
 * los registros históricos de cortes realizados.
 * 
 * Funcionalidades:
 * - Consulta del historial de cortes de caja
 * - Respuestas en formato JSON
 * - Manejo centralizado de errores
 * 
 * Incluye:
 * - Conversión de errores a excepciones
 * - Uso de buffer de salida para evitar respuestas incorrectas
 * @ package AP_Restaurante
 * @subpackage historial_corte_caja.php
 * @author Diego Lopez Sedeño
 * @version 1.0.0
 */

// Configurar error handler para convertir errores en excepciones
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);

// Iniciar buffer de salida
ob_start();

try {
    require_once __DIR__ . '/../src/Controllers/HistorialCorteCajaController.php';

    // Limpiar cualquier salida previa
    ob_clean();

    // Crear instancia del controlador
    $controller = new \App\Controllers\HistorialCorteCajaController();
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