<?php
/**
 * API REST para gestión de insumos
 * Endpoint público que delega al controlador
 */

require_once __DIR__ . '/../../backend/src/Controllers/InsumoController.php';

use App\Controllers\InsumoController;

$controller = new InsumoController();
$controller->handleRequest();

