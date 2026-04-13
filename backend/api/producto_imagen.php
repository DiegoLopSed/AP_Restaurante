<?php
/**
 * producto_imagen.php
 * 
 * API para servir la imagen de un producto almacenada en la base de datos.
 * 
 * Este endpoint recibe un ID por parámetro y devuelve la imagen
 * correspondiente desde la columna BLOB `imagen` de la tabla `productos`.
 * 
 * Funcionalidades:
 * - Validación de ID recibido por GET
 * - Consulta de imagen en base de datos
 * - Detección básica del tipo MIME (JPEG, PNG, GIF)
 * - Respuesta directa con el archivo binario
 * 
 * Respuestas:
 * - 200: Imagen devuelta correctamente
 * - 400: ID inválido
 * - 404: Imagen no encontrada
 * - 500: Error interno del servidor
 * @ package AP_Restaurante
 * @subpackage producto_imagen.php
 * @author Diego Lopez Sedeño
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = getDB();

    // Obtener ID desde la URL
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'ID inválido'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Consultar imagen en la base de datos
    $stmt = $db->prepare("SELECT imagen FROM productos WHERE id_producto = :id");
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || $row['imagen'] === null) {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Imagen no encontrada'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $binary = $row['imagen'];

    // Detectar tipo MIME básico
    $mime = 'image/jpeg';

    if (strncmp($binary, "\x89PNG", 4) === 0) {
        $mime = 'image/png';
    } elseif (strncmp($binary, "GIF8", 4) === 0) {
        $mime = 'image/gif';
    }

    // Enviar imagen al cliente
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . strlen($binary));

    echo $binary;

} catch (Throwable $e) {

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener imagen: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}