<?php
/**
 * Modelo ReporteCaja
 *
 * Encargado de generar el reporte de corte de caja por día,
 * incluyendo resumen de ventas, pedidos y desglose por mesero.
 *
 * Funcionalidades principales:
 * - Generar resumen diario de ventas
 * - Obtener pedidos del día con sus líneas
 * - Calcular totales por método de pago
 * - Agrupar ventas por mesero
 *
 * Características:
 * - Validación de fecha en formato YYYY-MM-DD
 * - Uso de PDO con prepared statements
 * - Cálculo de agregados (SUM, COUNT)
 * - Estructuración de datos para reportes
 * - Relación entre pedidos y productos
 *
 * @package AP_Restaurante
 * @subpackage Models/ReporteCaja.php
 * @author Diego Lopez Sedeño
 * @version 1.0.0
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class ReporteCaja {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Valida que la fecha tenga formato YYYY-MM-DD
     *
     * @param string $fecha
     * @return string
     * @throws \Exception
     */
    private function validarFechaYmd(string $fecha): string {
        $f = trim($fecha);

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $f)) {
            throw new \Exception('Formato de fecha inválido. Usa YYYY-MM-DD');
        }

        return $f;
    }

    /**
     * Genera el corte de caja del día
     *
     * @param string $fechaYmd Fecha en formato YYYY-MM-DD
     * @param bool $finalizados Si true, solo incluye pedidos finalizados (status = 1)
     * @return array
     */
    public function getCorteCajaDia(string $fechaYmd, bool $finalizados = true): array {
        $fechaYmd = $this->validarFechaYmd($fechaYmd);

        $condStatus = $finalizados ? ' AND p.status = 1 ' : ' ';

        try {

            // =========================
            // RESUMEN GENERAL
            // =========================
            $sqlResumen = "SELECT
                    COUNT(*) AS num_pedidos,
                    COALESCE(SUM(p.total), 0) AS total_ventas,
                    COALESCE(SUM(CASE WHEN mp.id_metodo_pago = 1 THEN p.total ELSE 0 END), 0) AS total_efectivo,
                    COALESCE(SUM(CASE WHEN mp.id_metodo_pago = 2 THEN p.total ELSE 0 END), 0) AS total_tarjeta
                FROM pedido p
                LEFT JOIN metodo_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
                WHERE DATE(p.hora_entrada) = :fechaYmd {$condStatus}";

            $stmtResumen = $this->db->prepare($sqlResumen);
            $stmtResumen->bindValue(':fechaYmd', $fechaYmd, \PDO::PARAM_STR);
            $stmtResumen->execute();

            $resumen = $stmtResumen->fetch() ?: [];

            // =========================
            // PEDIDOS DEL DÍA
            // =========================
            $sqlPedidos = "SELECT
                    p.id_pedido,
                    p.nombre_cliente,
                    TRIM(COALESCE(p.nombre_mesero, '')) AS nombre_mesero,
                    p.id_metodo_pago,
                    mp.nombre_metodo AS metodo_pago_nombre,
                    p.status,
                    p.total,
                    p.hora_entrada,
                    p.hora_salida
                FROM pedido p
                LEFT JOIN metodo_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
                WHERE DATE(p.hora_entrada) = :fechaYmd {$condStatus}
                ORDER BY p.hora_entrada ASC, p.id_pedido DESC";

            $stmtPedidos = $this->db->prepare($sqlPedidos);
            $stmtPedidos->bindValue(':fechaYmd', $fechaYmd, \PDO::PARAM_STR);
            $stmtPedidos->execute();

            $pedidos = $stmtPedidos->fetchAll();

            // Mapear pedidos para anexar líneas
            $mapPedidos = [];
            foreach ($pedidos as &$p) {
                $id = (int)$p['id_pedido'];
                $p['lineas'] = [];
                $mapPedidos[$id] = &$p;
            }
            unset($p);

            // =========================
            // LÍNEAS DE PEDIDOS
            // =========================
            $sqlLineas = "SELECT
                    pp.id_pedido,
                    pp.id_producto,
                    pr.nombre AS nombre_producto,
                    pp.cantidad,
                    pp.precio_unitario,
                    pp.subtotal
                FROM pedido_producto pp
                INNER JOIN pedido p ON p.id_pedido = pp.id_pedido
                INNER JOIN productos pr ON pr.id_producto = pp.id_producto
                WHERE DATE(p.hora_entrada) = :fechaYmd {$condStatus}
                ORDER BY pp.id_pedido ASC, pr.nombre ASC";

            $stmtLineas = $this->db->prepare($sqlLineas);
            $stmtLineas->bindValue(':fechaYmd', $fechaYmd, \PDO::PARAM_STR);
            $stmtLineas->execute();

            $lineas = $stmtLineas->fetchAll();

            foreach ($lineas as $l) {
                $idPedido = (int)$l['id_pedido'];

                if (!isset($mapPedidos[$idPedido])) {
                    continue;
                }

                $mapPedidos[$idPedido]['lineas'][] = [
                    'id_producto' => (int)$l['id_producto'],
                    'nombre_producto' => $l['nombre_producto'],
                    'cantidad' => (int)$l['cantidad'],
                    'precio_unitario' => (float)$l['precio_unitario'],
                    'subtotal' => (float)$l['subtotal'],
                ];
            }

            // =========================
            // TOTALES POR MESERO
            // =========================
            $sqlPorMesero = "SELECT
                    TRIM(COALESCE(p.nombre_mesero, '')) AS nombre_mesero,
                    COUNT(*) AS num_pedidos,
                    COALESCE(SUM(p.total), 0) AS total_mesero
                FROM pedido p
                WHERE DATE(p.hora_entrada) = :fechaYmd {$condStatus}
                GROUP BY TRIM(COALESCE(p.nombre_mesero, ''))
                ORDER BY total_mesero DESC";

            $stmtPorMesero = $this->db->prepare($sqlPorMesero);
            $stmtPorMesero->bindValue(':fechaYmd', $fechaYmd, \PDO::PARAM_STR);
            $stmtPorMesero->execute();

            $porMeseroRows = $stmtPorMesero->fetchAll();

            $porMesero = [];
            foreach ($porMeseroRows as $r) {
                $nm = trim((string)($r['nombre_mesero'] ?? '')) ?: 'Sin mesero';

                $porMesero[] = [
                    'nombre_mesero' => $nm,
                    'num_pedidos' => (int)$r['num_pedidos'],
                    'total_mesero' => (float)$r['total_mesero'],
                ];
            }

            // =========================
            // RESPUESTA FINAL
            // =========================
            return [
                'fecha' => $fechaYmd,
                'finalizados' => $finalizados,
                'resumen' => [
                    'num_pedidos' => (int)($resumen['num_pedidos'] ?? 0),
                    'total_ventas' => (float)($resumen['total_ventas'] ?? 0),
                    'total_efectivo' => (float)($resumen['total_efectivo'] ?? 0),
                    'total_tarjeta' => (float)($resumen['total_tarjeta'] ?? 0),
                ],
                'por_mesero' => $porMesero,
                'pedidos' => $pedidos,
            ];

        } catch (\PDOException $e) {
            throw new \Exception('Error al generar corte de caja: ' . $e->getMessage());
        }
    }
}