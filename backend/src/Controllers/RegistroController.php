<?php
/**
 * Controlador de Registro de Usuarios
 * Maneja las peticiones HTTP para el registro de usuarios
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/EncryptionHelper.php';

use App\Utils\EncryptionHelper;

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
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        // Manejar preflight requests
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        try {
            // Solo permitir POST para registro
            if ($method !== 'POST') {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Método no permitido. Solo se permite POST para registro.'
                ], 405);
                return;
            }

            // Obtener datos del formulario (puede ser JSON o FormData)
            $input = null;
            $rawInput = file_get_contents('php://input');
            
            // Intentar parsear como JSON primero
            $jsonData = json_decode($rawInput, true);
            if (json_last_error() === JSON_ERROR_NONE && $jsonData !== null) {
                $input = $jsonData;
            } else {
                // Si no es JSON, usar $_POST (FormData)
                $input = $_POST;
            }

            $this->handlePost($input);

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

        // Validar campos requeridos
        if (empty($nombre) || empty($apellido) || empty($rfc) || empty($curp) || 
            empty($correo) || empty($telefono) || empty($contrasena)) {
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
        $stmt = $db->prepare("SELECT id_registro FROM registro WHERE correo = ?");
        $stmt->execute([$correo]);
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

        // Cifrar RFC y CURP antes de guardar
        $rfcCifrado = EncryptionHelper::encryptRfc($rfc);
        $curpCifrado = EncryptionHelper::encryptCurp($curp);
        
        // Insertar nuevo registro
        $stmt = $db->prepare(
            "INSERT INTO registro (nombre, apellido, rfc, curp, correo, telefono, contrasena)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            $nombre,
            $apellido,
            $rfcCifrado,
            $curpCifrado,
            strtolower($correo),
            $telefono,
            $passwordHash
        ]);

        $idRegistro = $db->lastInsertId();

        $this->jsonResponse([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data' => ['id_registro' => $idRegistro]
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
