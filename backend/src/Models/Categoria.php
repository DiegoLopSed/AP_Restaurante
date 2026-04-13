<?php
/**
 * Modelo Categoria
 * 
 * Encargado de gestionar las operaciones CRUD sobre la tabla `categoria`
 * en la base de datos del sistema.
 * 
 * Funcionalidades:
 * - Obtener todas las categorías
 * - Obtener una categoría por ID
 * - Crear nuevas categorías
 * - Actualizar categorías existentes
 * - Eliminar categorías (con validación de relaciones)
 * 
 * Características:
 * - Validación de datos antes de persistir
 * - Prevención de duplicados (case-insensitive)
 * - Manejo de errores mediante excepciones
 * - Uso de consultas preparadas (PDO)
 * 
 * @package AP_Restaurante
 * @subpackage CategoriaModel
 * @author Ana Karen Romero Flores
 * @version 1.0.0
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class Categoria {

    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Obtener todas las categorías
     */
    public function getAll(): array {
        try {
            $stmt = $this->db->query("SELECT * FROM categoria ORDER BY nombre ASC");
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener categorías: " . $e->getMessage());
        }
    }

    /**
     * Obtener categoría por ID
     */
    public function getById(int $id): ?array {
        try {
            $stmt = $this->db->prepare("SELECT * FROM categoria WHERE id_categoria = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            return $row ?: null;
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener categoría: " . $e->getMessage());
        }
    }

    /**
     * Crear nueva categoría
     */
    public function create(array $data): array {
        $nombre = trim((string)($data['nombre'] ?? ''));
        $descripcion = isset($data['descripcion']) ? trim((string)$data['descripcion']) : null;
        $tipo = isset($data['tipo_categoria']) ? strtolower((string)$data['tipo_categoria']) : 'producto';

        // Validaciones
        if ($nombre === '' || strlen($nombre) < 2) {
            throw new \Exception("El nombre es requerido y debe tener al menos 2 caracteres");
        }
        if (strlen($nombre) > 255) {
            throw new \Exception("El nombre no puede exceder 255 caracteres");
        }
        if ($descripcion !== null && strlen($descripcion) > 1000) {
            throw new \Exception("La descripción no puede exceder 1000 caracteres");
        }
        if (!in_array($tipo, ['insumo', 'producto'], true)) {
            throw new \Exception("El tipo de categoría debe ser 'insumo' o 'producto'");
        }

        // Validar unicidad
        $stmt = $this->db->prepare("SELECT id_categoria FROM categoria WHERE LOWER(nombre) = LOWER(?)");
        $stmt->execute([$nombre]);
        if ($stmt->fetch()) {
            throw new \Exception("Ya existe una categoría con ese nombre");
        }

        // Insertar
        $stmt = $this->db->prepare("INSERT INTO categoria (nombre, descripcion, tipo_categoria) VALUES (?, ?, ?)");
        $stmt->execute([$nombre, $descripcion, $tipo]);

        return [
            'success' => true,
            'message' => 'Categoría creada exitosamente',
            'data' => ['id_categoria' => (int)$this->db->lastInsertId()],
        ];
    }

    /**
     * Actualizar categoría
     */
    public function update(int $id, array $data): array {
        $nombre = trim((string)($data['nombre'] ?? ''));
        $descripcion = isset($data['descripcion']) ? trim((string)$data['descripcion']) : null;
        $tipo = isset($data['tipo_categoria']) ? strtolower((string)$data['tipo_categoria']) : 'producto';

        // Validaciones
        if ($id <= 0) {
            throw new \Exception("ID inválido");
        }
        if ($nombre === '' || strlen($nombre) < 2) {
            throw new \Exception("El nombre es requerido y debe tener al menos 2 caracteres");
        }
        if (strlen($nombre) > 255) {
            throw new \Exception("El nombre no puede exceder 255 caracteres");
        }
        if ($descripcion !== null && strlen($descripcion) > 1000) {
            throw new \Exception("La descripción no puede exceder 1000 caracteres");
        }
        if (!in_array($tipo, ['insumo', 'producto'], true)) {
            throw new \Exception("El tipo de categoría debe ser 'insumo' o 'producto'");
        }

        // Verificar existencia
        $stmt = $this->db->prepare("SELECT id_categoria FROM categoria WHERE id_categoria = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Categoría no encontrada");
        }

        // Validar unicidad excluyendo el mismo registro
        $stmt = $this->db->prepare("SELECT id_categoria FROM categoria WHERE LOWER(nombre) = LOWER(?) AND id_categoria != ?");
        $stmt->execute([$nombre, $id]);
        if ($stmt->fetch()) {
            throw new \Exception("Ya existe otra categoría con ese nombre");
        }

        // Actualizar
        $stmt = $this->db->prepare("UPDATE categoria SET nombre = ?, descripcion = ?, tipo_categoria = ? WHERE id_categoria = ?");
        $stmt->execute([$nombre, $descripcion, $tipo, $id]);

        return [
            'success' => true,
            'message' => 'Categoría actualizada exitosamente',
        ];
    }

    /**
     * Eliminar categoría
     */
    public function delete(int $id): array {
        if ($id <= 0) {
            throw new \Exception("ID inválido");
        }

        // Verificar existencia
        $stmt = $this->db->prepare("SELECT id_categoria FROM categoria WHERE id_categoria = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Categoría no encontrada");
        }

        // Verificar relaciones
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM insumo WHERE id_categoria = ?");
        $stmt->execute([$id]);
        $insumos = $stmt->fetch();

        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM productos WHERE id_categoria = ?");
        $stmt->execute([$id]);
        $productos = $stmt->fetch();

        $countInsumos = (int)($insumos['count'] ?? 0);
        $countProductos = (int)($productos['count'] ?? 0);

        if ($countInsumos > 0 || $countProductos > 0) {
            throw new \Exception(
                "No se puede eliminar la categoría porque tiene " .
                ($countInsumos > 0 ? "{$countInsumos} insumo(s)" : "") .
                ($countInsumos > 0 && $countProductos > 0 ? " y " : "") .
                ($countProductos > 0 ? "{$countProductos} producto(s)" : "") .
                " asociado(s)"
            );
        }

        // Eliminar
        $stmt = $this->db->prepare("DELETE FROM categoria WHERE id_categoria = ?");
        $stmt->execute([$id]);

        return [
            'success' => true,
            'message' => 'Categoría eliminada exitosamente',
        ];
    }
}