<?php
/**
 * Envío de comandas a impresora térmica por red (ESC/POS en TCP).
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/Pedido.php';
require_once __DIR__ . '/../Models/PedidoProducto.php';
require_once __DIR__ . '/../Models/Colaborador.php';
require_once __DIR__ . '/../Services/ImpresoraTermicaEscPos.php';

class ComandaRedController {
    private $pedidoModel;
    private $lineaModel;

    public function __construct() {
        $this->pedidoModel = new \App\Models\Pedido();
        $this->lineaModel = new \App\Models\PedidoProducto();
    }

    private function getBearerToken(): ?string {
        $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if ($h !== '' && preg_match('/Bearer\s+(\S+)/i', $h, $m)) {
            return trim($m[1]);
        }
        return null;
    }

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

    private function nombreMeseroDesdeColab(array $colab): string {
        $nombre = trim((string)($colab['nombre'] ?? '')) . ' ' . trim((string)($colab['apellido'] ?? ''));
        return trim(preg_replace('/\s+/', ' ', $nombre));
    }

    public function handleRequest(): void {
        if (ob_get_level()) {
            ob_clean();
        }

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        if ($method !== 'POST') {
            $this->jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            return;
        }

        try {
            $colab = $this->colaboradorDesdeToken();
            if (!$colab) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'No autorizado. Inicia sesión como colaborador.',
                ], 401);
                return;
            }

            $host = env_value('THERMAL_PRINTER_HOST', '');
            if ($host === null || trim((string)$host) === '') {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Impresora de red no configurada. Defina THERMAL_PRINTER_HOST en el archivo .env del proyecto.',
                ], 503);
                return;
            }
            if (trim((string)env_value('THERMAL_PRINTER_ENABLED', '1')) === '0') {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Impresora térmica desactivada (THERMAL_PRINTER_ENABLED=0).',
                ], 503);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw ?: '', true);
            if (!is_array($input)) {
                throw new \Exception('JSON inválido');
            }

            $idPedido = (int)($input['id_pedido'] ?? 0);
            if ($idPedido <= 0) {
                throw new \Exception('id_pedido requerido');
            }

            $pedido = $this->pedidoModel->getActivoById($idPedido);
            if (!$pedido) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Pedido no encontrado o no está activo',
                ], 404);
                return;
            }

            $lineas = $this->lineaModel->getLineasByPedido($idPedido);

            $nombreMesero = $this->nombreMeseroDesdeColab($colab);
            $nombreLocal = env_value('NOMBRE_TICKET_RESTAURANTE', 'Restaurante') ?? 'Restaurante';
            $nombreLocal = trim((string)$nombreLocal);
            if ($nombreLocal === '') {
                $nombreLocal = 'Restaurante';
            }

            $port = (int)env_value('THERMAL_PRINTER_PORT', '9100');
            $timeout = (float)env_value('THERMAL_PRINTER_TIMEOUT', '8');
            $ancho = (int)env_value('THERMAL_PRINTER_ANCHO', '42');

            $payload = \App\Services\ImpresoraTermicaEscPos::construirComanda(
                $pedido,
                $lineas,
                $nombreMesero,
                $nombreLocal,
                $ancho
            );

            \App\Services\ImpresoraTermicaEscPos::enviarBytes(trim($host), $port, $timeout, $payload);

            $this->jsonResponse([
                'success' => true,
                'message' => 'Comanda enviada a la impresora',
                'data' => ['id_pedido' => $idPedido],
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    private function jsonResponse(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}
