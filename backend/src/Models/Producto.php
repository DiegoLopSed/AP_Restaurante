<?php
/**
 * Modelo Producto
 * Maneja operaciones de base de datos para la tabla productos
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class Producto {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Obtener todos los productos con nombre de categoría
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
     * Obtener un producto por ID
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

            // Obtener insumos asociados vía lista / lista_insumo
            if (!empty($row['id_lista'])) {
                $sqlInsumos = "SELECT li.id_insumo, li.cantidad, li.unidad_medida, i.nombre AS insumo_nombre
                               FROM lista_insumo li
                               INNER JOIN insumo i ON li.id_insumo = i.id_insumo
                               WHERE li.id_lista = :id_lista
                               ORDER BY i.nombre ASC";
                $stmtInsumos = $this->db->prepare($sqlInsumos);
                $stmtInsumos->bindValue(':id_lista', $row['id_lista'], \PDO::PARAM_INT);
                $stmtInsumos->execute();
                $row['insumos'] = $stmtInsumos->fetchAll();
            } else {
                $row['insumos'] = [];
            }

            // Obtener lista de ingredientes del producto
            $sqlIngredientes = "SELECT pi.id_ingrediente,
                                       pi.cantidad,
                                       pi.unidad_medida,
                                       ing.nombre AS ingrediente_nombre,
                                       ins.nombre AS insumo_nombre
                                FROM producto_ingrediente pi
                                INNER JOIN ingrediente ing ON pi.id_ingrediente = ing.id_ingrediente
                                INNER JOIN insumo ins ON ing.id_insumo = ins.id_insumo
                                WHERE pi.id_producto = :id_producto
                                ORDER BY ing.nombre ASC";
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
     * Crear un nuevo producto con lista de insumos
     *
     * Estructura esperada de $data:
     * - id_categoria (int, requerido)
     * - nombre (string, requerido)
     * - descripcion (string|null)
     * - precio (float, requerido)
     * - estatus (int, opcional, por defecto 1)
     * - insumos: [
     *     { id_insumo: int, cantidad: float, unidad_medida: string|null },
     *     ...
     *   ]
     */
    public function createWithInsumos(array $data): array {
        try {
            $nombre = trim((string)($data['nombre'] ?? ''));
            $idCategoria = (int)($data['id_categoria'] ?? 0);
            $precio = isset($data['precio']) ? (float)$data['precio'] : 0.0;
            $descripcion = isset($data['descripcion']) ? trim((string)$data['descripcion']) : null;
            $estatus = isset($data['estatus']) ? (int)$data['estatus'] : 1;
            $insumos = isset($data['insumos']) && is_array($data['insumos']) ? $data['insumos'] : [];

            if ($idCategoria <= 0) {
                throw new \Exception("La categoría es requerida");
            }
            if ($nombre === '' || strlen($nombre) < 2) {
                throw new \Exception("El nombre es requerido y debe tener al menos 2 caracteres");
            }
            if ($precio <= 0) {
                throw new \Exception("El precio debe ser mayor a 0");
            }

            $this->db->beginTransaction();

            // 1) Crear lista
            $stmt = $this->db->prepare("INSERT INTO lista () VALUES ()");
            $stmt->execute();
            $idLista = (int)$this->db->lastInsertId();

            // 2) Crear producto
            $sqlProducto = "INSERT INTO productos (id_categoria, id_lista, nombre, descripcion, precio, estatus)
                            VALUES (:id_categoria, :id_lista, :nombre, :descripcion, :precio, :estatus)";
            $stmtProd = $this->db->prepare($sqlProducto);
            $stmtProd->bindValue(':id_categoria', $idCategoria, \PDO::PARAM_INT);
            $stmtProd->bindValue(':id_lista', $idLista, \PDO::PARAM_INT);

            // Limitar tamaño de nombre/descripcion por seguridad
            if (strlen($nombre) > 255) {
                $nombre = substr($nombre, 0, 255);
            }
            $stmtProd->bindValue(':nombre', $nombre, \PDO::PARAM_STR);

            if ($descripcion !== null && strlen($descripcion) > 1000) {
                $descripcion = substr($descripcion, 0, 1000);
            }
            $stmtProd->bindValue(':descripcion', $descripcion, $descripcion === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
            $stmtProd->bindValue(':precio', $precio);
            $stmtProd->bindValue(':estatus', $estatus, \PDO::PARAM_INT);
            $stmtProd->execute();

            $idProducto = (int)$this->db->lastInsertId();

            // 3) Insertar insumos en lista_insumo y registrar como lista de ingredientes
            if (!empty($insumos)) {
                $sqlListaInsumo = "INSERT INTO lista_insumo (id_lista, id_insumo, cantidad, unidad_medida)
                                   VALUES (:id_lista, :id_insumo, :cantidad, :unidad_medida)";
                $stmtListaInsumo = $this->db->prepare($sqlListaInsumo);

                // Para ingredientes y producto_ingrediente
                $sqlSelectIngrediente = "SELECT id_ingrediente FROM ingrediente WHERE id_insumo = :id_insumo";
                $stmtSelectIngrediente = $this->db->prepare($sqlSelectIngrediente);

                $sqlInsertIngrediente = "INSERT INTO ingrediente (id_insumo, nombre) VALUES (:id_insumo, :nombre)";
                $stmtInsertIngrediente = $this->db->prepare($sqlInsertIngrediente);

                $sqlProductoIngrediente = "INSERT INTO producto_ingrediente (id_producto, id_ingrediente, cantidad, unidad_medida)
                                           VALUES (:id_producto, :id_ingrediente, :cantidad, :unidad_medida)";
                $stmtProductoIngrediente = $this->db->prepare($sqlProductoIngrediente);

                foreach ($insumos as $insumo) {
                    $idInsumo = (int)($insumo['id_insumo'] ?? 0);
                    if ($idInsumo <= 0) {
                        continue;
                    }
                    $cantidad = isset($insumo['cantidad']) ? (float)$insumo['cantidad'] : 1.0;
                    if ($cantidad <= 0) {
                        $cantidad = 1.0;
                    }
                    $unidad = isset($insumo['unidad_medida']) ? trim((string)$insumo['unidad_medida']) : null;
                    if ($unidad !== null && strlen($unidad) > 50) {
                        $unidad = substr($unidad, 0, 50);
                    }

                    // 3a) Guardar en lista_insumo
                    $stmtListaInsumo->bindValue(':id_lista', $idLista, \PDO::PARAM_INT);
                    $stmtListaInsumo->bindValue(':id_insumo', $idInsumo, \PDO::PARAM_INT);
                    $stmtListaInsumo->bindValue(':cantidad', $cantidad);
                    $stmtListaInsumo->bindValue(':unidad_medida', $unidad, $unidad === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
                    $stmtListaInsumo->execute();

                    // 3b) Asegurar registro en ingrediente (uno por insumo)
                    $stmtSelectIngrediente->bindValue(':id_insumo', $idInsumo, \PDO::PARAM_INT);
                    $stmtSelectIngrediente->execute();
                    $rowIngrediente = $stmtSelectIngrediente->fetch();

                    if ($rowIngrediente && isset($rowIngrediente['id_ingrediente'])) {
                        $idIngrediente = (int)$rowIngrediente['id_ingrediente'];
                    } else {
                        // Obtener nombre del insumo para usarlo como nombre del ingrediente
                        $stmtNombreInsumo = $this->db->prepare("SELECT nombre FROM insumo WHERE id_insumo = :id_insumo");
                        $stmtNombreInsumo->bindValue(':id_insumo', $idInsumo, \PDO::PARAM_INT);
                        $stmtNombreInsumo->execute();
                        $rowNombre = $stmtNombreInsumo->fetch();
                        $nombreIngrediente = $rowNombre['nombre'] ?? ('Insumo #' . $idInsumo);

                        $stmtInsertIngrediente->bindValue(':id_insumo', $idInsumo, \PDO::PARAM_INT);
                        $stmtInsertIngrediente->bindValue(':nombre', $nombreIngrediente, \PDO::PARAM_STR);
                        $stmtInsertIngrediente->execute();
                        $idIngrediente = (int)$this->db->lastInsertId();
                    }

                    // 3c) Registrar relación producto_ingrediente (lista de ingredientes del producto)
                    $stmtProductoIngrediente->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
                    $stmtProductoIngrediente->bindValue(':id_ingrediente', $idIngrediente, \PDO::PARAM_INT);
                    $stmtProductoIngrediente->bindValue(':cantidad', $cantidad);
                    $stmtProductoIngrediente->bindValue(':unidad_medida', $unidad, $unidad === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
                    $stmtProductoIngrediente->execute();
                }
            }

            // 4) Relación adicional en lista_producto (opcional, pero útil)
            $sqlListaProducto = "INSERT INTO lista_producto (id_lista, id_producto)
                                 VALUES (:id_lista, :id_producto)";
            $stmtLP = $this->db->prepare($sqlListaProducto);
            $stmtLP->bindValue(':id_lista', $idLista, \PDO::PARAM_INT);
            $stmtLP->bindValue(':id_producto', $idProducto, \PDO::PARAM_INT);
            $stmtLP->execute();

            $this->db->commit();

            return [
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'data' => [
                    'id_producto' => $idProducto,
                    'id_lista' => $idLista,
                ],
            ];
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw new \Exception("Error al crear producto: " . $e->getMessage());
        }
    }
}

