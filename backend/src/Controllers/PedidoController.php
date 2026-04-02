<?php
/**
 * Controlador de Pedidos
 * Maneja las peticiones HTTP para la gestión de pedidos
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/Pedido.php';
require_once __DIR__ . '/../Models/Colaborador.php';

class PedidoController {
    private $model;

    public function __construct() {
        $this->model = new \App\Models\Pedido();
    }

    private function getBearerToken(): ?string {
        $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($h !== '' && preg_match('/Bearer\s+(\S+)/i', $h, $m)) {
            return trim($m[1]);
        }
        return null;
    }

    /**
     * Resuelve colaborador autenticado por token (formato id:correo:timestamp en base64).
     * No aplica a tokens de cliente.
     */
    private function colaboradorDesdeToken(): ?array {
        $token = $this->getBearerToken();
        if ($token === null || $token === '') {
            return null;
        }
        $raw = base64_decode($token, true);
        if ($raw === false || $raw === '') {
            return null;
        }
        if (strpos($raw, 'cliente:') === 0) {
            return null;
        }
        $parts = explode(':', $raw, 3);
        if (count($parts) < 2) {
            return null;
        }
        $id = (int)$parts[0];
        if ($id <= 0) {
            return null;
        }
        $col = new \App\Models\Colaborador();
        return $col->getById($id);
    }

    public function handleRequest() {
        if (ob_get_level()) {
            ob_clean();
        }

        $method = $_SERVER['REQUEST_METHOD'];

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        try {
            $input = null;
            if (in_array($method, ['POST', 'PATCH'], true)) {
                $rawInput = file_get_contents('php://input');
                $input = json_decode($rawInput, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception("JSON inválido: " . json_last_error_msg());
                }
            }

            switch ($method) {
                case 'GET':
                    $this->handleGet();
                    break;
                case 'POST':
                    $this->handlePost($input);
                    break;
                case 'PATCH':
                    $this->handlePatch($input);
                    break;
                case 'DELETE':
                    $this->handleDelete();
                    break;
                default:
                    $this->jsonResponse([
                        'success' => false,
                        'message' => 'Método no permitido'
                    ], 405);
            }
        } catch (\Exception $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    private function handleGet() {
        $registros = isset($_GET['registros']) ? trim((string)$_GET['registros']) : '';
        if ($registros === '1') {
            $colab = $this->colaboradorDesdeToken();
            if (!$colab) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'No autorizado. Inicia sesión como colaborador.',
                ], 401);
                return;
            }
            $nombreMesero = trim((string)($colab['nombre'] ?? '')) . ' ' . trim((string)($colab['apellido'] ?? ''));
            $nombreMesero = trim(preg_replace('/\s+/', ' ', $nombreMesero));
            $pedidos = $this->model->getFinalizadosPorNombreMesero($nombreMesero);
            $this->jsonResponse([
                'success' => true,
                'data' => $pedidos,
            ]);
            return;
        }

        $pedidos = $this->model->getActivos();
        $this->jsonResponse([
            'success' => true,
            'data' => $pedidos
        ]);
    }

    private function handlePost($input) {
        if (!$input) {
            throw new \Exception("Datos requeridos");
        }
        $result = $this->model->create($input);
        $this->jsonResponse($result, 201);
    }

    private function handlePatch($input) {
        if (!$input) {
            throw new \Exception("Datos requeridos");
        }
        $idPedido = (int)($input['id_pedido'] ?? 0);
        $accion = isset($input['accion']) ? trim((string)$input['accion']) : '';
        if ($accion === 'finalizar') {
            $result = $this->model->finalizar($idPedido);
            $this->jsonResponse($result);
            return;
        }
        throw new \Exception("Acción no válida");
    }

    private function handleDelete() {
        $idPedido = isset($_GET['id_pedido']) ? (int)$_GET['id_pedido'] : 0;
        $result = $this->model->eliminar($idPedido);
        $this->jsonResponse($result);
    }

    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}

