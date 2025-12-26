<?php
// Script de prueba para diagnosticar errores
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "<h2>Diagnóstico de rutas:</h2>";
echo "Directorio actual: " . __DIR__ . "<br>";
echo "Ruta al controlador: " . __DIR__ . '/../../backend/src/Controllers/CategoriaController.php' . "<br>";

echo "<h2>Verificando archivos:</h2>";
$controllerPath = __DIR__ . '/../../backend/src/Controllers/CategoriaController.php';
echo "¿Existe el controlador? " . (file_exists($controllerPath) ? 'SÍ' : 'NO') . "<br>";

$dbPath = __DIR__ . '/../../backend/config/database.php';
echo "¿Existe database.php? " . (file_exists($dbPath) ? 'SÍ' : 'NO') . "<br>";

$envPath = __DIR__ . '/../../.env';
echo "¿Existe .env? " . (file_exists($envPath) ? 'SÍ' : 'NO') . "<br>";

echo "<h2>Probando carga de controlador:</h2>";
try {
    require_once __DIR__ . '/../../backend/src/Controllers/CategoriaController.php';
    echo "✓ Controlador cargado correctamente<br>";
} catch (Throwable $e) {
    echo "✗ Error al cargar controlador: " . $e->getMessage() . "<br>";
    echo "Archivo: " . $e->getFile() . "<br>";
    echo "Línea: " . $e->getLine() . "<br>";
}

echo "<h2>Probando conexión a BD:</h2>";
try {
    require_once __DIR__ . '/../../backend/config/database.php';
    $db = getDB();
    echo "✓ Conexión a BD exitosa<br>";
} catch (Throwable $e) {
    echo "✗ Error en BD: " . $e->getMessage() . "<br>";
    echo "Archivo: " . $e->getFile() . "<br>";
    echo "Línea: " . $e->getLine() . "<br>";
}

