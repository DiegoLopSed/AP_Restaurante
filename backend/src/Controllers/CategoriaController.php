<?php
/**
 * Controlador de Categorías
 * Maneja las peticiones HTTP para la gestión de categorías
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';

class CategoriaController {

    /**
     * Manejar todas las peticiones HTTP
     */
    public function handleRequest() {
        // Limpiar cualquier salida previa
        if (ob_get_level()) {
            ob_clean();
        }

        $method = $_SERVER['REQUEST_METHOD'];

        // Headers CORS (deben ir antes de cualquier salida)
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        // Manejar preflight requests
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        try {
            // Obtener y validar ID
            $id = isset($_GET['id']) ? $this->validateId($_GET['id']) : null;

            // Obtener datos del body para POST/PUT
            $input = null;
            if ($method === 'POST' || $method === 'PUT') {
                $rawInput = file_get_contents('php://input');
                $input = json_decode($rawInput, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception("JSON inválido: " . json_last_error_msg());
                }
            }

            switch ($method) {
                case 'GET':
                    $this->handleGet($id);
                    break;

                case 'POST':
                    $this->handlePost($input);
                    break;

                case 'PUT':
                    $this->handlePut($id, $input);
                    break;

                case 'DELETE':
                    $this->handleDelete($id);
                    break;

                default:
                    $this->jsonResponse([
                        'success' => false,
                        'message' => 'Método no permitido'
                    ], 405);
            }

        } catch (\PDOException $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Error de base de datos: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Manejar peticiones GET
     */
    private function handleGet($id) {
        $db = getDB();

        if ($id) {
            // Obtener una categoría específica
            $stmt = $db->prepare(
                "SELECT * FROM categoria WHERE id_categoria = ?"
            );
            $stmt->execute([$id]);
            $categoria = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$categoria) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Categoría no encontrada'
                ], 404);
                return;
            }

            $this->jsonResponse([
                'success' => true,
                'data' => $categoria
            ]);
        } else {
            // Obtener todas las categorías
            $stmt = $db->query(
                "SELECT * FROM categoria ORDER BY nombre ASC"
            );
            $categorias = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $this->jsonResponse([
                'success' => true,
                'data' => $categorias
            ]);
        }
    }

    /**
     * Manejar peticiones POST
     */
    private function handlePost($input) {
        if (!$input) {
            throw new \Exception("Datos requeridos");
        }

        // Validar datos de entrada
        $this->validateCategoriaData($input);

        $db = getDB();

        // Verificar si ya existe una categoría con el mismo nombre (case-insensitive)
        $nombreNormalizado = trim($input['nombre']);
        $stmt = $db->prepare(
            "SELECT id_categoria FROM categoria WHERE LOWER(nombre) = LOWER(?)"
        );
        $stmt->execute([$nombreNormalizado]);
        if ($stmt->fetch()) {
            throw new \Exception("Ya existe una categoría con ese nombre");
        }

        // Insertar nueva categoría
        $stmt = $db->prepare(
            "INSERT INTO categoria (nombre, descripcion)
             VALUES (?, ?)"
        );

        $nombreNormalizado = trim($input['nombre']);
        $descripcionNormalizada = isset($input['descripcion']) ? trim($input['descripcion']) : null;
        
        $stmt->execute([
            $nombreNormalizado,
            $descripcionNormalizada
        ]);

        $idCategoria = $db->lastInsertId();

        $this->jsonResponse([
            'success' => true,
            'message' => 'Categoría creada exitosamente',
            'data' => ['id_categoria' => $idCategoria]
        ], 201);
    }

    /**
     * Manejar peticiones PUT
     */
    private function handlePut($id, $input) {
        if (!$id) {
            throw new \Exception("ID requerido");
        }

        if (!$input) {
            throw new \Exception("Datos requeridos");
        }

        // Validar datos de entrada
        $this->validateCategoriaData($input);

        $db = getDB();

        // Verificar que la categoría existe
        $stmt = $db->prepare(
            "SELECT id_categoria FROM categoria WHERE id_categoria = ?"
        );
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Categoría no encontrada");
        }

        // Verificar si ya existe otra categoría con el mismo nombre (case-insensitive)
        $nombreNormalizado = trim($input['nombre']);
        $stmt = $db->prepare(
            "SELECT id_categoria FROM categoria WHERE LOWER(nombre) = LOWER(?) AND id_categoria != ?"
        );
        $stmt->execute([$nombreNormalizado, $id]);
        if ($stmt->fetch()) {
            throw new \Exception("Ya existe otra categoría con ese nombre");
        }

        // Actualizar categoría
        $stmt = $db->prepare(
            "UPDATE categoria
             SET nombre = ?, descripcion = ?
             WHERE id_categoria = ?"
        );

        $nombreNormalizado = trim($input['nombre']);
        $descripcionNormalizada = isset($input['descripcion']) ? trim($input['descripcion']) : null;
        
        $stmt->execute([
            $nombreNormalizado,
            $descripcionNormalizada,
            $id
        ]);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Categoría actualizada exitosamente'
        ]);
    }

    /**
     * Manejar peticiones DELETE
     */
    private function handleDelete($id) {
        if (!$id) {
            throw new \Exception("ID requerido");
        }

        $db = getDB();

        // Verificar que la categoría existe
        $stmt = $db->prepare(
            "SELECT id_categoria FROM categoria WHERE id_categoria = ?"
        );
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Categoría no encontrada");
        }

        // Verificar si hay insumos o productos asociados
        $stmt = $db->prepare(
            "SELECT COUNT(*) as count FROM insumo WHERE id_categoria = ?"
        );
        $stmt->execute([$id]);
        $insumos = $stmt->fetch(\PDO::FETCH_ASSOC);

        $stmt = $db->prepare(
            "SELECT COUNT(*) as count FROM productos WHERE id_categoria = ?"
        );
        $stmt->execute([$id]);
        $productos = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($insumos['count'] > 0 || $productos['count'] > 0) {
            throw new \Exception(
                "No se puede eliminar la categoría porque tiene " .
                ($insumos['count'] > 0 ? "{$insumos['count']} insumo(s)" : "") .
                ($insumos['count'] > 0 && $productos['count'] > 0 ? " y " : "") .
                ($productos['count'] > 0 ? "{$productos['count']} producto(s)" : "") .
                " asociado(s)"
            );
        }

        // Eliminar categoría
        $stmt = $db->prepare(
            "DELETE FROM categoria WHERE id_categoria = ?"
        );

        $stmt->execute([$id]);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Categoría eliminada exitosamente'
        ]);
    }

    /**
     * Validar datos de categoría
     */
    private function validateCategoriaData($input) {
        if (empty($input['nombre']) || !is_string($input['nombre'])) {
            throw new \Exception("El nombre es requerido y debe ser una cadena de texto");
        }

        $nombre = trim($input['nombre']);
        if (strlen($nombre) < 2) {
            throw new \Exception("El nombre debe tener al menos 2 caracteres");
        }

        if (strlen($nombre) > 255) {
            throw new \Exception("El nombre no puede exceder 255 caracteres");
        }

        if (isset($input['descripcion']) && !is_string($input['descripcion'])) {
            throw new \Exception("La descripción debe ser una cadena de texto");
        }

        if (isset($input['descripcion']) && strlen($input['descripcion']) > 1000) {
            throw new \Exception("La descripción no puede exceder 1000 caracteres");
        }
    }

    /**
     * Validar y sanitizar ID
     */
    private function validateId($id) {
        if (empty($id)) {
            return null;
        }

        if (!is_numeric($id)) {
            throw new \Exception("ID inválido");
        }

        $id = (int)$id;
        if ($id <= 0) {
            throw new \Exception("ID debe ser un número positivo");
        }

        return $id;
    }

    /**
     * Enviar respuesta JSON
     */
    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}
