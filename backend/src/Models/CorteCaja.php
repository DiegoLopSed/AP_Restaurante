<?php
/**
 * Modelo CorteCaja
 *
 * Encargado de gestionar la persistencia y consulta de los cortes de caja diarios
 * dentro del sistema.
 *
 * Funcionalidades principales:
 * - Guardar o actualizar cortes de caja diarios
 * - Consultar historial de cortes
 * - Obtener un corte específico por ID
 *
 * Características:
 * - Validación de formato de fecha (YYYY-MM-DD)
 * - Uso de PDO con prepared statements
 * - Manejo de inserción y actualización (UPSERT manual)
 * - Paginación en consultas
 * - Manejo de excepciones controladas
 *
 * @package AP_Restaurante
 * @subpackage Models/CorteCaja.php
 * @author Diego Lopez Sedeño
 * @version 1.0.0
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class CorteCaja {
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
     * Guarda o actualiza un corte de caja diario
     *
     * Si ya existe un registro con la misma fecha y estado de finalización,
     * se actualiza en lugar de crear uno nuevo.
     *
     * @param string $fechaYmd Fecha en formato YYYY-MM-DD
     * @param bool $finalizados Indica si los pedidos están finalizados
     * @param array $resumen Datos del corte:
     *        - num_pedidos (int)
     *        - total_ventas (float)
     *        - total_efectivo (float)
     *        - total_tarjeta (float)
     * @param int|null $idColaborador ID del colaborador responsable
     * @param string|null $nombreColaborador Nombre del colaborador responsable
     * @return int ID del corte de caja
     * @throws \Exception
     */
    public function guardar(
        string $fechaYmd,
        bool $finalizados,
        array $resumen,
        ?int $idColaborador,
        ?string $nombreColaborador
    ): int {

        $fechaYmd = $this->validarFechaYmd($fechaYmd);
        $finalizadosInt = $finalizados ? 1 : 0;

        $numPedidos = (int)($resumen['num_pedidos'] ?? 0);
        $totalVentas = (float)($resumen['total_ventas'] ?? 0);
        $totalEfectivo = (float)($resumen['total_efectivo'] ?? 0);
        $totalTarjeta = (float)($resumen['total_tarjeta'] ?? 0);
        $nombreColaborador = $nombreColaborador ? trim($nombreColaborador) : null;

        try {
            $stmtExiste = $this->db->prepare(
                "SELECT id_corte_caja 
                 FROM corte_caja 
                 WHERE fecha = :fecha AND finalizados = :finalizados 
                 LIMIT 1"
            );

            $stmtExiste->bindValue(':fecha', $fechaYmd);
            $stmtExiste->bindValue(':finalizados', $finalizadosInt);
            $stmtExiste->execute();

            $row = $stmtExiste->fetch();

            if ($row && isset($row['id_corte_caja'])) {

                $idCorte = (int)$row['id_corte_caja'];

                $stmtUpdate = $this->db->prepare(
                    "UPDATE corte_caja
                     SET num_pedidos = :num_pedidos,
                         total_ventas = :total_ventas,
                         total_efectivo = :total_efectivo,
                         total_tarjeta = :total_tarjeta,
                         realizado_por_id_colaborador = :id_colaborador,
                         realizado_por_nombre = :nombre
                     WHERE id_corte_caja = :id"
                );

                $stmtUpdate->bindValue(':id', $idCorte);
                $stmtUpdate->bindValue(':num_pedidos', $numPedidos);
                $stmtUpdate->bindValue(':total_ventas', $totalVentas);
                $stmtUpdate->bindValue(':total_efectivo', $totalEfectivo);
                $stmtUpdate->bindValue(':total_tarjeta', $totalTarjeta);
                $stmtUpdate->bindValue(':id_colaborador', $idColaborador);
                $stmtUpdate->bindValue(':nombre', $nombreColaborador);

                $stmtUpdate->execute();

                return $idCorte;
            }

            $stmtInsert = $this->db->prepare(
                "INSERT INTO corte_caja
                    (fecha, finalizados, num_pedidos, total_ventas, total_efectivo, total_tarjeta,
                     realizado_por_id_colaborador, realizado_por_nombre)
                 VALUES
                    (:fecha, :finalizados, :num_pedidos, :total_ventas, :total_efectivo, :total_tarjeta,
                     :id_colaborador, :nombre)"
            );

            $stmtInsert->bindValue(':fecha', $fechaYmd);
            $stmtInsert->bindValue(':finalizados', $finalizadosInt);
            $stmtInsert->bindValue(':num_pedidos', $numPedidos);
            $stmtInsert->bindValue(':total_ventas', $totalVentas);
            $stmtInsert->bindValue(':total_efectivo', $totalEfectivo);
            $stmtInsert->bindValue(':total_tarjeta', $totalTarjeta);
            $stmtInsert->bindValue(':id_colaborador', $idColaborador);
            $stmtInsert->bindValue(':nombre', $nombreColaborador);

            $stmtInsert->execute();

            return (int)$this->db->lastInsertId();

        } catch (\PDOException $e) {
            throw new \Exception("Error al guardar corte de caja: " . $e->getMessage());
        }
    }

    /**
     * Lista el historial de cortes de caja
     *
     * @param int $limit Número máximo de registros
     * @param int $offset Desplazamiento para paginación
     * @return array
     */
    public function listarHistorial(int $limit = 50, int $offset = 0): array {
        $limit = max(1, min($limit, 500));
        $offset = max(0, $offset);

        $sql = "SELECT
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
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll() ?: [];
    }

    /**
     * Obtiene un corte de caja por ID
     *
     * @param int $idCorteCaja
     * @return array|null
     */
    public function getById(int $idCorteCaja): ?array {
        if ($idCorteCaja <= 0) {
            return null;
        }

        $stmt = $this->db->prepare(
            "SELECT * FROM corte_caja WHERE id_corte_caja = :id LIMIT 1"
        );

        $stmt->bindValue(':id', $idCorteCaja);
        $stmt->execute();

        $row = $stmt->fetch();

        return $row ?: null;
    }
}