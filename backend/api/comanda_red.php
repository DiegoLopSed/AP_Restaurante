<?php
/**
 * comandaRed.php
 * 
 * API REST para el envío de comandas a impresora térmica por red.
 * 
 * Este endpoint recibe solicitudes POST desde el frontend y delega
 * la lógica al ComandaRedController para enviar la comanda utilizando
 * comandos ESC/POS a una impresora configurada por IP.
 * 
 * Funcionalidades:
 * - Recepción de solicitudes POST
 * - Envío de comandas a impresora térmica
 * - Respuestas en formato JSON
 * - Manejo centralizado de errores
 * 
 * Requisitos:
 * - Token de autenticación del colaborador
 * - Variables de entorno THERMAL_* configuradas
 * 
 * Incluye:
 * - Conversión de errores a excepciones
 * - Uso de buffer de salida para evitar respuestas incorrectas
 * @ package AP_Restaurante
 * @subpackage comandaRed.php
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
    require_once __DIR__ . '/../src/Controllers/ComandaRedController.php';

    // Limpiar cualquier salida previa
    ob_clean();

    // Crear instancia del controlador
    $controller = new \App\Controllers\ComandaRedController();
    $controller->handleRequest();

} catch (Throwable $e) {

    // Limpiar salida en caso de error
    ob_clean();

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}

// Enviar buffer
ob_end_flush();