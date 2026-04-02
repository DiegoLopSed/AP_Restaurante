<?php
/**
 * Modelo CorteCaja
 * Persistencia del resumen general de un corte de caja por día.
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class CorteCaja {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    private function validarFechaYmd(string $fecha): string {
        $f = trim($fecha);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $f)) {
            throw new \Exception('Formato de fecha inválido. Usa YYYY-MM-DD');
        }
        return $f;
    }

    /**
     * Guarda el corte de caja. Si ya existe (fecha + finalizados), actualiza totales y responsable.
     *
     * @param string $fechaYmd YYYY-MM-DD
     * @param bool $finalizados
     * @param array $resumen { num_pedidos, total_ventas, total_efectivo, total_tarjeta }
     * @param int|null $idColaborador
     * @param string|null $nombreColaborador
     * @return int id_corte_caja
     */
    public function guardar(string $fechaYmd, bool $finalizados, array $resumen, ?int $idColaborador, ?string $nombreColaborador): int {
        $fechaYmd = $this->validarFechaYmd($fechaYmd);
        $finalizadosInt = $finalizados ? 1 : 0;

        $numPedidos = (int)($resumen['num_pedidos'] ?? 0);
        $totalVentas = (float)($resumen['total_ventas'] ?? 0);
        $totalEfectivo = (float)($resumen['total_efectivo'] ?? 0);
        $totalTarjeta = (float)($resumen['total_tarjeta'] ?? 0);
        $nombreColaborador = $nombreColaborador != null ? trim((string)$nombreColaborador) : null;

        try {
            $stmtExiste = $this->db->prepare(
                'SELECT id_corte_caja FROM corte_caja WHERE fecha = :fecha AND finalizados = :finalizados LIMIT 1'
            );
            $stmtExiste->bindValue(':fecha', $fechaYmd, \PDO::PARAM_STR);
            $stmtExiste->bindValue(':finalizados', $finalizadosInt, \PDO::PARAM_INT);
            $stmtExiste->execute();
            $row = $stmtExiste->fetch();

            if ($row && isset($row['id_corte_caja'])) {
                $idCorte = (int)$row['id_corte_caja'];
                $stmtUpdate = $this->db->prepare(
                    'UPDATE corte_caja
                     SET num_pedidos = :num_pedidos,
                         total_ventas = :total_ventas,
                         total_efectivo = :total_efectivo,
                         total_tarjeta = :total_tarjeta,
                         realizado_por_id_colaborador = :realizado_por_id_colaborador,
                         realizado_por_nombre = :realizado_por_nombre
                     WHERE id_corte_caja = :id_corte_caja'
                );
                $stmtUpdate->bindValue(':id_corte_caja', $idCorte, \PDO::PARAM_INT);
                $stmtUpdate->bindValue(':num_pedidos', $numPedidos);
                $stmtUpdate->bindValue(':total_ventas', $totalVentas);
                $stmtUpdate->bindValue(':total_efectivo', $totalEfectivo);
                $stmtUpdate->bindValue(':total_tarjeta', $totalTarjeta);
                $stmtUpdate->bindValue(
                    ':realizado_por_id_colaborador',
                    $idColaborador,
                    $idColaborador === null ? \PDO::PARAM_NULL : \PDO::PARAM_INT
                );
                $stmtUpdate->bindValue(
                    ':realizado_por_nombre',
                    $nombreColaborador,
                    $nombreColaborador === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR
                );
                $stmtUpdate->execute();

                return $idCorte;
            }

            $stmtInsert = $this->db->prepare(
                'INSERT INTO corte_caja
                    (fecha, finalizados, num_pedidos, total_ventas, total_efectivo, total_tarjeta,
                     realizado_por_id_colaborador, realizado_por_nombre)
                 VALUES
                    (:fecha, :finalizados, :num_pedidos, :total_ventas, :total_efectivo, :total_tarjeta,
                     :realizado_por_id_colaborador, :realizado_por_nombre)'
            );
            $stmtInsert->bindValue(':fecha', $fechaYmd, \PDO::PARAM_STR);
            $stmtInsert->bindValue(':finalizados', $finalizadosInt, \PDO::PARAM_INT);
            $stmtInsert->bindValue(':num_pedidos', $numPedidos, \PDO::PARAM_INT);
            $stmtInsert->bindValue(':total_ventas', $totalVentas);
            $stmtInsert->bindValue(':total_efectivo', $totalEfectivo);
            $stmtInsert->bindValue(':total_tarjeta', $totalTarjeta);
            $stmtInsert->bindValue(
                ':realizado_por_id_colaborador',
                $idColaborador,
                $idColaborador === null ? \PDO::PARAM_NULL : \PDO::PARAM_INT
            );
            $stmtInsert->bindValue(
                ':realizado_por_nombre',
                $nombreColaborador,
                $nombreColaborador === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR
            );
            $stmtInsert->execute();

            return (int)$this->db->lastInsertId();
        } catch (\PDOException $e) {
            throw new \Exception('Error al guardar corte de caja: ' . $e->getMessage());
        }
    }

    /**
     * Lista historial de cortes (solo info general).
     *
     * @return array
     */
    public function listarHistorial(int $limit = 50, int $offset = 0): array {
        $limit = max(1, min($limit, 500));
        $offset = max(0, $offset);

        try {
            $sql = 'SELECT
                        id_corte_caja,
                        fecha,
                        finalizados,
                        num_pedidos,
                        total_ventas,
                        total_efectivo,
                        total_tarjeta,
                        realizado_por_id_colaborador,
                        realizado_por_nombre,
                        created_at
                    FROM corte_caja
                    ORDER BY fecha DESC, id_corte_caja DESC
                    LIMIT :limit OFFSET :offset';

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll() ?: [];
        } catch (\PDOException $e) {
            throw new \Exception('Error al listar historial: ' . $e->getMessage());
        }
    }

    /**
     * Obtiene un corte por id.
     */
    public function getById(int $idCorteCaja): ?array {
        if ($idCorteCaja <= 0) return null;

        try {
            $stmt = $this->db->prepare(
                'SELECT
                    id_corte_caja,
                    fecha,
                    finalizados,
                    num_pedidos,
                    total_ventas,
                    total_efectivo,
                    total_tarjeta,
                    realizado_por_id_colaborador,
                    realizado_por_nombre,
                    created_at
                 FROM corte_caja
                 WHERE id_corte_caja = :id
                 LIMIT 1'
            );
            $stmt->bindValue(':id', $idCorteCaja, \PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch();
            return $row ?: null;
        } catch (\PDOException $e) {
            throw new \Exception('Error al obtener corte: ' . $e->getMessage());
        }
    }
}

