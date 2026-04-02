<?php
/**
 * Modelo PedidoProducto
 * Maneja operaciones para la tabla pedido_producto
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class PedidoProducto {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Verifica que el pedido exista y esté activo (status = 0)
     */
    private function assertPedidoActivo(int $idPedido): void {
        $stmt = $this->db->prepare('SELECT id_pedido FROM pedido WHERE id_pedido = :id_pedido AND status = 0');
        $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
        $stmt->execute();
        if (!$stmt->fetch()) {
            throw new \Exception('Pedido no encontrado o no está activo');
        }
    }

    /**
     * Recalcula y persiste el total del pedido a partir de las líneas
     */
    private function recalcularTotalPedido(int $idPedido): float {
        $stmtTotal = $this->db->prepare(
            'SELECT COALESCE(SUM(subtotal), 0) AS total FROM pedido_producto WHERE id_pedido = :id_pedido'
        );
        $stmtTotal->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
        $stmtTotal->execute();
        $rowTotal = $stmtTotal->fetch();
        $nuevoTotal = (float)($rowTotal['total'] ?? 0);

        $stmtUpdatePedido = $this->db->prepare('UPDATE pedido SET total = :total WHERE id_pedido = :id_pedido');
        $stmtUpdatePedido->bindValue(':total', $nuevoTotal);
        $stmtUpdatePedido->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
        $stmtUpdatePedido->execute();

        return $nuevoTotal;
    }

    /**
     * Líneas de un pedido activo con nombre de producto
     */
    public function getLineasByPedido(int $idPedido): array {
        try {
            $this->assertPedidoActivo($idPedido);

            $sql = 'SELECT pp.id_pedido, pp.id_producto, pp.cantidad, pp.precio_unitario, pp.subtotal,
                           pr.nombre AS nombre_producto
                    FROM pedido_producto pp
                    INNER JOIN productos pr ON pr.id_producto = pp.id_producto
                    WHERE pp.id_pedido = :id_pedido
                    ORDER BY pr.nombre ASC';

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (\Exception $e) {
            throw new \Exception('Error al obtener líneas del pedido: ' . $e->getMessage());
        }
    }

    /**
     * Establece la cantidad absoluta de una línea (>= 1). Recalcula subtotal con precio actual del producto.
     */
    public function updateCantidad(array $data): array {
        try {
            $idPedido = (int)($data['id_pedido'] ?? 0);
            $idProducto = (int)($data['id_producto'] ?? 0);
            $cantidad = (int)($data['cantidad'] ?? 0);

            if ($idPedido <= 0 || $idProducto <= 0 || $cantidad < 1) {
                throw new \Exception('Pedido, producto y una cantidad mayor o igual a 1 son requeridos');
            }

            $this->db->beginTransaction();

            $this->assertPedidoActivo($idPedido);

            $stmtLinea = $this->db->prepare(
                'SELECT 1 FROM pedido_producto WHERE id_pedido = :id_pedido AND id_producto = :id_producto'
            );
            $stmtLinea->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmtLinea->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmtLinea->execute();
            if (!$stmtLinea->fetch()) {
                throw new \Exception('La línea no existe en este pedido');
            }

            $stmtProd = $this->db->prepare(
                'SELECT precio FROM productos WHERE id_producto = :id_producto AND estatus = 1'
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
                'UPDATE pedido_producto
                 SET cantidad = :cantidad, precio_unitario = :precio_unitario, subtotal = :subtotal
                 WHERE id_pedido = :id_pedido AND id_producto = :id_producto'
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
            throw new \Exception('Error al actualizar cantidad: ' . $e->getMessage());
        }
    }

    /**
     * Elimina una línea del pedido
     */
    public function removeLinea(int $idPedido, int $idProducto): array {
        try {
            if ($idPedido <= 0 || $idProducto <= 0) {
                throw new \Exception('Pedido y producto válidos son requeridos');
            }

            $this->db->beginTransaction();

            $this->assertPedidoActivo($idPedido);

            $stmtDel = $this->db->prepare(
                'DELETE FROM pedido_producto WHERE id_pedido = :id_pedido AND id_producto = :id_producto'
            );
            $stmtDel->bindValue(':id_pedido', $idPedido, \PDO::PARAM_INT);
            $stmtDel->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmtDel->execute();

            if ($stmtDel->rowCount() === 0) {
                $this->db->rollBack();
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
            throw new \Exception('Error al eliminar línea: ' . $e->getMessage());
        }
    }

    /**
     * Agregar un producto a un pedido
     *
     * Datos esperados:
     * - id_pedido (int, requerido)
     * - id_producto (int, requerido)
     * - cantidad (int, requerido, > 0)
     */
    public function addProducto(array $data): array {
        try {
            $idPedido = (int)($data['id_pedido'] ?? 0);
            $idProducto = (int)($data['id_producto'] ?? 0);
            $cantidad = (int)($data['cantidad'] ?? 0);

            if ($idPedido <= 0 || $idProducto <= 0 || $cantidad <= 0) {
                throw new \Exception("Pedido, producto y cantidad válidos son requeridos");
            }

            $this->db->beginTransaction();

            $this->assertPedidoActivo($idPedido);

            // Obtener precio del producto
            $stmtProd = $this->db->prepare("SELECT precio FROM productos WHERE id_producto = :id_producto AND estatus = 1");
            $stmtProd->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmtProd->execute();
            $producto = $stmtProd->fetch();
            if (!$producto) {
                throw new \Exception("Producto no encontrado o inactivo");
            }

            $precioUnitario = (float)$producto['precio'];
            $subtotal = $precioUnitario * $cantidad;

            // Insertar o actualizar línea en pedido_producto
            $stmtExiste = $this->db->prepare(
                "SELECT cantidad, precio_unitario, subtotal 
                 FROM pedido_producto 
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
                     SET cantidad = :cantidad, precio_unitario = :precio_unitario, subtotal = :subtotal
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
                    "INSERT INTO pedido_producto (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                     VALUES (:id_pedido, :id_producto, :cantidad, :precio_unitario, :subtotal)"
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
            throw new \Exception("Error al agregar producto al pedido: " . $e->getMessage());
        }
    }
}

