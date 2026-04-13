<?php
/**
 * Modelo Colaborador
 * 
 * Encargado de gestionar las operaciones CRUD sobre la tabla `colaboradores`
 * en la base de datos del sistema.
 * 
 * Funcionalidades principales:
 * - Obtener lista de colaboradores
 * - Consultar colaborador por ID
 * - Crear colaboradores (con o sin credenciales)
 * - Actualizar información básica
 * - Eliminar registros
 * 
 * Características:
 * - Validación de datos (correo, teléfono, RFC, CURP)
 * - Manejo de transacciones en creación
 * - Uso de prepared statements (PDO)
 * - Hash seguro de contraseñas
 * 
 * @package AP_Restaurante
 * @subpackage Models/Colaborador.php
 * @author Ana Karen Romero Flores
 * @version 1.0.0
 */

namespace App\Models;

require_once __DIR__ . '/../../config/database.php';

class Colaborador {
    private $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getAll(): array {
        $stmt = $this->db->query(
            "SELECT id_colaborador, nombre, apellido, correo, telefono, posicion, created_at, updated_at
             FROM colaboradores
             ORDER BY nombre ASC, apellido ASC"
        );
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT id_colaborador, nombre, apellido, correo, telefono, posicion, created_at, updated_at
             FROM colaboradores
             WHERE id_colaborador = ?"
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $input): array {
        $this->validateBase($input);

        $nombre = trim((string)$input['nombre']);
        $apellido = trim((string)$input['apellido']);
        $correo = strtolower(trim((string)($input['email'] ?? $input['correo'] ?? '')));
        $telefono = trim((string)$input['telefono']);
        $posicion = trim((string)($input['cargo'] ?? $input['posicion'] ?? ''));

        $this->db->beginTransaction();

        try {
            // Validar correo único
            $stmt = $this->db->prepare("SELECT id_colaborador FROM colaboradores WHERE correo = ?");
            $stmt->execute([$correo]);
            if ($stmt->fetch()) {
                throw new \Exception("El correo electrónico ya está registrado");
            }

            $rfc = null;
            $curp = null;
            $passwordHash = null;

            $tieneRfc = !empty($input['rfc']);
            $tieneCurp = !empty($input['curp']);
            $tieneContrasena = !empty($input['contrasena']);

            if ($tieneRfc || $tieneCurp || $tieneContrasena) {
                if (!($tieneRfc && $tieneCurp && $tieneContrasena)) {
                    throw new \Exception("Debe proporcionar RFC, CURP y contraseña completos");
                }

                $rfc = strtoupper(trim((string)$input['rfc']));
                $curp = strtoupper(trim((string)$input['curp']));
                $contrasena = (string)$input['contrasena'];

                if (strlen($contrasena) < 8) {
                    throw new \Exception("La contraseña debe tener al menos 8 caracteres");
                }

                $passwordHash = password_hash($contrasena, PASSWORD_DEFAULT);
            }

            $stmt = $this->db->prepare(
                "INSERT INTO colaboradores (nombre, apellido, rfc, curp, correo, telefono, pass, posicion)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$nombre, $apellido, $rfc, $curp, $correo, $telefono, $passwordHash, $posicion]);

            $this->db->commit();

            return [
                'success' => true,
                'message' => 'Colaborador creado exitosamente',
                'data' => ['id_colaborador' => (int)$this->db->lastInsertId()],
            ];

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function update(int $id, array $input): array {
        if ($id <= 0) {
            throw new \Exception("ID inválido");
        }

        $this->validateBase($input);

        $nombre = trim((string)$input['nombre']);
        $apellido = trim((string)$input['apellido']);
        $correo = strtolower(trim((string)($input['email'] ?? $input['correo'] ?? '')));
        $telefono = trim((string)$input['telefono']);
        $posicion = trim((string)($input['cargo'] ?? $input['posicion'] ?? ''));

        $stmt = $this->db->prepare("SELECT id_colaborador FROM colaboradores WHERE id_colaborador = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Colaborador no encontrado");
        }

        $stmt = $this->db->prepare("SELECT id_colaborador FROM colaboradores WHERE correo = ? AND id_colaborador != ?");
        $stmt->execute([$correo, $id]);
        if ($stmt->fetch()) {
            throw new \Exception("Correo ya en uso");
        }

        $stmt = $this->db->prepare(
            "UPDATE colaboradores
             SET nombre = ?, apellido = ?, telefono = ?, correo = ?, posicion = ?
             WHERE id_colaborador = ?"
        );
        $stmt->execute([$nombre, $apellido, $telefono, $correo, $posicion, $id]);

        return [
            'success' => true,
            'message' => 'Colaborador actualizado exitosamente',
        ];
    }

    public function delete(int $id): array {
        if ($id <= 0) {
            throw new \Exception("ID inválido");
        }

        $stmt = $this->db->prepare("SELECT id_colaborador FROM colaboradores WHERE id_colaborador = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Colaborador no encontrado");
        }

        $stmt = $this->db->prepare("DELETE FROM colaboradores WHERE id_colaborador = ?");
        $stmt->execute([$id]);

        return [
            'success' => true,
            'message' => 'Colaborador eliminado exitosamente',
        ];
    }

    private function validateBase(array $input): void {
        if (empty($input['nombre'])) {
            throw new \Exception("Nombre requerido");
        }
        if (empty($input['apellido'])) {
            throw new \Exception("Apellido requerido");
        }

        $correo = trim((string)($input['email'] ?? $input['correo'] ?? ''));
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("Correo inválido");
        }

        $telefono = trim((string)($input['telefono'] ?? ''));
        if (!preg_match('/^[0-9]{10,15}$/', $telefono)) {
            throw new \Exception("Teléfono inválido");
        }
    }
}