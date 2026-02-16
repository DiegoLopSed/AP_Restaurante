<?php
/**
 * Controlador de Categorías
 * Maneja las peticiones HTTP para la gestión de categorías
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/Categoria.php';

class CategoriaController {
    private $model;

    public function __construct() {
        $this->model = new \App\Models\Categoria();
    }

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
        if ($id) {
            $categoria = $this->model->getById((int)$id);

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
            $categorias = $this->model->getAll();

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
        $result = $this->model->create($input);
        $this->jsonResponse($result, 201);
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
        $result = $this->model->update((int)$id, $input);
        $this->jsonResponse($result);
    }

    /**
     * Manejar peticiones DELETE
     */
    private function handleDelete($id) {
        if (!$id) {
            throw new \Exception("ID requerido");
        }
        $result = $this->model->delete((int)$id);
        $this->jsonResponse($result);
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
