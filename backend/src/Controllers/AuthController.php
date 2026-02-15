<?php
/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP para login y autenticación
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';

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

        // Buscar colaborador por correo
        $stmt = $db->prepare(
            "SELECT id_colaborador, nombre, apellido, correo, pass, rfc, curp, telefono, posicion
             FROM colaboradores
             WHERE correo = ?"
        );
        $stmt->execute([strtolower($correo)]);
        $colaborador = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Verificar si el colaborador existe
        if (!$colaborador) {
            // No revelar si el correo existe o no por seguridad
            $this->jsonResponse([
                'success' => false,
                'message' => 'Correo o contraseña incorrectos'
            ], 401);
            return;
        }

        // Verificar contraseña
        if (!password_verify($contrasena, $colaborador['pass'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Correo o contraseña incorrectos'
            ], 401);
            return;
        }

        // Eliminar contraseña de los datos del colaborador antes de enviarlos
        unset($colaborador['pass']);

        // Generar token simple (en producción, usar JWT o similar)
        $token = $this->generarToken($colaborador['id_colaborador'], $colaborador['correo']);

        // Por seguridad, solo mostrar parcialmente RFC y CURP
        $rfc = $colaborador['rfc'] ?? '';
        $curp = $colaborador['curp'] ?? '';

        $colaboradorData = [
            'id_colaborador' => $colaborador['id_colaborador'],
            'nombre' => $colaborador['nombre'],
            'apellido' => $colaborador['apellido'],
            'correo' => $colaborador['correo'],
            'rfc' => $rfc ? (substr($rfc, 0, 4) . '****' . substr($rfc, -3)) : '',
            'curp' => $curp ? (substr($curp, 0, 4) . '****' . substr($curp, -4)) : '',
            'telefono' => $colaborador['telefono'],
            'posicion' => $colaborador['posicion']
        ];

        $this->jsonResponse([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'token' => $token,
                'usuario' => $colaboradorData
            ]
        ], 200);
    }

    /**
     * Generar token simple para autenticación
     * En producción, usar JWT o similar
     */
    private function generarToken($idColaborador, $correo) {
        $timestamp = time();
        $tokenData = $idColaborador . ':' . $correo . ':' . $timestamp;
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


