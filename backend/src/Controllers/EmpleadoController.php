<?php
/**
 * Controlador de Colaboradores (Empleados)
 * Maneja las peticiones HTTP para la gestión de colaboradores
 * Utiliza la tabla 'colaboradores' en lugar de 'empleado'
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';

class EmpleadoController {

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
        header('Access-Control-Allow-Headers: Content-Type');

        // Manejar preflight requests
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        try {
            // Obtener y validar ID
            $id = isset($_GET['id']) ? $this->validateId($_GET['id']) : null;

            // Obtener datos del body para POST/PUT
            $input = null;
            if ($method === 'POST' || $method === 'PUT') {
                $rawInput = file_get_contents('php://input');
                $input = json_decode($rawInput, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception("JSON inválido: " . json_last_error_msg());
                }
            }

            switch ($method) {
                case 'GET':
                    $this->handleGet($id);
                    break;

                case 'POST':
                    $this->handlePost($input);
                    break;

                case 'PUT':
                    $this->handlePut($id, $input);
                    break;

                case 'DELETE':
                    $this->handleDelete($id);
                    break;

                default:
                    $this->jsonResponse([
                        'success' => false,
                        'message' => 'Método no permitido'
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
     * Manejar peticiones GET
     */
    private function handleGet($id) {
        $db = getDB();

        if ($id) {
            // Obtener un colaborador específico
            $stmt = $db->prepare(
                "SELECT id_colaborador, nombre, apellido, correo, telefono, posicion, created_at, updated_at
                 FROM colaboradores 
                 WHERE id_colaborador = ?"
            );
            $stmt->execute([$id]);
            $colaborador = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$colaborador) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Colaborador no encontrado'
                ], 404);
                return;
            }

            $this->jsonResponse([
                'success' => true,
                'data' => $colaborador
            ]);
        } else {
            // Obtener todos los colaboradores
            $stmt = $db->query(
                "SELECT id_colaborador, nombre, apellido, correo, telefono, posicion, created_at, updated_at
                 FROM colaboradores 
                 ORDER BY nombre ASC, apellido ASC"
            );
            $colaboradores = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $this->jsonResponse([
                'success' => true,
                'data' => $colaboradores
            ]);
        }
    }

    /**
     * Manejar peticiones POST
     */
    private function handlePost($input) {
        if (!$input) {
            throw new \Exception("Datos requeridos");
        }

        // Validar datos de entrada
        $this->validateEmpleadoData($input);

        $db = getDB();
        
        // Iniciar transacción
        $db->beginTransaction();
        
        try {
            // Validar y obtener datos
            $nombre = trim($input['nombre'] ?? '');
            $apellido = trim($input['apellido'] ?? '');
            $correo = strtolower(trim($input['email'] ?? ''));
            $telefono = trim($input['telefono'] ?? '');
            $posicion = trim($input['cargo'] ?? $input['posicion'] ?? '');
            
            // Verificar si el correo ya existe
            $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE correo = ?");
            $stmt->execute([$correo]);
            if ($stmt->fetch()) {
                throw new \Exception("El correo electrónico ya está registrado");
            }
            
            $rfc = null;
            $curp = null;
            $passwordHash = null;
            
            // Si se proporcionan RFC, CURP y contraseña, procesarlos
            if (!empty($input['rfc']) && !empty($input['curp']) && !empty($input['contrasena'])) {
                // Validar RFC
                $rfc = strtoupper(trim($input['rfc']));
                if (strlen($rfc) < 12 || strlen($rfc) > 13 || !preg_match('/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i', $rfc)) {
                    throw new \Exception("RFC inválido. Debe tener entre 12 y 13 caracteres alfanuméricos");
                }
                
                // Validar CURP
                $curp = strtoupper(trim($input['curp']));
                if (strlen($curp) !== 18 || !preg_match('/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/i', $curp)) {
                    throw new \Exception("CURP inválido. Debe tener exactamente 18 caracteres");
                }
                
                // Validar contraseña
                if (strlen($input['contrasena']) < 8) {
                    throw new \Exception("La contraseña debe tener al menos 8 caracteres");
                }
                
                // Verificar si el RFC ya existe
                $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE rfc = ?");
                $stmt->execute([$rfc]);
                if ($stmt->fetch()) {
                    throw new \Exception("El RFC ya está registrado");
                }
                
                // Verificar si el CURP ya existe
                $stmt = $db->prepare("SELECT id_colaborador FROM colaboradores WHERE curp = ?");
                $stmt->execute([$curp]);
                if ($stmt->fetch()) {
                    throw new \Exception("El CURP ya está registrado");
                }
                
                // Hash de la contraseña (solo la contraseña tiene hash)
                $passwordHash = password_hash($input['contrasena'], PASSWORD_DEFAULT);
                if ($passwordHash === false) {
                    throw new \Exception("Error al procesar la contraseña");
                }
            }
            
            // Crear colaborador (solo la contraseña tiene hash, RFC y CURP se guardan directamente)
            $stmt = $db->prepare(
                "INSERT INTO colaboradores (nombre, apellido, rfc, curp, correo, telefono, pass, posicion)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            
            $stmt->execute([
                $nombre,
                $apellido,
                $rfc,
                $curp,
                $correo,
                $telefono,
                $passwordHash,
                $posicion
            ]);
            
            $idColaborador = $db->lastInsertId();
            
            // Confirmar transacción
            $db->commit();

            $this->jsonResponse([
                'success' => true,
                'message' => 'Colaborador creado exitosamente',
                'data' => [
                    'id_colaborador' => $idColaborador
                ]
            ], 201);
            
        } catch (\Exception $e) {
            // Revertir transacción en caso de error
            $db->rollBack();
            throw $e;
        }
    }

    /**
     * Manejar peticiones PUT
     */
    private function handlePut($id, $input) {
        if (!$id) {
            throw new \Exception("ID requerido");
        }

        if (!$input) {
            throw new \Exception("Datos requeridos");
        }

        // Validar datos de entrada
        $this->validateEmpleadoData($input, true);

        $db = getDB();

        // Verificar que el colaborador existe
        $stmt = $db->prepare(
            "SELECT id_colaborador FROM colaboradores WHERE id_colaborador = ?"
        );
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Colaborador no encontrado");
        }

        // Verificar si ya existe otro colaborador con el mismo email
        $stmt = $db->prepare(
            "SELECT id_colaborador FROM colaboradores WHERE correo = ? AND id_colaborador != ?"
        );
        $stmt->execute([strtolower(trim($input['email'])), $id]);
        if ($stmt->fetch()) {
            throw new \Exception("Ya existe otro colaborador con ese email");
        }

        // Obtener posición (puede venir como 'cargo' o 'posicion')
        $posicion = trim($input['cargo'] ?? $input['posicion'] ?? '');

        // Actualizar colaborador
        $stmt = $db->prepare(
            "UPDATE colaboradores
             SET nombre = ?, apellido = ?, telefono = ?, correo = ?, posicion = ?
             WHERE id_colaborador = ?"
        );

        $stmt->execute([
            trim($input['nombre']),
            trim($input['apellido']),
            trim($input['telefono']),
            strtolower(trim($input['email'])),
            $posicion,
            $id
        ]);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Colaborador actualizado exitosamente'
        ]);
    }

    /**
     * Manejar peticiones DELETE
     */
    private function handleDelete($id) {
        if (!$id) {
            throw new \Exception("ID requerido");
        }

        $db = getDB();

        // Verificar que el colaborador existe
        $stmt = $db->prepare(
            "SELECT id_colaborador FROM colaboradores WHERE id_colaborador = ?"
        );
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Colaborador no encontrado");
        }

        // Eliminar colaborador
        $stmt = $db->prepare(
            "DELETE FROM colaboradores WHERE id_colaborador = ?"
        );

        $stmt->execute([$id]);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Colaborador eliminado exitosamente'
        ]);
    }

    /**
     * Validar datos de colaborador
     */
    private function validateEmpleadoData($input, $isUpdate = false) {
        if (empty($input['nombre']) || !is_string($input['nombre'])) {
            throw new \Exception("El nombre es requerido y debe ser una cadena de texto");
        }

        $nombre = trim($input['nombre']);
        if (strlen($nombre) < 2) {
            throw new \Exception("El nombre debe tener al menos 2 caracteres");
        }

        if (strlen($nombre) > 100) {
            throw new \Exception("El nombre no puede exceder 100 caracteres");
        }

        if (empty($input['apellido']) || !is_string($input['apellido'])) {
            throw new \Exception("El apellido es requerido y debe ser una cadena de texto");
        }

        $apellido = trim($input['apellido']);
        if (strlen($apellido) < 2) {
            throw new \Exception("El apellido debe tener al menos 2 caracteres");
        }

        if (strlen($apellido) > 100) {
            throw new \Exception("El apellido no puede exceder 100 caracteres");
        }

        // Validar posición (puede venir como 'cargo' o 'posicion')
        $posicion = trim($input['cargo'] ?? $input['posicion'] ?? '');
        if (empty($posicion)) {
            throw new \Exception("La posición es requerida");
        }

        if (strlen($posicion) > 100) {
            throw new \Exception("La posición no puede exceder 100 caracteres");
        }

        // Validar email
        if (empty($input['email']) || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("El email es requerido y debe ser válido");
        }

        // Validar teléfono
        if (empty($input['telefono']) || !preg_match('/^[0-9]{10,15}$/', $input['telefono'])) {
            throw new \Exception("El teléfono es requerido y debe tener entre 10 y 15 dígitos");
        }
        
        // Validar que si se proporciona alguno de RFC, CURP o contraseña, se proporcionen todos
        $tieneRfc = !empty($input['rfc']);
        $tieneCurp = !empty($input['curp']);
        $tieneContrasena = !empty($input['contrasena']);
        
        if (($tieneRfc || $tieneCurp || $tieneContrasena) && !($tieneRfc && $tieneCurp && $tieneContrasena)) {
            throw new \Exception("Si desea crear un usuario con credenciales, debe proporcionar RFC, CURP y contraseña");
        }
    }

    /**
     * Validar y sanitizar ID
     */
    private function validateId($id) {
        if (empty($id)) {
            return null;
        }

        if (!is_numeric($id)) {
            throw new \Exception("ID inválido");
        }

        $id = (int)$id;
        if ($id <= 0) {
            throw new \Exception("ID debe ser un número positivo");
        }

        return $id;
    }

    /**
     * Enviar respuesta JSON
     */
    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}

