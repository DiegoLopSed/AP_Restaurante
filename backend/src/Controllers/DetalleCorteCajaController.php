<?php
/**
 * DetalleCorteCajaController
 * GET: /backend/api/detalle_corte_caja.php?id_corte_caja=ID
 * Devuelve reporte completo (resumen + pedidos + líneas) para el corte.
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/CorteCaja.php';
require_once __DIR__ . '/../Models/ReporteCaja.php';
require_once __DIR__ . '/../Models/Colaborador.php';

class DetalleCorteCajaController {
    private $corteModel;
    private $reporteModel;

    public function __construct() {
        $this->corteModel = new \App\Models\CorteCaja();
        $this->reporteModel = new \App\Models\ReporteCaja();
    }

    private function esManager(array $colab): bool {
        $pos = strtolower((string)($colab['posicion'] ?? ''));
        return strpos($pos, 'gerente') !== false || strpos($pos, 'admin') !== false;
    }

    private function getBearerToken(): ?string {
        $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
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

        $raw = base64_decode($token, true);
        if ($raw === false || $raw === '') {
            $tokenNorm = strtr($token, '-_', '+/');
            $pad = strlen($tokenNorm) % 4;
            if ($pad) $tokenNorm .= str_repeat('=', 4 - $pad);
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
        if (ob_get_level()) ob_clean();

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        if ($method !== 'GET') {
            $this->jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            return;
        }

        try {
            $colab = $this->colaboradorDesdeToken();
            if (!$colab) {
                $this->jsonResponse(['success' => false, 'message' => 'No autorizado. Inicia sesión como colaborador.'], 401);
                return;
            }
            if (!$this->esManager($colab)) {
                $this->jsonResponse(['success' => false, 'message' => 'Acceso denegado. Solo managers.'], 403);
                return;
            }

            $idCorte = isset($_GET['id_corte_caja']) ? (int)$_GET['id_corte_caja'] : 0;
            if ($idCorte <= 0) {
                throw new \Exception('id_corte_caja requerido');
            }

            $corte = $this->corteModel->getById($idCorte);
            if (!$corte) {
                $this->jsonResponse(['success' => false, 'message' => 'Corte no encontrado'], 404);
                return;
            }

            $fecha = $corte['fecha'];
            $finalizados = ((int)($corte['finalizados'] ?? 1)) === 1;
            $reporte = $this->reporteModel->getCorteCajaDia($fecha, $finalizados);

            $this->jsonResponse(['success' => true, 'data' => $reporte, 'id_corte_caja' => $idCorte]);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}

