<?php
/**
 * Controlador de Empleados
 * Maneja las peticiones HTTP para la gestión de empleados
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/EncryptionHelper.php';

use App\Utils\EncryptionHelper;

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
            // Obtener un empleado específico
            $stmt = $db->prepare(
                "SELECT e.*, r.correo as registro_correo 
                 FROM empleado e 
                 LEFT JOIN registro r ON e.id_registro = r.id_registro 
                 WHERE e.id_empleado = ?"
            );
            $stmt->execute([$id]);
            $empleado = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$empleado) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Empleado no encontrado'
                ], 404);
                return;
            }

            $this->jsonResponse([
                'success' => true,
                'data' => $empleado
            ]);
        } else {
            // Obtener todos los empleados
            $stmt = $db->query(
                "SELECT e.*, r.correo as registro_correo 
                 FROM empleado e 
                 LEFT JOIN registro r ON e.id_registro = r.id_registro 
                 ORDER BY e.nombre ASC, e.apellido ASC"
            );
            $empleados = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $this->jsonResponse([
                'success' => true,
                'data' => $empleados
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
        
        // Iniciar transacción para crear registro y empleado
        $db->beginTransaction();
        
        try {
            $idRegistro = null;
            
            // Si se proporcionan RFC, CURP y contraseña, crear registro
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
                
                // Verificar si el correo ya existe en registros
                $stmt = $db->prepare("SELECT id_registro FROM registro WHERE correo = ?");
                $stmt->execute([strtolower(trim($input['email']))]);
                if ($stmt->fetch()) {
                    throw new \Exception("El correo electrónico ya está registrado");
                }
                
                // Verificar si el RFC ya existe (usando cifrado)
                if (EncryptionHelper::searchByRfc($db, $rfc)) {
                    throw new \Exception("El RFC ya está registrado");
                }
                
                // Verificar si el CURP ya existe (usando cifrado)
                if (EncryptionHelper::searchByCurp($db, $curp)) {
                    throw new \Exception("El CURP ya está registrado");
                }
                
                // Hash de la contraseña
                $passwordHash = password_hash($input['contrasena'], PASSWORD_DEFAULT);
                if ($passwordHash === false) {
                    throw new \Exception("Error al procesar la contraseña");
                }
                
                // Cifrar RFC y CURP antes de guardar
                $rfcCifrado = EncryptionHelper::encryptRfc($rfc);
                $curpCifrado = EncryptionHelper::encryptCurp($curp);
                
                // Crear registro
                $stmt = $db->prepare(
                    "INSERT INTO registro (nombre, apellido, rfc, curp, correo, telefono, contrasena)
                     VALUES (?, ?, ?, ?, ?, ?, ?)"
                );
                
                $stmt->execute([
                    trim($input['nombre']),
                    trim($input['apellido']),
                    $rfcCifrado,
                    $curpCifrado,
                    strtolower(trim($input['email'])),
                    trim($input['telefono']),
                    $passwordHash
                ]);
                
                $idRegistro = $db->lastInsertId();
            }

            // Verificar si ya existe un empleado con el mismo email
            $stmt = $db->prepare(
                "SELECT id_empleado FROM empleado WHERE email = ?"
            );
            $stmt->execute([strtolower(trim($input['email']))]);
            if ($stmt->fetch()) {
                throw new \Exception("Ya existe un empleado con ese email");
            }

            // Insertar nuevo empleado
            $stmt = $db->prepare(
                "INSERT INTO empleado (nombre, apellido, cargo, telefono, email, fecha_contratacion, salario, id_registro)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );

            $stmt->execute([
                trim($input['nombre']),
                trim($input['apellido']),
                $input['cargo'],
                trim($input['telefono']),
                strtolower(trim($input['email'])),
                $input['fechaContratacion'],
                $input['salario'],
                $idRegistro
            ]);

            $idEmpleado = $db->lastInsertId();
            
            // Confirmar transacción
            $db->commit();

            $mensaje = 'Empleado creado exitosamente';
            if ($idRegistro) {
                $mensaje .= ' y registro asociado creado';
            }

            $this->jsonResponse([
                'success' => true,
                'message' => $mensaje,
                'data' => [
                    'id_empleado' => $idEmpleado,
                    'id_registro' => $idRegistro
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

        // Verificar que el empleado existe
        $stmt = $db->prepare(
            "SELECT id_empleado FROM empleado WHERE id_empleado = ?"
        );
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Empleado no encontrado");
        }

        // Verificar si ya existe otro empleado con el mismo email
        $stmt = $db->prepare(
            "SELECT id_empleado FROM empleado WHERE email = ? AND id_empleado != ?"
        );
        $stmt->execute([strtolower(trim($input['email'])), $id]);
        if ($stmt->fetch()) {
            throw new \Exception("Ya existe otro empleado con ese email");
        }

        // Actualizar empleado
        $stmt = $db->prepare(
            "UPDATE empleado
             SET nombre = ?, apellido = ?, cargo = ?, telefono = ?, email = ?, 
                 fecha_contratacion = ?, salario = ?, id_registro = ?
             WHERE id_empleado = ?"
        );

        $stmt->execute([
            trim($input['nombre']),
            trim($input['apellido']),
            $input['cargo'],
            trim($input['telefono']),
            strtolower(trim($input['email'])),
            $input['fechaContratacion'],
            $input['salario'],
            isset($input['id_registro']) ? $input['id_registro'] : null,
            $id
        ]);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Empleado actualizado exitosamente'
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

        // Verificar que el empleado existe
        $stmt = $db->prepare(
            "SELECT id_empleado FROM empleado WHERE id_empleado = ?"
        );
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            throw new \Exception("Empleado no encontrado");
        }

        // Eliminar empleado
        $stmt = $db->prepare(
            "DELETE FROM empleado WHERE id_empleado = ?"
        );

        $stmt->execute([$id]);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Empleado eliminado exitosamente'
        ]);
    }

    /**
     * Validar datos de empleado
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

        // Validar cargo
        $cargosValidos = ['Mesero', 'Cocinero', 'Cajero', 'Gerente', 'Limpieza'];
        if (empty($input['cargo']) || !in_array($input['cargo'], $cargosValidos)) {
            throw new \Exception("El cargo es requerido y debe ser uno de: " . implode(', ', $cargosValidos));
        }

        // Validar email
        if (empty($input['email']) || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("El email es requerido y debe ser válido");
        }

        // Validar teléfono
        if (empty($input['telefono']) || !preg_match('/^[0-9]{10,15}$/', $input['telefono'])) {
            throw new \Exception("El teléfono es requerido y debe tener entre 10 y 15 dígitos");
        }

        // Validar fecha de contratación
        if (empty($input['fechaContratacion'])) {
            throw new \Exception("La fecha de contratación es requerida");
        }

        // Validar salario
        if (!isset($input['salario']) || !is_numeric($input['salario']) || $input['salario'] < 0) {
            throw new \Exception("El salario es requerido y debe ser un número positivo");
        }
        
        // Validar que si se proporciona alguno de RFC, CURP o contraseña, se proporcionen todos
        $tieneRfc = !empty($input['rfc']);
        $tieneCurp = !empty($input['curp']);
        $tieneContrasena = !empty($input['contrasena']);
        
        if (($tieneRfc || $tieneCurp || $tieneContrasena) && !($tieneRfc && $tieneCurp && $tieneContrasena)) {
            throw new \Exception("Si desea crear un usuario asociado, debe proporcionar RFC, CURP y contraseña");
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

