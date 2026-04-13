<?php
/**
 * Modelo Pedido
 *
 * Encargado de gestionar las operaciones relacionadas con la tabla `pedido`
 * en la base de datos del sistema.
 *
 * Funcionalidades principales:
 * - Consultar pedidos activos
 * - Consultar pedidos finalizados por mesero
 * - Obtener pedido activo por ID
 * - Crear nuevos pedidos
 * - Finalizar pedidos
 * - Eliminar pedidos activos
 *
 * Características:
 * - Uso de PDO con prepared statements
 * - Manejo de estados del pedido (activo/finalizado)
 * - Validación básica de datos de entrada
 * - Uso de joins con método de pago
 * - Manejo de excepciones controladas
 *
 * @package AP_Restaurante
 * @subpackage Models/Pedido.php
 * @author Diego Lopez Sedeño
 * @version 1.0.0
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class Pedido {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Obtiene pedidos finalizados por nombre de mesero
     *
     * @param string $nombreMesero
     * @return array
     */
    public function getFinalizadosPorNombreMesero(string $nombreMesero): array {
        $nm = trim($nombreMesero);

        if ($nm === '') {
            return [];
        }

        try {
            $sql = "SELECT p.*, m.nombre_metodo AS metodo_pago_nombre
                    FROM pedido p
                    LEFT JOIN metodo_pago m ON m.id_metodo_pago = p.id_metodo_pago
                    WHERE p.status = 1
                    AND TRIM(COALESCE(p.nombre_mesero, '')) = :nm
                    ORDER BY p.hora_salida DESC, p.id_pedido DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':nm', $nm, \PDO::PARAM_STR);
            $stmt->execute();

            return $stmt->fetchAll();

        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener pedidos finalizados: " . $e->getMessage());
        }
    }

    /**
     * Obtiene un pedido activo por ID
     *
     * @param int $idPedido
     * @return array|null
     */
    public function getActivoById(int $idPedido): ?array {
        if ($idPedido <= 0) {
            return null;
        }

        try {
            $sql = "SELECT p.*, m.nombre_metodo AS metodo_pago_nombre
                    FROM pedido p
                    LEFT JOIN metodo_pago m ON m.id_metodo_pago = p.id_metodo_pago
                    WHERE p.id_pedido = :id_pedido
                    AND p.status = 0
                    LIMIT 1";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->execute();

            $row = $stmt->fetch();
            return $row ?: null;

        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener pedido: " . $e->getMessage());
        }
    }

    /**
     * Obtiene todos los pedidos activos
     *
     * @return array
     */
    public function getActivos(): array {
        try {
            $sql = "SELECT p.*, m.nombre_metodo AS metodo_pago_nombre
                    FROM pedido p
                    LEFT JOIN metodo_pago m ON m.id_metodo_pago = p.id_metodo_pago
                    WHERE p.status = 0
                    ORDER BY p.fecha DESC, p.hora_entrada DESC";

            $stmt = $this->db->query($sql);

            return $stmt->fetchAll();

        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener pedidos activos: " . $e->getMessage());
        }
    }

    /**
     * Finaliza un pedido (cambia status a 1)
     *
     * @param int $idPedido
     * @return array
     */
    public function finalizar(int $idPedido): array {
        try {
            if ($idPedido <= 0) {
                throw new \Exception("Pedido no válido");
            }

            $now = date('Y-m-d H:i:s');

            $stmt = $this->db->prepare(
                "UPDATE pedido
                 SET status = 1, hora_salida = :hora_salida
                 WHERE id_pedido = :id_pedido
                 AND status = 0"
            );

            $stmt->bindValue(':hora_salida', $now);
            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                throw new \Exception("Pedido no encontrado o ya finalizado");
            }

            return [
                'success' => true,
                'message' => 'Pedido finalizado exitosamente',
                'data' => ['id_pedido' => $idPedido],
            ];

        } catch (\PDOException $e) {
            throw new \Exception("Error al finalizar pedido: " . $e->getMessage());
        }
    }

    /**
     * Elimina un pedido activo
     *
     * @param int $idPedido
     * @return array
     */
    public function eliminar(int $idPedido): array {
        try {
            if ($idPedido <= 0) {
                throw new \Exception("Pedido no válido");
            }

            $stmt = $this->db->prepare(
                "DELETE FROM pedido
                 WHERE id_pedido = :id_pedido
                 AND status = 0"
            );

            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                throw new \Exception("Pedido no encontrado o no se puede eliminar");
            }

            return [
                'success' => true,
                'message' => 'Pedido eliminado exitosamente',
                'data' => ['id_pedido' => $idPedido],
            ];

        } catch (\PDOException $e) {
            throw new \Exception("Error al eliminar pedido: " . $e->getMessage());
        }
    }

    /**
     * Crea un nuevo pedido
     *
     * @param array $data
     * @return array
     *
     * Datos esperados:
     * - nombre_cliente (string, requerido)
     * - nombre_mesero (string, opcional)
     * - id_metodo_pago (int, opcional)
     */
    public function create(array $data): array {
        try {
            $nombreCliente = trim((string)($data['nombre_cliente'] ?? ''));
            $nombreMesero = isset($data['nombre_mesero']) ? trim((string)$data['nombre_mesero']) : null;
            $idMetodoPago = isset($data['id_metodo_pago']) ? (int)$data['id_metodo_pago'] : 1;

            if ($nombreCliente === '') {
                throw new \Exception("El nombre del cliente es requerido");
            }

            $now = date('Y-m-d H:i:s');

            $sql = "INSERT INTO pedido
                    (id_metodo_pago, status, nombre_cliente, nombre_mesero, total, factura, fecha, hora_entrada)
                    VALUES
                    (:id_metodo_pago, 0, :nombre_cliente, :nombre_mesero, 0.00, 0.00, :fecha, :hora_entrada)";

            $stmt = $this->db->prepare($sql);

            $stmt->bindValue(':id_metodo_pago', $idMetodoPago, \PDO::PARAM_INT);
            $stmt->bindValue(':nombre_cliente', $nombreCliente);
            $stmt->bindValue(':nombre_mesero', $nombreMesero, $nombreMesero === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
            $stmt->bindValue(':fecha', $now);
            $stmt->bindValue(':hora_entrada', $now);

            $stmt->execute();

            return [
                'success' => true,
                'message' => 'Pedido creado exitosamente',
                'data' => [
                    'id_pedido' => (int)$this->db->lastInsertId()
                ],
            ];

        } catch (\PDOException $e) {
            throw new \Exception("Error al crear pedido: " . $e->getMessage());
        }
    }
}