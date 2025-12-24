<?php
/**
 * Modelo Insumo
 * Maneja todas las operaciones de base de datos para la tabla insumo
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class Insumo {
    private $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * Obtener todos los insumos con información de categoría
     */
    public function getAll() {
        try {
            $sql = "SELECT i.*, c.nombre as categoria_nombre, c.descripcion as categoria_descripcion 
                    FROM insumo i 
                    INNER JOIN categoria c ON i.id_categoria = c.id_categoria 
                    ORDER BY i.nombre ASC";
            $stmt = $this->db->query($sql);
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener insumos: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener un insumo por ID
     */
    public function getById($id) {
        try {
            $sql = "SELECT i.*, c.nombre as categoria_nombre, c.descripcion as categoria_descripcion 
                    FROM insumo i 
                    INNER JOIN categoria c ON i.id_categoria = c.id_categoria 
                    WHERE i.id_insumo = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
            
            $insumo = $stmt->fetch();
            if (!$insumo) {
                return null;
            }
            
            return $insumo;
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener insumo: " . $e->getMessage());
        }
    }
    
    /**
     * Crear un nuevo insumo
     */
    public function create($data) {
        try {
            // Validar datos requeridos
            if (empty($data['nombre']) || empty($data['id_categoria'])) {
                throw new \Exception("El nombre y la categoría son requeridos");
            }
            
            $sql = "INSERT INTO insumo (id_categoria, nombre, stock, fecha_ultimo_pedido) 
                    VALUES (:id_categoria, :nombre, :stock, :fecha_ultimo_pedido)";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id_categoria', $data['id_categoria'], \PDO::PARAM_INT);
            $stmt->bindParam(':nombre', $data['nombre'], \PDO::PARAM_STR);
            
            // Stock: cantidad entera (por defecto 0)
            $stock = isset($data['stock']) ? (int)$data['stock'] : 0;
            if ($stock < 0) {
                $stock = 0; // No permitir valores negativos
            }
            $stmt->bindValue(':stock', $stock, \PDO::PARAM_INT);
            
            // Fecha opcional
            $fecha = !empty($data['fecha_ultimo_pedido']) ? $data['fecha_ultimo_pedido'] : null;
            $stmt->bindParam(':fecha_ultimo_pedido', $fecha, \PDO::PARAM_STR);
            
            $stmt->execute();
            
            return [
                'id' => $this->db->lastInsertId(),
                'success' => true,
                'message' => 'Insumo creado exitosamente'
            ];
        } catch (\PDOException $e) {
            throw new \Exception("Error al crear insumo: " . $e->getMessage());
        }
    }
    
    /**
     * Actualizar un insumo existente
     */
    public function update($id, $data) {
        try {
            // Verificar que el insumo existe
            $insumo = $this->getById($id);
            if (!$insumo) {
                throw new \Exception("Insumo no encontrado");
            }
            
            // Construir query dinámicamente solo con los campos proporcionados
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
                $stock = (int)$data['stock'];
                if ($stock < 0) {
                    $stock = 0; // No permitir valores negativos
                }
                $params[':stock'] = $stock;
            }
            
            if (isset($data['fecha_ultimo_pedido'])) {
                $fields[] = "fecha_ultimo_pedido = :fecha_ultimo_pedido";
                $params[':fecha_ultimo_pedido'] = !empty($data['fecha_ultimo_pedido']) ? $data['fecha_ultimo_pedido'] : null;
            }
            
            if (empty($fields)) {
                throw new \Exception("No hay campos para actualizar");
            }
            
            $sql = "UPDATE insumo SET " . implode(', ', $fields) . " WHERE id_insumo = :id";
            $stmt = $this->db->prepare($sql);
            
            foreach ($params as $key => $value) {
                $paramType = is_int($value) ? \PDO::PARAM_INT : \PDO::PARAM_STR;
                $stmt->bindValue($key, $value, $paramType);
            }
            
            $stmt->execute();
            
            return [
                'success' => true,
                'message' => 'Insumo actualizado exitosamente'
            ];
        } catch (\PDOException $e) {
            throw new \Exception("Error al actualizar insumo: " . $e->getMessage());
        }
    }
    
    /**
     * Eliminar un insumo
     */
    public function delete($id) {
        try {
            // Verificar que el insumo existe
            $insumo = $this->getById($id);
            if (!$insumo) {
                throw new \Exception("Insumo no encontrado");
            }
            
            $sql = "DELETE FROM insumo WHERE id_insumo = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();
            
            return [
                'success' => true,
                'message' => 'Insumo eliminado exitosamente'
            ];
        } catch (\PDOException $e) {
            // Si hay una restricción de clave foránea, informar al usuario
            if ($e->getCode() == '23000') {
                throw new \Exception("No se puede eliminar el insumo porque está siendo utilizado en otras tablas");
            }
            throw new \Exception("Error al eliminar insumo: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener todas las categorías (para dropdowns)
     */
    public function getCategorias() {
        try {
            $sql = "SELECT id_categoria, nombre, descripcion FROM categoria ORDER BY nombre ASC";
            $stmt = $this->db->query($sql);
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener categorías: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener insumos por categoría
     */
    public function getByCategoria($id_categoria) {
        try {
            $sql = "SELECT i.*, c.nombre as categoria_nombre 
                    FROM insumo i 
                    INNER JOIN categoria c ON i.id_categoria = c.id_categoria 
                    WHERE i.id_categoria = :id_categoria 
                    ORDER BY i.nombre ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id_categoria', $id_categoria, \PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al obtener insumos por categoría: " . $e->getMessage());
        }
    }
    
    /**
     * Buscar insumos por nombre
     */
    public function search($searchTerm) {
        try {
            $sql = "SELECT i.*, c.nombre as categoria_nombre 
                    FROM insumo i 
                    INNER JOIN categoria c ON i.id_categoria = c.id_categoria 
                    WHERE i.nombre LIKE :search 
                    ORDER BY i.nombre ASC";
            $stmt = $this->db->prepare($sql);
            $searchPattern = '%' . $searchTerm . '%';
            $stmt->bindParam(':search', $searchPattern, \PDO::PARAM_STR);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error al buscar insumos: " . $e->getMessage());
        }
    }
}

