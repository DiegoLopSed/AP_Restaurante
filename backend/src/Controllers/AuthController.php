<?php
/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP para login y autenticación
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Utils/EncryptionHelper.php';

use App\Utils\EncryptionHelper;

class AuthController {

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
            // Solo permitir POST para login
            if ($method !== 'POST') {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Método no permitido. Solo se permite POST para login.'
                ], 405);
                return;
            }

            // Obtener datos del body (JSON)
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("JSON inválido: " . json_last_error_msg());
            }

            $this->handleLogin($input);

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
     * Manejar petición de login
     */
    private function handleLogin($input) {
        if (!$input) {
            throw new \Exception("Datos requeridos");
        }

        $correo = trim($input['correo'] ?? '');
        $contrasena = $input['contrasena'] ?? '';

        // Validar campos requeridos
        if (empty($correo) || empty($contrasena)) {
            throw new \Exception("Correo y contraseña son requeridos");
        }

        // Validar formato de correo
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("Correo electrónico inválido");
        }

        $db = getDB();

        // Buscar registro por correo
        $stmt = $db->prepare(
            "SELECT id_registro, nombre, apellido, correo, contrasena, rfc, curp, telefono 
             FROM registro 
             WHERE correo = ?"
        );
        $stmt->execute([strtolower($correo)]);
        $registro = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Verificar si el registro existe
        if (!$registro) {
            // No revelar si el correo existe o no por seguridad
            $this->jsonResponse([
                'success' => false,
                'message' => 'Correo o contraseña incorrectos'
            ], 401);
            return;
        }

        // Verificar contraseña
        if (!password_verify($contrasena, $registro['contrasena'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Correo o contraseña incorrectos'
            ], 401);
            return;
        }

        // Eliminar contraseña de los datos del registro antes de enviarlos
        unset($registro['contrasena']);

        // Generar token simple (en producción, usar JWT o similar)
        $token = $this->generarToken($registro['id_registro'], $registro['correo']);

        // Descifrar RFC y CURP antes de enviar (solo para mostrar, no enviar completos por seguridad)
        $rfcDescifrado = EncryptionHelper::decryptRfc($registro['rfc']);
        $curpDescifrado = EncryptionHelper::decryptCurp($registro['curp']);
        
        // Datos del registro para la respuesta (sin contraseña)
        // Por seguridad, solo mostrar parcialmente RFC y CURP
        $registroData = [
            'id_registro' => $registro['id_registro'],
            'nombre' => $registro['nombre'],
            'apellido' => $registro['apellido'],
            'correo' => $registro['correo'],
            'rfc' => substr($rfcDescifrado, 0, 4) . '****' . substr($rfcDescifrado, -3), // Solo mostrar parcialmente
            'curp' => substr($curpDescifrado, 0, 4) . '****' . substr($curpDescifrado, -4), // Solo mostrar parcialmente
            'telefono' => $registro['telefono']
        ];

        $this->jsonResponse([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'token' => $token,
                'usuario' => $registroData
            ]
        ], 200);
    }

    /**
     * Generar token simple para autenticación
     * En producción, usar JWT o similar
     */
    private function generarToken($idRegistro, $correo) {
        // Token simple: base64(id_registro:correo:timestamp)
        // En producción, usar una biblioteca JWT
        $timestamp = time();
        $tokenData = $idRegistro . ':' . $correo . ':' . $timestamp;
        return base64_encode($tokenData);
    }

    /**
     * Enviar respuesta JSON
     */
    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}

