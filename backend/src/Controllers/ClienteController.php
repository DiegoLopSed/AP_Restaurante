<?php
/**
 * Controlador de Clientes Frecuentes (Programa de Lealtad)
 * Maneja registro e inicio de sesión de clientes
 */

namespace App\Controllers;

require_once __DIR__ . '/../../config/database.php';

class ClienteController {

    /**
     * Manejar petición con input ya parseado (para endpoints específicos)
     */
    public function handleRequestWithInput(array $input) {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        $action = $input['action'] ?? '';
        if ($action === 'registro') {
            $this->handleRegistro($input);
        } elseif ($action === 'login') {
            $this->handleLogin($input);
        } else {
            throw new \Exception("Acción no válida.");
        }
    }

    /**
     * Manejar todas las peticiones HTTP
     */
    public function handleRequest() {
        if (ob_get_level()) {
            ob_clean();
        }

        $method = $_SERVER['REQUEST_METHOD'];

        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        try {
            if ($method !== 'POST') {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Método no permitido. Solo se permite POST.'
                ], 405);
                return;
            }

            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("JSON inválido: " . json_last_error_msg());
            }

            $action = $input['action'] ?? $_GET['action'] ?? '';

            if ($action === 'registro') {
                $this->handleRegistro($input);
            } elseif ($action === 'login') {
                $this->handleLogin($input);
            } else {
                throw new \Exception("Acción no válida. Use 'registro' o 'login'.");
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
     * Registro de nuevo cliente frecuente
     */
    private function handleRegistro($input) {
        $nombre = trim($input['nombre'] ?? '');
        $correo = trim($input['correo'] ?? '');
        $telefono = trim(preg_replace('/\D/', '', $input['telefono'] ?? ''));
        $direccionEntrega = trim($input['direccion_entrega'] ?? '');
        $contrasena = $input['contrasena'] ?? '';

        if (empty($nombre) || empty($correo) || empty($telefono) || empty($direccionEntrega) || empty($contrasena)) {
            throw new \Exception("Todos los campos son obligatorios: nombre, correo, teléfono, dirección de entrega y contraseña.");
        }

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("Correo electrónico inválido.");
        }

        if (strlen($telefono) < 10 || strlen($telefono) > 15) {
            throw new \Exception("El teléfono debe tener entre 10 y 15 dígitos.");
        }

        if (strlen($contrasena) < 8) {
            throw new \Exception("La contraseña debe tener al menos 8 caracteres.");
        }

        $passwordHash = password_hash($contrasena, PASSWORD_DEFAULT);
        if ($passwordHash === false) {
            throw new \Exception("Error al procesar la contraseña.");
        }

        $db = getDB();

        $stmt = $db->prepare("SELECT id_cliente FROM clientes_frecuentes WHERE correo = ?");
        $stmt->execute([strtolower($correo)]);
        if ($stmt->fetch()) {
            throw new \Exception("El correo electrónico ya está registrado.");
        }

        $stmt = $db->prepare("SELECT id_cliente FROM clientes_frecuentes WHERE telefono = ?");
        $stmt->execute([$telefono]);
        if ($stmt->fetch()) {
            throw new \Exception("El número de teléfono ya está registrado.");
        }

        $codigoCliente = $this->generarCodigoCliente($db);

        $stmt = $db->prepare(
            "INSERT INTO clientes_frecuentes (codigo_cliente, nombre, correo, telefono, pass, direccion_entrega)
             VALUES (?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            $codigoCliente,
            $nombre,
            strtolower($correo),
            $telefono,
            $passwordHash,
            $direccionEntrega
        ]);

        $idCliente = $db->lastInsertId();

        $this->jsonResponse([
            'success' => true,
            'message' => 'Registro exitoso. Tu código de cliente es: ' . $codigoCliente,
            'data' => [
                'id_cliente' => (int) $idCliente,
                'codigo_cliente' => $codigoCliente,
                'nombre' => $nombre
            ]
        ], 201);
    }

    /**
     * Genera un código único de cliente (mínimo 6 caracteres)
     * Formato: CLI-XXXXXX donde X es alfanumérico
     */
    private function generarCodigoCliente($db) {
        $caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin 0, O, 1, I para evitar confusión
        $maxIntentos = 50;

        for ($i = 0; $i < $maxIntentos; $i++) {
            $sufijo = '';
            for ($j = 0; $j < 6; $j++) {
                $sufijo .= $caracteres[random_int(0, strlen($caracteres) - 1)];
            }
            $codigo = 'CLI-' . $sufijo;

            $stmt = $db->prepare("SELECT id_cliente FROM clientes_frecuentes WHERE codigo_cliente = ?");
            $stmt->execute([$codigo]);
            if (!$stmt->fetch()) {
                return $codigo;
            }
        }

        throw new \Exception("No se pudo generar un código de cliente único. Intenta de nuevo.");
    }

    /**
     * Login: permite correo O teléfono + contraseña
     */
    private function handleLogin($input) {
        $correoOTelefono = trim($input['correo_o_telefono'] ?? $input['correo'] ?? '');
        $contrasena = $input['contrasena'] ?? '';

        if (empty($correoOTelefono) || empty($contrasena)) {
            throw new \Exception("Correo/teléfono y contraseña son requeridos.");
        }

        $db = getDB();

        $telefonoLimpio = preg_replace('/\D/', '', $correoOTelefono);
        $esEmail = filter_var($correoOTelefono, FILTER_VALIDATE_EMAIL);

        $cliente = null;

        if ($esEmail) {
            $stmt = $db->prepare(
                "SELECT id_cliente, codigo_cliente, nombre, correo, telefono, pass, direccion_entrega, bonos
                 FROM clientes_frecuentes WHERE correo = ?"
            );
            $stmt->execute([strtolower($correoOTelefono)]);
            $cliente = $stmt->fetch(\PDO::FETCH_ASSOC);
        } else {
            if (strlen($telefonoLimpio) < 10) {
                throw new \Exception("Ingresa un correo electrónico válido o un número de teléfono de al menos 10 dígitos.");
            }
            $stmt = $db->prepare(
                "SELECT id_cliente, codigo_cliente, nombre, correo, telefono, pass, direccion_entrega, bonos
                 FROM clientes_frecuentes WHERE telefono = ?"
            );
            $stmt->execute([$telefonoLimpio]);
            $cliente = $stmt->fetch(\PDO::FETCH_ASSOC);
        }

        if (!$cliente) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Correo/teléfono o contraseña incorrectos.'
            ], 401);
            return;
        }

        if (!password_verify($contrasena, $cliente['pass'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Correo/teléfono o contraseña incorrectos.'
            ], 401);
            return;
        }

        unset($cliente['pass']);

        $token = $this->generarToken($cliente['id_cliente'], $cliente['codigo_cliente']);

        $usuario = [
            'id_cliente' => (int) $cliente['id_cliente'],
            'codigo_cliente' => $cliente['codigo_cliente'],
            'nombre' => $cliente['nombre'],
            'correo' => $cliente['correo'],
            'telefono' => $cliente['telefono'],
            'direccion_entrega' => $cliente['direccion_entrega'],
            'bonos' => (int) $cliente['bonos'],
            'tipo' => 'cliente'
        ];

        $this->jsonResponse([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
                'token' => $token,
                'usuario' => $usuario
            ]
        ], 200);
    }

    private function generarToken($idCliente, $codigoCliente) {
        $timestamp = time();
        $tokenData = 'cliente:' . $idCliente . ':' . $codigoCliente . ':' . $timestamp;
        return base64_encode($tokenData);
    }

    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}
