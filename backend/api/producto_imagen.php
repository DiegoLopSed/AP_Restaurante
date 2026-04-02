<?php
/**
 * Sirve la imagen de un producto desde la columna BLOB `imagen`
 */

require_once __DIR__ . '/../config/database.php';

try {
    $db = getDB();

    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'ID inválido'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $db->prepare("SELECT imagen FROM productos WHERE id_producto = :id");
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || $row['imagen'] === null) {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'Imagen no encontrada'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $binary = $row['imagen'];

    // Intentar detectar tipo de imagen de forma muy básica (por cabecera mágica)
    $mime = 'image/jpeg';
    if (strncmp($binary, "\x89PNG", 4) === 0) {
        $mime = 'image/png';
    } elseif (strncmp($binary, "GIF8", 4) === 0) {
        $mime = 'image/gif';
    }

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

