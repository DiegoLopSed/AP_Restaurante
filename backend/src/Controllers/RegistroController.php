<?php
/**
 * Controlador de Registro de Colaboradores
 * Maneja las peticiones HTTP para el registro de colaboradores
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';

class RegistroController {

    /**
     * Manejar todas las peticiones HTTP
     */
    public function handleRequest() {
        // Limpiar cualquier salida previa
        if (ob_get_level()) {
            ob_clean();
        }

        $method = $_SERVER['REQUEST_METHOD'];

        // Headers CORS (deben ir antes de cualquier salida)
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        // Manejar preflight requests
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        $id = isset($_GET['id']) ? trim($_GET['id']) : null;

        try {
            switch ($method) {
                case 'GET':
                    $this->handleGet($id);
                    break;
                case 'POST':
                    $input = $this->getInput();
                    $this->handlePost($input);
                    break;
                case 'PUT':
                    if (!$id) {
                        $this->jsonResponse(['success' => false, 'message' => 'ID requerido para actualizar'], 400);
                        return;
                    }
                    $input = $this->getInput();
                    $this->handlePut((int) $id, $input);
                    break;
                case 'DELETE':
                    if (!$id) {
                        $this->jsonResponse(['success' => false, 'message' => 'ID requerido para eliminar'], 400);
                        return;
                    }
                    $this->handleDelete((int) $id);
                    break;
                default:
                    $this->jsonResponse([
                        'success' => false,
                        'message' => 'Método no permitido. Use GET, POST, PUT o DELETE.'
                    ], 405);
            }

        } catch (\PDOException $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Error de base de datos: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Obtener cuerpo de la petición como array (JSON o form)
     */
    private function getInput() {
        $rawInput = file_get_contents('php://input');
        $jsonData = json_decode($rawInput, true);
        if (json_last_error() === JSON_ERROR_NONE && $jsonData !== null) {
            return $jsonData;
        }
        return $_POST ?: [];
    }

    /**
     * Manejar GET: listar todos o uno por id
     */
    private function handleGet($id) {
        $db = getDB();
        if ($id !== null && $id !== '') {
            $stmt = $db->prepare(
                "SELECT id_colaborador, nombre, apellido, rfc, curp, correo, telefono, posicion, created_at, updated_at
                 FROM colaboradores WHERE id_colaborador = ?"
            );
            $stmt->execute([(int) $id]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$row) {
                $this->jsonResponse(['success' => false, 'message' => 'Usuario no encontrado'], 404);
                return;
            }
            $this->jsonResponse(['success' => true, 'data' => $row]);
            return;
        }
        $stmt = $db->query(
            "SELECT id_colaborador, nombre, apellido, rfc, curp, correo, telefono, posicion, created_at, updated_at
             FROM colaboradores ORDER BY id_colaborador"
        );
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $this->jsonResponse(['success' => true, 'data' => $rows]);
    }

    /**
     * Manejar PUT: actualizar colaborador
     */
    private function handlePut($idColaborador, $input) {
        $nombre = trim($input['nombre'] ?? '');
        $apellido = trim($input['apellido'] ?? '');
        $rfc = trim($input['rfc'] ?? '');
        $curp = trim($input['curp'] ?? '');
        $correo = trim($input['correo'] ?? '');
        $telefono = trim($input['telefono'] ?? '');
        $posicion = trim($input['posicion'] ?? '');
        $contrasena = $input['contrasena'] ?? '';

        if (empty($nombre) || empty($apellido) || empty($rfc) || empty($curp) ||
            empty($correo) || empty($telefono) || empty($posicion)) {
            throw new \Exception("Nombre, apellido, RFC, CURP, correo, teléfono y posición son requeridos");
        }
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("Correo electrónico inválido");
        }
        if (strlen($rfc) < 12 || strlen($rfc) > 13 || !preg_match('/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i', $rfc)) {
            throw new \Exception("RFC inválido");
        }
        if (strlen($curp) !== 18 || !preg_match('/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/i', $curp)) {
            throw new \Exception("CURP inválido");
        }
        if (strlen($telefono) < 10 || strlen($telefono) > 15 || !preg_match('/^[0-9]{10,15}$/', $telefono)) {
            throw new \Exception("Teléfono inválido");
        }
        if ($contrasena !== '' && strlen($contrasena) < 8) {
            throw new \Exception("La contraseña debe tener al menos 8 caracteres");
        }

        $db = getDB();

        // Verificar que existe
        $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE id_colaborador = ?");
        $stmt->execute([$idColaborador]);
        if (!$stmt->fetch()) {
            $this->jsonResponse(['success' => false, 'message' => 'Usuario no encontrado'], 404);
            return;
        }

        // Verificar correo único (excluyendo el actual)
        $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE correo = ? AND id_colaborador != ?");
        $stmt->execute([$correo, $idColaborador]);
        if ($stmt->fetch()) {
            throw new \Exception("El correo electrónico ya está en uso");
        }
        $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE rfc = ? AND id_colaborador != ?");
        $stmt->execute([strtoupper($rfc), $idColaborador]);
        if ($stmt->fetch()) {
            throw new \Exception("El RFC ya está en uso");
        }
        $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE curp = ? AND id_colaborador != ?");
        $stmt->execute([strtoupper($curp), $idColaborador]);
        if ($stmt->fetch()) {
            throw new \Exception("El CURP ya está en uso");
        }

        if ($contrasena !== '') {
            $passwordHash = password_hash($contrasena, PASSWORD_DEFAULT);
            $stmt = $db->prepare(
                "UPDATE colaboradores SET nombre=?, apellido=?, rfc=?, curp=?, correo=?, telefono=?, pass=?, posicion=?
                 WHERE id_colaborador=?"
            );
            $stmt->execute([
                $nombre, $apellido, strtoupper($rfc), strtoupper($curp), strtolower($correo),
                $telefono, $passwordHash, $posicion, $idColaborador
            ]);
        } else {
            $stmt = $db->prepare(
                "UPDATE colaboradores SET nombre=?, apellido=?, rfc=?, curp=?, correo=?, telefono=?, posicion=?
                 WHERE id_colaborador=?"
            );
            $stmt->execute([
                $nombre, $apellido, strtoupper($rfc), strtoupper($curp), strtolower($correo),
                $telefono, $posicion, $idColaborador
            ]);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Usuario actualizado correctamente',
            'data' => ['id_colaborador' => $idColaborador]
        ]);
    }

    /**
     * Manejar DELETE: eliminar colaborador
     */
    private function handleDelete($idColaborador) {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM colaboradores WHERE id_colaborador = ?");
        $stmt->execute([$idColaborador]);
        if ($stmt->rowCount() === 0) {
            $this->jsonResponse(['success' => false, 'message' => 'Usuario no encontrado'], 404);
            return;
        }
        $this->jsonResponse(['success' => true, 'message' => 'Usuario eliminado correctamente']);
    }

    /**
     * Manejar peticiones POST (registro de usuario)
     */
    private function handlePost($input) {
        if (!$input) {
            throw new \Exception("Datos requeridos");
        }

        // Validar y obtener datos
        $nombre = trim($input['nombre'] ?? '');
        $apellido = trim($input['apellido'] ?? '');
        $rfc = trim($input['rfc'] ?? '');
        $curp = trim($input['curp'] ?? '');
        $correo = trim($input['correo'] ?? '');
        $telefono = trim($input['telefono'] ?? '');
        $contrasena = $input['contrasena'] ?? '';
        $posicion = trim($input['posicion'] ?? '');

        // Validar campos requeridos
        if (empty($nombre) || empty($apellido) || empty($rfc) || empty($curp) || 
            empty($correo) || empty($telefono) || empty($contrasena) || empty($posicion)) {
            throw new \Exception("Todos los campos son requeridos");
        }

        // Validar formato de correo
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("Correo electrónico inválido");
        }

        // Validar RFC (formato mexicano: 13 caracteres alfanuméricos)
        if (strlen($rfc) < 12 || strlen($rfc) > 13 || !preg_match('/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i', $rfc)) {
            throw new \Exception("RFC inválido. Debe tener entre 12 y 13 caracteres alfanuméricos");
        }

        // Validar CURP (18 caracteres alfanuméricos)
        if (strlen($curp) !== 18 || !preg_match('/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/i', $curp)) {
            throw new \Exception("CURP inválido. Debe tener exactamente 18 caracteres");
        }

        // Validar teléfono (10 dígitos para México)
        if (strlen($telefono) < 10 || strlen($telefono) > 15 || !preg_match('/^[0-9]{10,15}$/', $telefono)) {
            throw new \Exception("Teléfono inválido. Debe tener entre 10 y 15 dígitos");
        }

        // Validar contraseña (mínimo 8 caracteres)
        if (strlen($contrasena) < 8) {
            throw new \Exception("La contraseña debe tener al menos 8 caracteres");
        }

        // Hash de la contraseña
        $passwordHash = password_hash($contrasena, PASSWORD_DEFAULT);
        if ($passwordHash === false) {
            throw new \Exception("Error al procesar la contraseña");
        }

        $db = getDB();

        // Verificar si el correo ya existe
        $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE correo = ?");
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            throw new \Exception("El correo electrónico ya está registrado");
        }

        // Verificar si el RFC ya existe
        $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE rfc = ?");
        $stmt->execute([strtoupper($rfc)]);
        if ($stmt->fetch()) {
            throw new \Exception("El RFC ya está registrado");
        }

        // Verificar si el CURP ya existe
        $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE curp = ?");
        $stmt->execute([strtoupper($curp)]);
        if ($stmt->fetch()) {
            throw new \Exception("El CURP ya está registrado");
        }
        
        // Insertar nuevo registro (solo la contraseña tiene hash, RFC y CURP se guardan directamente)
        $stmt = $db->prepare(
            "INSERT INTO colaboradores (nombre, apellido, rfc, curp, correo, telefono, pass, posicion)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            $nombre,
            $apellido,
            strtoupper($rfc),
            strtoupper($curp),
            strtolower($correo),
            $telefono,
            $passwordHash,
            $posicion
        ]);

        $idColaborador = $db->lastInsertId();

        $this->jsonResponse([
            'success' => true,
            'message' => 'Colaborador registrado exitosamente',
            'data' => ['id_colaborador' => $idColaborador]
        ], 201);
    }

    /**
     * Enviar respuesta JSON
     */
    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}
