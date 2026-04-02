<?php
/**
 * Modelo Pedido
 * Maneja operaciones de base de datos para la tabla pedido
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class Pedido {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Pedidos finalizados (status = 1) atendidos por el mesero indicado (coincidencia exacta de nombre tras TRIM).
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
                    WHERE p.status = 1 AND TRIM(COALESCE(p.nombre_mesero, '')) = :nm
                    ORDER BY p.hora_salida DESC, p.id_pedido DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':nm', $nm, \PDO::PARAM_STR);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener registros de pedidos: " . $e->getMessage());
        }
    }

    /**
     * Un pedido activo por id (incluye método de pago), o null.
     */
    public function getActivoById(int $idPedido): ?array {
        if ($idPedido <= 0) {
            return null;
        }
        try {
            $sql = "SELECT p.*, m.nombre_metodo AS metodo_pago_nombre
                    FROM pedido p
                    LEFT JOIN metodo_pago m ON m.id_metodo_pago = p.id_metodo_pago
                    WHERE p.id_pedido = :id_pedido AND p.status = 0
                    LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch();
            return $row ?: null;
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener el pedido: " . $e->getMessage());
        }
    }

    /**
     * Obtener pedidos activos (status = 0)
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
     * Marca pedido como finalizado (status = 1) y registra hora de salida
     */
    public function finalizar(int $idPedido): array {
        try {
            if ($idPedido <= 0) {
                throw new \Exception("Pedido no válido");
            }
            $now = date('Y-m-d H:i:s');
            $stmt = $this->db->prepare(
                "UPDATE pedido SET status = 1, hora_salida = :hora_salida WHERE id_pedido = :id_pedido AND status = 0"
            );
            $stmt->bindValue(':hora_salida', $now, \PDO::PARAM_STR);
            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->execute();
            if ($stmt->rowCount() === 0) {
                throw new \Exception("Pedido no encontrado o ya finalizado");
            }
            return [
                'success' => true,
                'message' => 'Pedido finalizado',
                'data' => ['id_pedido' => $idPedido],
            ];
        } catch (\PDOException $e) {
            throw new \Exception("Error al finalizar pedido: " . $e->getMessage());
        }
    }

    /**
     * Elimina un pedido activo (y sus líneas por CASCADE)
     */
    public function eliminar(int $idPedido): array {
        try {
            if ($idPedido <= 0) {
                throw new \Exception("Pedido no válido");
            }
            $stmt = $this->db->prepare("DELETE FROM pedido WHERE id_pedido = :id_pedido AND status = 0");
            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->execute();
            if ($stmt->rowCount() === 0) {
                throw new \Exception("Pedido no encontrado o no se puede eliminar");
            }
            return [
                'success' => true,
                'message' => 'Pedido eliminado',
                'data' => ['id_pedido' => $idPedido],
            ];
        } catch (\PDOException $e) {
            throw new \Exception("Error al eliminar pedido: " . $e->getMessage());
        }
    }

    /**
     * Crear un nuevo pedido sencillo (sin líneas aún)
     *
     * Datos esperados:
     * - nombre_cliente (string, requerido)
     * - nombre_mesero (string, opcional)
     * - id_metodo_pago (int, opcional, por defecto 1)
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

            $sql = "INSERT INTO pedido (id_metodo_pago, status, nombre_cliente, nombre_mesero, total, factura, fecha, hora_entrada)
                    VALUES (:id_metodo_pago, 0, :nombre_cliente, :nombre_mesero, 0.00, 0.00, :fecha, :hora_entrada)";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_metodo_pago', $idMetodoPago, \PDO::PARAM_INT);
            $stmt->bindValue(':nombre_cliente', $nombreCliente, \PDO::PARAM_STR);
            $stmt->bindValue(':nombre_mesero', $nombreMesero, $nombreMesero === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
            $stmt->bindValue(':fecha', $now);
            $stmt->bindValue(':hora_entrada', $now);
            $stmt->execute();

            $idPedido = (int)$this->db->lastInsertId();

            return [
                'success' => true,
                'message' => 'Pedido creado exitosamente',
                'data' => [
                    'id_pedido' => $idPedido,
                ],
            ];
        } catch (\PDOException $e) {
            throw new \Exception("Error al crear pedido: " . $e->getMessage());
        }
    }
}

