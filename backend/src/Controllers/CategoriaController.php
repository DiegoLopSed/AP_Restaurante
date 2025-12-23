<?php
/**
 * Controlador de Categorías
 * Maneja las peticiones HTTP para categorías
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';

class CategoriaController {
    
    /**
     * Manejar todas las peticiones
     */
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        // Headers CORS
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        // Manejar preflight requests
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
        
        try {
            if ($method === 'GET') {
                $this->handleGet();
            } else {
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
     * Obtener todas las categorías
     */
    private function handleGet() {
        $db = getDB();
        
        $sql = "SELECT id_categoria, nombre, descripcion FROM categoria ORDER BY nombre ASC";
        $stmt = $db->query($sql);
        $categorias = $stmt->fetchAll();
        
        $this->jsonResponse([
            'success' => true,
            'data' => $categorias
        ]);
    }
    
    /**
     * Enviar respuesta JSON
     */
    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}

