<?php
/**
 * ExportCorteCajaPdfController
 * GET: /backend/api/export_corte_caja_pdf.php?id_corte_caja=ID
 * Devuelve un HTML imprimible (el navegador permite guardar como PDF).
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/CorteCaja.php';
require_once __DIR__ . '/../Models/ReporteCaja.php';
require_once __DIR__ . '/../Models/Colaborador.php';

class ExportCorteCajaPdfController {
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

    private function esc($s): string {
        return htmlspecialchars((string)($s ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
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

            $nombreLocal = env_value('NOMBRE_TICKET_RESTAURANTE', 'Restaurante') ?? 'Restaurante';

            $htmlPedidos = '';
            foreach ($pedidos as $p) {
                $lineas = $p['lineas'] ?? [];
                $htmlLineas = '';
                foreach ($lineas as $l) {
                    $htmlLineas .= '<tr>'
                        . '<td>' . $this->esc($l['cantidad'] ?? '') . '</td>'
                        . '<td>' . $this->esc($l['nombre_producto'] ?? '') . '</td>'
                        . '<td style="text-align:right">' . $this->esc('$' . number_format((float)($l['subtotal'] ?? 0), 2, '.', '')) . '</td>'
                        . '</tr>';
                }
                if ($htmlLineas === '') {
                    $htmlLineas = '<tr><td colspan="3" style="color:#666">Sin líneas</td></tr>';
                }

                $htmlPedidos .= '
                <div class="pedido">
                  <h3 class="pedidoTitle">Pedido #' . $this->esc($p['id_pedido'] ?? '') . ' · ' . $this->esc($p['nombre_cliente'] ?? '') . '</h3>
                  <div class="meta">
                    <div><b>Mesero:</b> ' . $this->esc($p['nombre_mesero'] ?? '') . '</div>
                    <div><b>Pago:</b> ' . $this->esc($p['metodo_pago_nombre'] ?? '') . '</div>
                    <div><b>Entrada:</b> ' . $this->esc($p['hora_entrada'] ?? '') . '</div>
                    ' . (!empty($p['hora_salida']) ? '<div><b>Salida:</b> ' . $this->esc($p['hora_salida'] ?? '') . '</div>' : '') . '
                    <div><b>Total:</b> ' . $this->esc('$' . number_format((float)($p['total'] ?? 0), 2, '.', '')) . '</div>
                  </div>
                  <table class="lines">
                    <thead>
                      <tr><th style="width:90px">Cant.</th><th>Producto</th><th style="width:140px; text-align:right">Subtotal</th></tr>
                    </thead>
                    <tbody>' . $htmlLineas . '</tbody>
                  </table>
                </div>
                ';
            }

            $typeLabel = $finalizados ? 'Finalizados (status=1)' : 'Todos';

            $html = '<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Corte de caja ' . $this->esc($fecha) . '</title>
  <style>
    @page { margin: 12mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; }
    .header { text-align:center; margin-bottom: 12px; }
    .header h1 { font-size: 18px; margin: 0; }
    .header .sub { color:#444; font-size: 13px; margin-top: 6px; }
    .summary { width:100%; border:1px solid #ddd; border-radius:8px; padding:10px; margin-bottom: 14px; }
    .summaryGrid { display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; }
    .sumItem { border:1px solid #eee; border-radius:6px; padding:10px; }
    .sumItem .k { color:#666; font-size: 12px; }
    .sumItem .v { font-weight:700; margin-top:4px; }
    table { width:100%; border-collapse: collapse; }
    .lines { margin-top: 8px; }
    .lines th { font-size: 12px; border-bottom: 1px solid #ddd; padding: 6px 4px; text-align:left; }
    .lines td { border-bottom: 1px solid #f0f0f0; padding: 6px 4px; vertical-align: top; font-size: 12px; }
    .pedido { page-break-after: always; margin-top: 16px; }
    .pedidoTitle { font-size: 14px; margin: 0 0 8px; }
    .meta { display:grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; color:#222; font-size: 12px; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>' . $this->esc($nombreLocal) . '</h1>
    <div class="sub">Corte de caja - ' . $this->esc($fecha) . ' · ' . $this->esc($typeLabel) . '</div>
    <div class="sub">Realizado por: ' . $this->esc($corte['realizado_por_nombre'] ?? '') . '</div>
  </div>

  <div class="summary">
    <div class="summaryGrid">
      <div class="sumItem"><div class="k">Pedidos</div><div class="v">' . $this->esc((int)($resumen['num_pedidos'] ?? 0)) . '</div></div>
      <div class="sumItem"><div class="k">Total ventas</div><div class="v">$' . $this->esc(number_format((float)($resumen['total_ventas'] ?? 0), 2, '.', '')) . '</div></div>
      <div class="sumItem"><div class="k">Efectivo</div><div class="v">$' . $this->esc(number_format((float)($resumen['total_efectivo'] ?? 0), 2, '.', '')) . '</div></div>
      <div class="sumItem"><div class="k">Tarjeta</div><div class="v">$' . $this->esc(number_format((float)($resumen['total_tarjeta'] ?? 0), 2, '.', '')) . '</div></div>
      <div class="sumItem"><div class="k">Total pedidos</div><div class="v">' . $this->esc((int)($resumen['num_pedidos'] ?? 0)) . '</div></div>
      <div class="sumItem"><div class="k">Generado</div><div class="v">' . $this->esc(date('d/m/Y H:i')) . '</div></div>
    </div>
  </div>

  <div class="content">
    ' . $htmlPedidos . '
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>';

            header('Content-Type: text/html; charset=utf-8');
            echo $html;
        } catch (\Exception $e) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}

