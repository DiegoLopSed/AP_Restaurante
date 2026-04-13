<?php
/**
 * Modelo PedidoProducto
 *
 * Encargado de gestionar las operaciones relacionadas con la tabla `pedido_producto`,
 * que representa las líneas o productos dentro de un pedido.
 *
 * Funcionalidades principales:
 * - Agregar productos a un pedido
 * - Actualizar cantidades de productos en un pedido
 * - Eliminar productos de un pedido
 * - Consultar líneas de un pedido
 * - Recalcular el total del pedido automáticamente
 *
 * Características:
 * - Validación de pedidos activos (status = 0)
 * - Uso de transacciones para integridad de datos
 * - Recalculo automático de totales
 * - Control de existencia de líneas
 * - Uso de PDO con prepared statements
 *
 * @package AP_Restaurante
 * @subpackage Models/PedidoProducto.php
 * @author Diego Lopez Sedeño
 * @version 1.0.0
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class PedidoProducto {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Verifica que el pedido esté activo (status = 0)
     *
     * @param int $idPedido
     * @return void
     * @throws \Exception
     */
    private function assertPedidoActivo(int $idPedido): void {
        $stmt = $this->db->prepare(
            "SELECT id_pedido 
             FROM pedido 
             WHERE id_pedido = :id_pedido AND status = 0"
        );

        $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
        $stmt->execute();

        if (!$stmt->fetch()) {
            throw new \Exception('Pedido no encontrado o no está activo');
        }
    }

    /**
     * Recalcula el total del pedido basado en sus productos
     *
     * @param int $idPedido
     * @return float
     */
    private function recalcularTotalPedido(int $idPedido): float {
        $stmt = $this->db->prepare(
            "SELECT COALESCE(SUM(subtotal), 0) AS total 
             FROM pedido_producto 
             WHERE id_pedido = :id_pedido"
        );

        $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();
        $nuevoTotal = (float)($row['total'] ?? 0);

        $stmtUpdate = $this->db->prepare(
            "UPDATE pedido 
             SET total = :total 
             WHERE id_pedido = :id_pedido"
        );

        $stmtUpdate->bindValue(':total', $nuevoTotal);
        $stmtUpdate->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
        $stmtUpdate->execute();

        return $nuevoTotal;
    }

    /**
     * Obtiene las líneas de un pedido activo
     *
     * @param int $idPedido
     * @return array
     */
    public function getLineasByPedido(int $idPedido): array {
        try {
            $this->assertPedidoActivo($idPedido);

            $sql = "SELECT pp.id_pedido, pp.id_producto, pp.cantidad, pp.precio_unitario, pp.subtotal,
                           pr.nombre AS nombre_producto
                    FROM pedido_producto pp
                    INNER JOIN productos pr ON pr.id_producto = pp.id_producto
                    WHERE pp.id_pedido = :id_pedido
                    ORDER BY pr.nombre ASC";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll();

        } catch (\Exception $e) {
            throw new \Exception("Error al obtener líneas del pedido: " . $e->getMessage());
        }
    }

    /**
     * Actualiza la cantidad de un producto dentro de un pedido
     *
     * @param array $data
     * @return array
     *
     * Datos esperados:
     * - id_pedido (int)
     * - id_producto (int)
     * - cantidad (int > 0)
     */
    public function updateCantidad(array $data): array {
        try {
            $idPedido = (int)($data['id_pedido'] ?? 0);
            $idProducto = (int)($data['id_producto'] ?? 0);
            $cantidad = (int)($data['cantidad'] ?? 0);

            if ($idPedido <= 0 || $idProducto <= 0 || $cantidad < 1) {
                throw new \Exception('Datos inválidos');
            }

            $this->db->beginTransaction();

            $this->assertPedidoActivo($idPedido);

            $stmt = $this->db->prepare(
                "SELECT 1 FROM pedido_producto 
                 WHERE id_pedido = :id_pedido AND id_producto = :id_producto"
            );

            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmt->execute();

            if (!$stmt->fetch()) {
                throw new \Exception('La línea no existe en este pedido');
            }

            $stmtProd = $this->db->prepare(
                "SELECT precio FROM productos 
                 WHERE id_producto = :id_producto AND estatus = 1"
            );

            $stmtProd->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmtProd->execute();

            $producto = $stmtProd->fetch();

            if (!$producto) {
                throw new \Exception('Producto no encontrado o inactivo');
            }

            $precioUnitario = (float)$producto['precio'];
            $subtotal = $precioUnitario * $cantidad;

            $stmtUpdate = $this->db->prepare(
                "UPDATE pedido_producto
                 SET cantidad = :cantidad,
                     precio_unitario = :precio_unitario,
                     subtotal = :subtotal
                 WHERE id_pedido = :id_pedido AND id_producto = :id_producto"
            );

            $stmtUpdate->bindValue(':cantidad', $cantidad, \PDO::PARAM_INT);
            $stmtUpdate->bindValue(':precio_unitario', $precioUnitario);
            $stmtUpdate->bindValue(':subtotal', $subtotal);
            $stmtUpdate->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmtUpdate->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmtUpdate->execute();

            $totalPedido = $this->recalcularTotalPedido($idPedido);

            $this->db->commit();

            return [
                'success' => true,
                'message' => 'Cantidad actualizada',
                'data' => [
                    'id_pedido' => $idPedido,
                    'id_producto' => $idProducto,
                    'cantidad' => $cantidad,
                    'total_pedido' => $totalPedido,
                ],
            ];

        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw new \Exception("Error al actualizar cantidad: " . $e->getMessage());
        }
    }

    /**
     * Elimina una línea de un pedido
     *
     * @param int $idPedido
     * @param int $idProducto
     * @return array
     */
    public function removeLinea(int $idPedido, int $idProducto): array {
        try {
            if ($idPedido <= 0 || $idProducto <= 0) {
                throw new \Exception('Datos inválidos');
            }

            $this->db->beginTransaction();

            $this->assertPedidoActivo($idPedido);

            $stmt = $this->db->prepare(
                "DELETE FROM pedido_producto 
                 WHERE id_pedido = :id_pedido AND id_producto = :id_producto"
            );

            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                throw new \Exception('La línea no existe en este pedido');
            }

            $totalPedido = $this->recalcularTotalPedido($idPedido);

            $this->db->commit();

            return [
                'success' => true,
                'message' => 'Producto eliminado del pedido',
                'data' => [
                    'id_pedido' => $idPedido,
                    'id_producto' => $idProducto,
                    'total_pedido' => $totalPedido,
                ],
            ];

        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw new \Exception("Error al eliminar línea: " . $e->getMessage());
        }
    }

    /**
     * Agrega un producto a un pedido
     *
     * @param array $data
     * @return array
     *
     * Datos esperados:
     * - id_pedido (int)
     * - id_producto (int)
     * - cantidad (int > 0)
     */
    public function addProducto(array $data): array {
        try {
            $idPedido = (int)($data['id_pedido'] ?? 0);
            $idProducto = (int)($data['id_producto'] ?? 0);
            $cantidad = (int)($data['cantidad'] ?? 0);

            if ($idPedido <= 0 || $idProducto <= 0 || $cantidad <= 0) {
                throw new \Exception("Datos inválidos");
            }

            $this->db->beginTransaction();

            $this->assertPedidoActivo($idPedido);

            $stmtProd = $this->db->prepare(
                "SELECT precio FROM productos 
                 WHERE id_producto = :id_producto AND estatus = 1"
            );

            $stmtProd->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmtProd->execute();

            $producto = $stmtProd->fetch();

            if (!$producto) {
                throw new \Exception("Producto no encontrado o inactivo");
            }

            $precioUnitario = (float)$producto['precio'];
            $subtotal = $precioUnitario * $cantidad;

            $stmtExiste = $this->db->prepare(
                "SELECT cantidad FROM pedido_producto 
                 WHERE id_pedido = :id_pedido AND id_producto = :id_producto"
            );

            $stmtExiste->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmtExiste->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmtExiste->execute();

            $linea = $stmtExiste->fetch();

            if ($linea) {
                $nuevaCantidad = (int)$linea['cantidad'] + $cantidad;
                $nuevoSubtotal = $precioUnitario * $nuevaCantidad;

                $stmtUpdate = $this->db->prepare(
                    "UPDATE pedido_producto 
                     SET cantidad = :cantidad,
                         precio_unitario = :precio_unitario,
                         subtotal = :subtotal
                     WHERE id_pedido = :id_pedido AND id_producto = :id_producto"
                );

                $stmtUpdate->bindValue(':cantidad', $nuevaCantidad, \PDO::PARAM_INT);
                $stmtUpdate->bindValue(':precio_unitario', $precioUnitario);
                $stmtUpdate->bindValue(':subtotal', $nuevoSubtotal);
                $stmtUpdate->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
                $stmtUpdate->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
                $stmtUpdate->execute();

                $cantidadFinal = $nuevaCantidad;

            } else {
                $stmtInsert = $this->db->prepare(
                    "INSERT INTO pedido_producto
                     (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                     VALUES
                     (:id_pedido, :id_producto, :cantidad, :precio_unitario, :subtotal)"
                );

                $stmtInsert->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
                $stmtInsert->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
                $stmtInsert->bindValue(':cantidad', $cantidad, \PDO::PARAM_INT);
                $stmtInsert->bindValue(':precio_unitario', $precioUnitario);
                $stmtInsert->bindValue(':subtotal', $subtotal);
                $stmtInsert->execute();

                $cantidadFinal = $cantidad;
            }

            $nuevoTotal = $this->recalcularTotalPedido($idPedido);

            $this->db->commit();

            return [
                'success' => true,
                'message' => 'Producto agregado al pedido',
                'data' => [
                    'id_pedido' => $idPedido,
                    'id_producto' => $idProducto,
                    'cantidad' => $cantidadFinal,
                    'total_pedido' => $nuevoTotal,
                ],
            ];

        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw new \Exception("Error al agregar producto: " . $e->getMessage());
        }
    }
}