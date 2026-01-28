<?php
/**
 * Modelo Categoria
 * Maneja operaciones de base de datos para la tabla categoria
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class Categoria {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getAll(): array {
        try {
            $stmt = $this->db->query("SELECT * FROM categoria ORDER BY nombre ASC");
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener categorías: " . $e->getMessage());
        }
    }

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

    public function create(array $data): array {
        $nombre = trim((string)($data['nombre'] ?? ''));
        $descripcion = isset($data['descripcion']) ? trim((string)$data['descripcion']) : null;

        if ($nombre === '' || strlen($nombre) < 2) {
            throw new \Exception("El nombre es requerido y debe tener al menos 2 caracteres");
        }
        if (strlen($nombre) > 255) {
            throw new \Exception("El nombre no puede exceder 255 caracteres");
        }
        if ($descripcion !== null && strlen($descripcion) > 1000) {
            throw new \Exception("La descripción no puede exceder 1000 caracteres");
        }

        // Unicidad case-insensitive
        $stmt = $this->db->prepare("SELECT id_categoria FROM categoria WHERE LOWER(nombre) = LOWER(?)");
        $stmt->execute([$nombre]);
        if ($stmt->fetch()) {
            throw new \Exception("Ya existe una categoría con ese nombre");
        }

        $stmt = $this->db->prepare("INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)");
        $stmt->execute([$nombre, $descripcion]);

        return [
            'success' => true,
            'message' => 'Categoría creada exitosamente',
            'data' => ['id_categoria' => (int)$this->db->lastInsertId()],
        ];
    }

    public function update(int $id, array $data): array {
        $nombre = trim((string)($data['nombre'] ?? ''));
        $descripcion = isset($data['descripcion']) ? trim((string)$data['descripcion']) : null;

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

        // Existe
        $stmt = $this->db->prepare("SELECT id_categoria FROM categoria WHERE id_categoria = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Categoría no encontrada");
        }

        // Unicidad case-insensitive excluyendo el mismo
        $stmt = $this->db->prepare("SELECT id_categoria FROM categoria WHERE LOWER(nombre) = LOWER(?) AND id_categoria != ?");
        $stmt->execute([$nombre, $id]);
        if ($stmt->fetch()) {
            throw new \Exception("Ya existe otra categoría con ese nombre");
        }

        $stmt = $this->db->prepare("UPDATE categoria SET nombre = ?, descripcion = ? WHERE id_categoria = ?");
        $stmt->execute([$nombre, $descripcion, $id]);

        return [
            'success' => true,
            'message' => 'Categoría actualizada exitosamente',
        ];
    }

    public function delete(int $id): array {
        if ($id <= 0) {
            throw new \Exception("ID inválido");
        }

        // Existe
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

        $stmt = $this->db->prepare("DELETE FROM categoria WHERE id_categoria = ?");
        $stmt->execute([$id]);

        return [
            'success' => true,
            'message' => 'Categoría eliminada exitosamente',
        ];
    }
}


