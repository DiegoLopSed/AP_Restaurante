<?php
/**
 * Modelo Insumo
 * 
 * Gestiona todas las operaciones relacionadas con la tabla `insumo`
 * dentro de la base de datos del sistema.
 * 
 * Funcionalidades principales:
 * - Obtener insumos (todos, por ID o por categoría)
 * - Crear, actualizar y eliminar insumos
 * - Búsqueda por nombre
 * - Consulta de categorías asociadas
 * 
 * Características:
 * - Uso de PDO con prepared statements
 * - Validación básica de datos
 * - Manejo de excepciones
 * - Prevención de valores inválidos (ej. stock negativo)
 * 
 * @package AP_Restaurante
 * @subpackage Models/Insumo.php
 * @author Ana Karen Romero Flores
 * @version 1.0.0
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class Insumo {
    private $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    public function getAll() {
        try {
            $sql = "SELECT i.*, c.nombre as categoria_nombre, c.descripcion as categoria_descripcion 
                    FROM insumo i 
                    INNER JOIN categoria c ON i.id_categoria = c.id_categoria 
                    ORDER BY i.nombre ASC";
            return $this->db->query($sql)->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener insumos: " . $e->getMessage());
        }
    }
    
    public function getById($id) {
        try {
            $sql = "SELECT i.*, c.nombre as categoria_nombre, c.descripcion as categoria_descripcion 
                    FROM insumo i 
                    INNER JOIN categoria c ON i.id_categoria = c.id_categoria 
                    WHERE i.id_insumo = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch() ?: null;
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener insumo: " . $e->getMessage());
        }
    }
    
    public function create($data) {
        try {
            if (empty($data['nombre']) || empty($data['id_categoria'])) {
                throw new \Exception("Nombre y categoría son requeridos");
            }
            
            $sql = "INSERT INTO insumo (id_categoria, nombre, stock, fecha_ultimo_pedido) 
                    VALUES (:id_categoria, :nombre, :stock, :fecha)";
            
            $stmt = $this->db->prepare($sql);

            $stock = isset($data['stock']) ? max(0, (int)$data['stock']) : 0;
            $fecha = !empty($data['fecha_ultimo_pedido']) ? $data['fecha_ultimo_pedido'] : null;

            $stmt->execute([
                ':id_categoria' => $data['id_categoria'],
                ':nombre' => $data['nombre'],
                ':stock' => $stock,
                ':fecha' => $fecha
            ]);
            
            return [
                'success' => true,
                'message' => 'Insumo creado exitosamente',
                'id' => $this->db->lastInsertId()
            ];
        } catch (\PDOException $e) {
            throw new \Exception("Error al crear insumo: " . $e->getMessage());
        }
    }
    
    public function update($id, $data) {
        try {
            if (!$this->getById($id)) {
                throw new \Exception("Insumo no encontrado");
            }
            
            $fields = [];
            $params = [':id' => $id];
            
            if (isset($data['nombre'])) {
                $fields[] = "nombre = :nombre";
                $params[':nombre'] = $data['nombre'];
            }
            
            if (isset($data['id_categoria'])) {
                $fields[] = "id_categoria = :id_categoria";
                $params[':id_categoria'] = $data['id_categoria'];
            }
            
            if (isset($data['stock'])) {
                $fields[] = "stock = :stock";
                $params[':stock'] = max(0, (int)$data['stock']);
            }
            
            if (isset($data['fecha_ultimo_pedido'])) {
                $fields[] = "fecha_ultimo_pedido = :fecha";
                $params[':fecha'] = $data['fecha_ultimo_pedido'] ?: null;
            }
            
            if (empty($fields)) {
                throw new \Exception("No hay datos para actualizar");
            }
            
            $sql = "UPDATE insumo SET " . implode(', ', $fields) . " WHERE id_insumo = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return [
                'success' => true,
                'message' => 'Insumo actualizado exitosamente'
            ];
        } catch (\PDOException $e) {
            throw new \Exception("Error al actualizar insumo: " . $e->getMessage());
        }
    }
    
    public function delete($id) {
        try {
            if (!$this->getById($id)) {
                throw new \Exception("Insumo no encontrado");
            }
            
            $stmt = $this->db->prepare("DELETE FROM insumo WHERE id_insumo = :id");
            $stmt->execute([':id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Insumo eliminado exitosamente'
            ];
        } catch (\PDOException $e) {
            if ($e->getCode() == '23000') {
                throw new \Exception("No se puede eliminar porque está en uso");
            }
            throw new \Exception("Error al eliminar insumo: " . $e->getMessage());
        }
    }
    
    public function getCategorias() {
        try {
            return $this->db->query(
                "SELECT id_categoria, nombre, descripcion FROM categoria ORDER BY nombre ASC"
            )->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener categorías: " . $e->getMessage());
        }
    }
    
    public function getByCategoria($id_categoria) {
        try {
            $stmt = $this->db->prepare(
                "SELECT i.*, c.nombre as categoria_nombre 
                 FROM insumo i 
                 INNER JOIN categoria c ON i.id_categoria = c.id_categoria 
                 WHERE i.id_categoria = :id 
                 ORDER BY i.nombre ASC"
            );
            $stmt->execute([':id' => $id_categoria]);
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al filtrar insumos: " . $e->getMessage());
        }
    }
    
    public function search($term) {
        try {
            $stmt = $this->db->prepare(
                "SELECT i.*, c.nombre as categoria_nombre 
                 FROM insumo i 
                 INNER JOIN categoria c ON i.id_categoria = c.id_categoria 
                 WHERE i.nombre LIKE :term 
                 ORDER BY i.nombre ASC"
            );
            $stmt->execute([':term' => "%$term%"]);
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al buscar insumos: " . $e->getMessage());
        }
    }
}