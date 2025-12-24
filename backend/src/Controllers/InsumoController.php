<?php
/**
 * Controlador de Insumos
 * Maneja las peticiones HTTP y coordina con el modelo
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/Insumo.php';

class InsumoController {
    private $model;
    
    public function __construct() {
        // Usar el nombre completo de la clase con namespace
        $this->model = new \App\Models\Insumo();
    }
    
    /**
     * Manejar todas las peticiones
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
            // Obtener parámetros
            $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
            $categoria = isset($_GET['categoria']) ? (int)$_GET['categoria'] : null;
            $search = isset($_GET['search']) ? $_GET['search'] : null;
            
            // Obtener datos del body para POST/PUT
            $input = null;
            if ($method === 'POST' || $method === 'PUT') {
                $input = json_decode(file_get_contents('php://input'), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception("JSON inválido: " . json_last_error_msg());
                }
            }
            
            switch ($method) {
                case 'GET':
                    $this->handleGet($id, $categoria, $search);
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
    
    /**
     * Manejar peticiones GET
     */
    private function handleGet($id, $categoria, $search) {
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
                    'message' => 'Insumo no encontrado'
                ], 404);
            }
        } elseif ($categoria) {
            $result = $this->model->getByCategoria($categoria);
            $this->jsonResponse([
                'success' => true,
                'data' => $result
            ]);
        } elseif ($search) {
            $result = $this->model->search($search);
            $this->jsonResponse([
                'success' => true,
                'data' => $result
            ]);
        } else {
            $result = $this->model->getAll();
            $this->jsonResponse([
                'success' => true,
                'data' => $result
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
        
        $result = $this->model->update($id, $input);
        $this->jsonResponse($result);
    }
    
    /**
     * Manejar peticiones DELETE
     */
    private function handleDelete($id) {
        if (!$id) {
            throw new \Exception("ID requerido");
        }
        
        $result = $this->model->delete($id);
        $this->jsonResponse($result);
    }
    
    /**
     * Enviar respuesta JSON
     */
    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}

