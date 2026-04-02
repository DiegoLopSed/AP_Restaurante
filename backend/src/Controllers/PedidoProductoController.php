<?php
/**
 * Controlador de PedidoProducto
 * Maneja las peticiones HTTP para líneas de pedido (listar, agregar, actualizar cantidad, eliminar)
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/PedidoProducto.php';

class PedidoProductoController {
    private $model;

    public function __construct() {
        $this->model = new \App\Models\PedidoProducto();
    }

    public function handleRequest() {
        if (ob_get_level()) {
            ob_clean();
        }

        $method = $_SERVER['REQUEST_METHOD'];

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        try {
            switch ($method) {
                case 'GET':
                    $this->handleGet();
                    break;
                case 'POST':
                    $this->handlePost();
                    break;
                case 'PUT':
                    $this->handlePut();
                    break;
                case 'DELETE':
                    $this->handleDelete();
                    break;
                default:
                    $this->jsonResponse([
                        'success' => false,
                        'message' => 'Método no permitido',
                    ], 405);
            }
        } catch (\Exception $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    private function handleGet() {
        $idPedido = isset($_GET['id_pedido']) ? (int)$_GET['id_pedido'] : 0;
        if ($idPedido <= 0) {
            throw new \Exception('Parámetro id_pedido requerido');
        }
        $lineas = $this->model->getLineasByPedido($idPedido);
        $this->jsonResponse([
            'success' => true,
            'data' => $lineas,
        ]);
    }

    private function readJsonBody() {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('JSON inválido: ' . json_last_error_msg());
        }
        return $input;
    }

    private function handlePost() {
        $input = $this->readJsonBody();
        if (!$input) {
            throw new \Exception('Datos requeridos');
        }
        $result = $this->model->addProducto($input);
        $this->jsonResponse($result, 201);
    }

    private function handlePut() {
        $input = $this->readJsonBody();
        if (!$input) {
            throw new \Exception('Datos requeridos');
        }
        $result = $this->model->updateCantidad($input);
        $this->jsonResponse($result);
    }

    private function handleDelete() {
        $idPedido = isset($_GET['id_pedido']) ? (int)$_GET['id_pedido'] : 0;
        $idProducto = isset($_GET['id_producto']) ? (int)$_GET['id_producto'] : 0;
        $result = $this->model->removeLinea($idPedido, $idProducto);
        $this->jsonResponse($result);
    }

    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}
