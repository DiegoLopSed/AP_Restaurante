<?php
/**
 * Modelo Producto
 *
 * Encargado de gestionar las operaciones relacionadas con la tabla `productos`
 * dentro del sistema.
 *
 * Funcionalidades principales:
 * - Obtener listado de productos con categoría
 * - Consultar producto por ID con insumos e ingredientes
 * - Crear productos con estructura de insumos y listas relacionadas
 *
 * Características:
 * - Uso de PDO con prepared statements
 * - Relación con categorías, insumos e ingredientes
 * - Manejo de transacciones para integridad de datos
 * - Creación automática de listas de insumos
 * - Validación básica de datos de entrada
 *
 * @package AP_Restaurante
 * @subpackage Models/Producto.php
 * @author Diego Lopez Sedeño 
 * @version 1.0.0
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class Producto {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Obtiene todos los productos con su categoría
     *
     * @return array
     */
    public function getAll(): array {
        try {
            $sql = "SELECT p.*, c.nombre AS categoria_nombre
                    FROM productos p
                    INNER JOIN categoria c ON p.id_categoria = c.id_categoria
                    ORDER BY p.nombre ASC";

            $stmt = $this->db->query($sql);
            return $stmt->fetchAll();

        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener productos: " . $e->getMessage());
        }
    }

    /**
     * Obtiene un producto por su ID con relaciones
     *
     * Incluye:
     * - Categoría
     * - Insumos asociados
     * - Ingredientes del producto
     *
     * @param int $id
     * @return array|null
     */
    public function getById(int $id): ?array {
        try {
            $sql = "SELECT p.*, c.nombre AS categoria_nombre
                    FROM productos p
                    INNER JOIN categoria c ON p.id_categoria = c.id_categoria
                    WHERE p.id_producto = :id";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();

            $row = $stmt->fetch();

            if (!$row) {
                return null;
            }

            // Insumos de la lista del producto
            if (!empty($row['id_lista'])) {
                $sqlInsumos = "SELECT li.id_insumo, li.cantidad, li.unidad_medida, i.nombre AS insumo_nombre
                               FROM lista_insumo li
                               INNER JOIN insumo i ON li.id_insumo = i.id_insumo
                               WHERE li.id_lista = :id_lista";

                $stmtInsumos = $this->db->prepare($sqlInsumos);
                $stmtInsumos->bindValue(':id_lista', $row['id_lista'], \PDO::PARAM_INT);
                $stmtInsumos->execute();

                $row['insumos'] = $stmtInsumos->fetchAll();
            } else {
                $row['insumos'] = [];
            }

            // Ingredientes del producto
            $sqlIngredientes = "SELECT pi.id_ingrediente,
                                       pi.cantidad,
                                       pi.unidad_medida,
                                       ing.nombre AS ingrediente_nombre,
                                       ins.nombre AS insumo_nombre
                                FROM producto_ingrediente pi
                                INNER JOIN ingrediente ing ON pi.id_ingrediente = ing.id_ingrediente
                                INNER JOIN insumo ins ON ing.id_insumo = ins.id_insumo
                                WHERE pi.id_producto = :id_producto";

            $stmtIng = $this->db->prepare($sqlIngredientes);
            $stmtIng->bindValue(':id_producto', $id, \PDO::PARAM_INT);
            $stmtIng->execute();

            $row['ingredientes'] = $stmtIng->fetchAll();

            return $row;

        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener producto: " . $e->getMessage());
        }
    }

    /**
     * Crea un producto con insumos e ingredientes asociados
     *
     * @param array $data
     * @return array
     *
     * Estructura esperada:
     * - id_categoria (int)
     * - nombre (string)
     * - descripcion (string|null)
     * - precio (float)
     * - estatus (int)
     * - insumos (array)
     */
    public function createWithInsumos(array $data): array {
        try {
            $nombre = trim((string)($data['nombre'] ?? ''));
            $idCategoria = (int)($data['id_categoria'] ?? 0);
            $precio = (float)($data['precio'] ?? 0);
            $descripcion = isset($data['descripcion']) ? trim((string)$data['descripcion']) : null;
            $estatus = (int)($data['estatus'] ?? 1);
            $insumos = $data['insumos'] ?? [];

            if ($idCategoria <= 0) {
                throw new \Exception("Categoría requerida");
            }

            if ($nombre === '' || strlen($nombre) < 2) {
                throw new \Exception("Nombre inválido");
            }

            if ($precio <= 0) {
                throw new \Exception("Precio inválido");
            }

            $this->db->beginTransaction();

            // Crear lista base
            $this->db->prepare("INSERT INTO lista () VALUES ()")->execute();
            $idLista = (int)$this->db->lastInsertId();

            // Insertar producto
            $stmt = $this->db->prepare(
                "INSERT INTO productos
                 (id_categoria, id_lista, nombre, descripcion, precio, estatus)
                 VALUES
                 (:id_categoria, :id_lista, :nombre, :descripcion, :precio, :estatus)"
            );

            $stmt->bindValue(':id_categoria', $idCategoria, \PDO::PARAM_INT);
            $stmt->bindValue(':id_lista', $idLista, \PDO::PARAM_INT);
            $stmt->bindValue(':nombre', $nombre);
            $stmt->bindValue(':descripcion', $descripcion);
            $stmt->bindValue(':precio', $precio);
            $stmt->bindValue(':estatus', $estatus, \PDO::PARAM_INT);
            $stmt->execute();

            $idProducto = (int)$this->db->lastInsertId();

            // Insertar insumos e ingredientes
            if (!empty($insumos)) {

                $stmtLI = $this->db->prepare(
                    "INSERT INTO lista_insumo (id_lista, id_insumo, cantidad, unidad_medida)
                     VALUES (:id_lista, :id_insumo, :cantidad, :unidad)"
                );

                foreach ($insumos as $insumo) {
                    $idInsumo = (int)($insumo['id_insumo'] ?? 0);
                    $cantidad = (float)($insumo['cantidad'] ?? 1);
                    $unidad = $insumo['unidad_medida'] ?? null;

                    if ($idInsumo <= 0) continue;

                    $stmtLI->bindValue(':id_lista', $idLista, \PDO::PARAM_INT);
                    $stmtLI->bindValue(':id_insumo', $idInsumo, \PDO::PARAM_INT);
                    $stmtLI->bindValue(':cantidad', $cantidad);
                    $stmtLI->bindValue(':unidad', $unidad);
                    $stmtLI->execute();
                }
            }

            // Relación lista-producto
            $this->db->prepare(
                "INSERT INTO lista_producto (id_lista, id_producto)
                 VALUES (:id_lista, :id_producto)"
            )->execute([
                ':id_lista' => $idLista,
                ':id_producto' => $idProducto
            ]);

            $this->db->commit();

            return [
                'success' => true,
                'message' => 'Producto creado correctamente',
                'data' => [
                    'id_producto' => $idProducto,
                    'id_lista' => $idLista
                ]
            ];

        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw new \Exception("Error al crear producto: " . $e->getMessage());
        }
    }
}