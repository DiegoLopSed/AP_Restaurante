<?php
/**
 * Helper para cifrado de datos sensibles
 * Utiliza AES-256-CBC para cifrar RFC y CURP
 */

namespace App\Utils;

class EncryptionHelper {
    
    private static $cipher = 'AES-256-CBC';
    private static $key = null;
    private static $ivLength = null;
    
    /**
     * Obtener la clave de cifrado desde variables de entorno
     */
    private static function getEncryptionKey() {
        if (self::$key === null) {
            $key = $_ENV['ENCRYPTION_KEY'] ?? null;
            
            if (empty($key)) {
                throw new \Exception("Clave de cifrado no configurada. Agregue ENCRYPTION_KEY en el archivo .env");
            }
            
            // La clave debe tener 32 bytes para AES-256
            if (strlen($key) < 32) {
                // Generar una clave derivada usando hash
                $key = hash('sha256', $key, true);
            } else {
                $key = substr($key, 0, 32);
            }
            
            self::$key = $key;
            self::$ivLength = openssl_cipher_iv_length(self::$cipher);
        }
        
        return self::$key;
    }
    
    /**
     * Cifrar un valor
     */
    public static function encrypt($data) {
        if (empty($data)) {
            return $data;
        }
        
        try {
            $key = self::getEncryptionKey();
            $iv = openssl_random_pseudo_bytes(self::$ivLength);
            
            $encrypted = openssl_encrypt($data, self::$cipher, $key, OPENSSL_RAW_DATA, $iv);
            
            if ($encrypted === false) {
                throw new \Exception("Error al cifrar los datos");
            }
            
            // Combinar IV y datos cifrados, luego codificar en base64
            $encryptedData = base64_encode($iv . $encrypted);
            
            return $encryptedData;
        } catch (\Exception $e) {
            throw new \Exception("Error en el cifrado: " . $e->getMessage());
        }
    }
    
    /**
     * Descifrar un valor
     */
    public static function decrypt($encryptedData) {
        if (empty($encryptedData)) {
            return $encryptedData;
        }
        
        try {
            $key = self::getEncryptionKey();
            
            // Decodificar de base64
            $data = base64_decode($encryptedData, true);
            
            if ($data === false) {
                // Si no es base64 válido, podría ser texto sin cifrar (para migración)
                return $encryptedData;
            }
            
            // Extraer IV y datos cifrados
            $ivLength = openssl_cipher_iv_length(self::$cipher);
            $iv = substr($data, 0, $ivLength);
            $encrypted = substr($data, $ivLength);
            
            $decrypted = openssl_decrypt($encrypted, self::$cipher, $key, OPENSSL_RAW_DATA, $iv);
            
            if ($decrypted === false) {
                // Si falla el descifrado, podría ser texto sin cifrar
                return $encryptedData;
            }
            
            return $decrypted;
        } catch (\Exception $e) {
            // Si hay error, retornar el valor original (podría ser texto sin cifrar)
            return $encryptedData;
        }
    }
    
    /**
     * Cifrar RFC
     */
    public static function encryptRfc($rfc) {
        return self::encrypt(strtoupper(trim($rfc)));
    }
    
    /**
     * Descifrar RFC
     */
    public static function decryptRfc($encryptedRfc) {
        return self::decrypt($encryptedRfc);
    }
    
    /**
     * Cifrar CURP
     */
    public static function encryptCurp($curp) {
        return self::encrypt(strtoupper(trim($curp)));
    }
    
    /**
     * Descifrar CURP
     */
    public static function decryptCurp($encryptedCurp) {
        return self::decrypt($encryptedCurp);
    }
    
    /**
     * Buscar por RFC cifrado (para comparaciones)
     */
    public static function searchByRfc($db, $rfc) {
        // Cifrar el RFC a buscar
        $encryptedRfc = self::encryptRfc($rfc);
        
        // Buscar en la base de datos
        $stmt = $db->prepare("SELECT id_registro FROM registro WHERE rfc = ?");
        $stmt->execute([$encryptedRfc]);
        
        return $stmt->fetch();
    }
    
    /**
     * Buscar por CURP cifrado (para comparaciones)
     */
    public static function searchByCurp($db, $curp) {
        // Cifrar el CURP a buscar
        $encryptedCurp = self::encryptCurp($curp);
        
        // Buscar en la base de datos
        $stmt = $db->prepare("SELECT id_registro FROM registro WHERE curp = ?");
        $stmt->execute([$encryptedCurp]);
        
        return $stmt->fetch();
    }
}

