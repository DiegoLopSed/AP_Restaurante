<?php
/**
 * export_corte_caja_pdf.php
 * 
 * API REST para exportar el corte de caja en formato PDF.
 * 
 * Este endpoint recibe solicitudes desde el frontend y delega
 * la lógica al ExportCorteCajaPdfController para generar y devolver
 * el archivo PDF con la información del corte de caja.
 * 
 * Funcionalidades:
 * - Generación de reporte en PDF
 * - Descarga del archivo desde el navegador
 * - Manejo centralizado de errores
 * 
 * Incluye:
 * - Conversión de errores a excepciones
 * - Uso de buffer de salida para evitar respuestas incorrectas
 * @ package AP_Restaurante
 * @subpackage export_corte_caja_pdf.php
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
    require_once __DIR__ . '/../src/Controllers/ExportCorteCajaPdfController.php';

    // Limpiar cualquier salida previa
    ob_clean();

    // Crear instancia del controlador
    $controller = new \App\Controllers\ExportCorteCajaPdfController();
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