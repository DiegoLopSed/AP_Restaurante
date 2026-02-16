<?php
/**
 * Modelo Colaborador
 * Maneja operaciones de base de datos para la tabla colaboradores
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

    /**
     * Crear colaborador.
     * Acepta: nombre, apellido, telefono, email|correo, cargo|posicion
     * Opcional: rfc, curp, contrasena (si se envían, se guardan RFC/CURP en texto y pass con hash)
     */
    public function create(array $input): array {
        $this->validateBase($input);

        $nombre = trim((string)$input['nombre']);
        $apellido = trim((string)$input['apellido']);
        $correo = strtolower(trim((string)($input['email'] ?? $input['correo'] ?? '')));
        $telefono = trim((string)$input['telefono']);
        $posicion = trim((string)($input['cargo'] ?? $input['posicion'] ?? ''));

        $this->db->beginTransaction();

        try {
            // Unicidad por correo
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
                    throw new \Exception("Si desea crear un usuario con credenciales, debe proporcionar RFC, CURP y contraseña");
                }

                $rfc = strtoupper(trim((string)$input['rfc']));
                $curp = strtoupper(trim((string)$input['curp']));
                $contrasena = (string)$input['contrasena'];

                // Validaciones
                if (strlen($rfc) < 12 || strlen($rfc) > 13 || !preg_match('/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i', $rfc)) {
                    throw new \Exception("RFC inválido. Debe tener entre 12 y 13 caracteres alfanuméricos");
                }
                if (strlen($curp) !== 18 || !preg_match('/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/i', $curp)) {
                    throw new \Exception("CURP inválido. Debe tener exactamente 18 caracteres");
                }
                if (strlen($contrasena) < 8) {
                    throw new \Exception("La contraseña debe tener al menos 8 caracteres");
                }

                // Unicidad por RFC/CURP (si se usan)
                $stmt = $this->db->prepare("SELECT id_colaborador FROM colaboradores WHERE rfc = ?");
                $stmt->execute([$rfc]);
                if ($stmt->fetch()) {
                    throw new \Exception("El RFC ya está registrado");
                }

                $stmt = $this->db->prepare("SELECT id_colaborador FROM colaboradores WHERE curp = ?");
                $stmt->execute([$curp]);
                if ($stmt->fetch()) {
                    throw new \Exception("El CURP ya está registrado");
                }

                $passwordHash = password_hash($contrasena, PASSWORD_DEFAULT);
                if ($passwordHash === false) {
                    throw new \Exception("Error al procesar la contraseña");
                }
            }

            $stmt = $this->db->prepare(
                "INSERT INTO colaboradores (nombre, apellido, rfc, curp, correo, telefono, pass, posicion)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$nombre, $apellido, $rfc, $curp, $correo, $telefono, $passwordHash, $posicion]);

            $idColaborador = (int)$this->db->lastInsertId();
            $this->db->commit();

            return [
                'success' => true,
                'message' => 'Colaborador creado exitosamente',
                'data' => ['id_colaborador' => $idColaborador],
            ];
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Actualizar solo datos básicos (no permite modificar RFC/CURP/pass aquí).
     */
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

        // Existe
        $stmt = $this->db->prepare("SELECT id_colaborador FROM colaboradores WHERE id_colaborador = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Colaborador no encontrado");
        }

        // Unicidad correo excluyendo el mismo
        $stmt = $this->db->prepare("SELECT id_colaborador FROM colaboradores WHERE correo = ? AND id_colaborador != ?");
        $stmt->execute([$correo, $id]);
        if ($stmt->fetch()) {
            throw new \Exception("Ya existe otro colaborador con ese email");
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
        if (empty($input['nombre']) || !is_string($input['nombre'])) {
            throw new \Exception("El nombre es requerido y debe ser una cadena de texto");
        }
        if (empty($input['apellido']) || !is_string($input['apellido'])) {
            throw new \Exception("El apellido es requerido y debe ser una cadena de texto");
        }

        $posicion = trim((string)($input['cargo'] ?? $input['posicion'] ?? ''));
        if ($posicion === '') {
            throw new \Exception("La posición es requerida");
        }
        if (strlen($posicion) > 100) {
            throw new \Exception("La posición no puede exceder 100 caracteres");
        }

        $correo = trim((string)($input['email'] ?? $input['correo'] ?? ''));
        if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("El email es requerido y debe ser válido");
        }

        $telefono = trim((string)($input['telefono'] ?? ''));
        if ($telefono === '' || !preg_match('/^[0-9]{10,15}$/', $telefono)) {
            throw new \Exception("El teléfono es requerido y debe tener entre 10 y 15 dígitos");
        }
    }
}


