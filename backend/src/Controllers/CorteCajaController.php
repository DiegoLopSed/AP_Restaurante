<?php
/**
 * Controlador CorteCajaController
 * GET: /api/corte_caja.php?fecha=YYYY-MM-DD&finalizados=1
 * Devuelve resumen + detalle de pedidos del día.
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/ReporteCaja.php';
require_once __DIR__ . '/../Models/CorteCaja.php';
require_once __DIR__ . '/../Models/Colaborador.php';

class CorteCajaController {
    private $model;
    private $corteModel;

    public function __construct() {
        $this->model = new \App\Models\ReporteCaja();
        $this->corteModel = new \App\Models\CorteCaja();
    }

    private function esManager(array $colab): bool {
        $pos = strtolower((string)($colab['posicion'] ?? ''));
        return strpos($pos, 'gerente') !== false || strpos($pos, 'admin') !== false;
    }

    private function getBearerToken(): ?string {
        $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

        // En algunos servidores el header llega solo vía getallheaders()
        if ($h === '') {
            try {
                $all = function_exists('getallheaders') ? getallheaders() : [];
                foreach ($all as $k => $v) {
                    if (strtolower((string)$k) === 'authorization') {
                        $h = (string)$v;
                        break;
                    }
                }
            } catch (\Throwable $e) {
                // noop
            }
        }

        if ($h !== '' && preg_match('/Bearer\s+(\S+)/i', $h, $m)) {
            return trim($m[1]);
        }
        return null;
    }

    private function colaboradorDesdeToken(): ?array {
        $token = $this->getBearerToken();
        if ($token === null || $token === '') return null;

        // El token viene en base64 (AuthController usa base64_encode).
        // Hacemos decode tolerante por si el token llega con padding/presentación distinta.
        $raw = base64_decode($token, true);
        if ($raw === false || $raw === '') {
            $tokenNorm = strtr($token, '-_', '+/');
            $pad = strlen($tokenNorm) % 4;
            if ($pad) {
                $tokenNorm .= str_repeat('=', 4 - $pad);
            }
            $raw = base64_decode($tokenNorm, true);
        }
        if ($raw === false || $raw === '') return null;
        if (strpos($raw, 'cliente:') === 0) return null;

        $parts = explode(':', $raw, 3);
        if (count($parts) < 2) return null;
        $id = (int)$parts[0];
        if ($id <= 0) return null;

        $col = new \App\Models\Colaborador();
        return $col->getById($id);
    }

    private function jsonResponse(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    public function handleRequest(): void {
        if (ob_get_level()) {
            ob_clean();
        }

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        try {
            // Requiere token de colaborador/manager (misma lógica que otros endpoints)
            $colab = $this->colaboradorDesdeToken();
            if (!$colab) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'No autorizado. Inicia sesión como colaborador.',
                ], 401);
                return;
            }

            $fecha = '';
            $finalizados = true;

            if ($method === 'GET') {
                $fecha = isset($_GET['fecha']) ? trim((string)$_GET['fecha']) : '';
                if ($fecha === '') {
                    $fecha = date('Y-m-d');
                }
                if (isset($_GET['finalizados'])) {
                    $finalizados = trim((string)$_GET['finalizados']) !== '0';
                }

                $data = $this->model->getCorteCajaDia($fecha, $finalizados);
                $this->jsonResponse(['success' => true, 'data' => $data]);
                return;
            }

            if ($method !== 'POST') {
                $this->jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
                return;
            }

            // Para guardar/cerrar corte de caja, sí requerimos manager.
            if (!$this->esManager($colab)) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo managers pueden guardar el corte de caja.',
                ], 403);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw ?: '', true);
            if (!is_array($input)) {
                throw new \Exception('JSON inválido');
            }

            if (isset($input['fecha'])) {
                $fecha = trim((string)$input['fecha']);
            }
            if ($fecha === '') $fecha = date('Y-m-d');

            if (isset($input['finalizados'])) {
                $finalizados = (bool)$input['finalizados'];
            }

            $reporte = $this->model->getCorteCajaDia($fecha, $finalizados);

            $idColab = isset($colab['id_colaborador']) ? (int)$colab['id_colaborador'] : null;
            $nombreColab = trim((string)($colab['nombre'] ?? '')) . ' ' . trim((string)($colab['apellido'] ?? ''));
            $nombreColab = trim(preg_replace('/\s+/', ' ', $nombreColab));
            $nombreColab = $nombreColab === '' ? null : $nombreColab;

            $idCorte = $this->corteModel->guardar(
                $fecha,
                $finalizados,
                $reporte['resumen'] ?? [],
                $idColab,
                $nombreColab
            );

            $this->jsonResponse([
                'success' => true,
                'data' => $reporte,
                'id_corte_caja' => $idCorte,
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}

