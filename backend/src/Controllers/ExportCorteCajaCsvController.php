<?php
/**
 * ExportCorteCajaCsvController
 * GET: /backend/api/export_corte_caja_csv.php?id_corte_caja=ID
 * Descarga CSV con detalle del corte (pedidos y líneas).
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/CorteCaja.php';
require_once __DIR__ . '/../Models/ReporteCaja.php';
require_once __DIR__ . '/../Models/Colaborador.php';

class ExportCorteCajaCsvController {
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

    private function csvEscape($value): string {
        $s = (string)($value ?? '');
        $s = str_replace("\r", '', $s);
        $s = str_replace("\n", ' ', $s);
        if (strpos($s, '"') !== false) {
            $s = str_replace('"', '""', $s);
        }
        if (strpos($s, ',') !== false || strpos($s, '"') !== false) {
            $s = '"' . $s . '"';
        }
        return $s;
    }

    public function handleRequest(): void {
        if (ob_get_level()) ob_clean();

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if ($method === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        if ($method !== 'GET') {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido'], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $colab = $this->colaboradorDesdeToken();
            if (!$colab) {
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'No autorizado.'], JSON_UNESCAPED_UNICODE);
                return;
            }
            if (!$this->esManager($colab)) {
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Acceso denegado.'], JSON_UNESCAPED_UNICODE);
                return;
            }

            $idCorte = isset($_GET['id_corte_caja']) ? (int)$_GET['id_corte_caja'] : 0;
            if ($idCorte <= 0) throw new \Exception('id_corte_caja requerido');

            $corte = $this->corteModel->getById($idCorte);
            if (!$corte) throw new \Exception('Corte no encontrado');

            $fecha = (string)$corte['fecha'];
            $finalizados = ((int)($corte['finalizados'] ?? 1)) === 1;

            $reporte = $this->reporteModel->getCorteCajaDia($fecha, $finalizados);

            $resumen = $reporte['resumen'] ?? [];
            $pedidos = $reporte['pedidos'] ?? [];

            $filename = 'corte_caja_' . $fecha . '_' . ($finalizados ? 'finalizados' : 'todos') . '.csv';
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename=' . $filename);

            $out = [];
            // Cabecera de resumen
            $out[] = implode(',', [
                $this->csvEscape('Tipo'),
                $this->csvEscape($finalizados ? 'Finalizados (status=1)' : 'Todos'),
            ]);
            $out[] = implode(',', [
                $this->csvEscape('Fecha'),
                $this->csvEscape($fecha),
            ]);
            $out[] = implode(',', [
                $this->csvEscape('Num pedidos'),
                $this->csvEscape((int)($resumen['num_pedidos'] ?? 0)),
            ]);
            $out[] = implode(',', [
                $this->csvEscape('Total ventas'),
                $this->csvEscape((string)($resumen['total_ventas'] ?? 0)),
            ]);
            $out[] = implode(',', [
                $this->csvEscape('Total efectivo'),
                $this->csvEscape((string)($resumen['total_efectivo'] ?? 0)),
            ]);
            $out[] = implode(',', [
                $this->csvEscape('Total tarjeta'),
                $this->csvEscape((string)($resumen['total_tarjeta'] ?? 0)),
            ]);
            $out[] = ''; // línea en blanco

            // Encabezado de detalle
            $out[] = implode(',', [
                $this->csvEscape('id_pedido'),
                $this->csvEscape('hora_entrada'),
                $this->csvEscape('hora_salida'),
                $this->csvEscape('cliente'),
                $this->csvEscape('mesero'),
                $this->csvEscape('pago'),
                $this->csvEscape('total_pedido'),
                $this->csvEscape('id_producto'),
                $this->csvEscape('producto'),
                $this->csvEscape('cantidad'),
                $this->csvEscape('subtotal'),
            ]);

            foreach ($pedidos as $p) {
                $lineas = $p['lineas'] ?? [];
                if (!$lineas || count($lineas) === 0) {
                    $out[] = implode(',', [
                        $this->csvEscape($p['id_pedido'] ?? ''),
                        $this->csvEscape($p['hora_entrada'] ?? ''),
                        $this->csvEscape($p['hora_salida'] ?? ''),
                        $this->csvEscape($p['nombre_cliente'] ?? ''),
                        $this->csvEscape($p['nombre_mesero'] ?? ''),
                        $this->csvEscape($p['metodo_pago_nombre'] ?? ''),
                        $this->csvEscape($p['total'] ?? 0),
                        '',
                        '',
                        '',
                        '',
                    ]);
                    continue;
                }

                foreach ($lineas as $l) {
                    $out[] = implode(',', [
                        $this->csvEscape($p['id_pedido'] ?? ''),
                        $this->csvEscape($p['hora_entrada'] ?? ''),
                        $this->csvEscape($p['hora_salida'] ?? ''),
                        $this->csvEscape($p['nombre_cliente'] ?? ''),
                        $this->csvEscape($p['nombre_mesero'] ?? ''),
                        $this->csvEscape($p['metodo_pago_nombre'] ?? ''),
                        $this->csvEscape($p['total'] ?? 0),
                        $this->csvEscape($l['id_producto'] ?? ''),
                        $this->csvEscape($l['nombre_producto'] ?? ''),
                        $this->csvEscape($l['cantidad'] ?? ''),
                        $this->csvEscape($l['subtotal'] ?? 0),
                    ]);
                }
            }

            echo implode("\n", $out);
        } catch (\Exception $e) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}

