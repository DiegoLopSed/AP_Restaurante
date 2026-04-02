<?php
/**
 * Controlador de Productos
 * Maneja las peticiones HTTP y coordina con el modelo
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/Producto.php';

class ProductoController {
    private $model;

    public function __construct() {
        $this->model = new \App\Models\Producto();
    }

    /**
     * Manejar todas las peticiones
     */
    public function handleRequest() {
        if (ob_get_level()) {
            ob_clean();
        }

        $method = $_SERVER['REQUEST_METHOD'];

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        try {
            $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

            $input = null;
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
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

                default:
                    http_response_code(405);
                    $this->jsonResponse([
                        'success' => false,
                        'message' => 'Método no permitido'
                    ], 405);
            }
        } catch (\Exception $e) {
            http_response_code(400);
            $this->jsonResponse([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    private function handleGet($id) {
        if ($id) {
            $result = $this->model->getById($id);
            if ($result) {
                $this->jsonResponse([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Producto no encontrado'
                ], 404);
            }
        } else {
            $result = $this->model->getAll();
            $this->jsonResponse([
                'success' => true,
                'data' => $result
            ]);
        }
    }

    private function handlePost($input) {
        if (!$input) {
            throw new \Exception("Datos requeridos");
        }

        $result = $this->model->createWithInsumos($input);
        $this->jsonResponse($result, 201);
    }

    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}

