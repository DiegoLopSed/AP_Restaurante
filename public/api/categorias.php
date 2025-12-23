<?php
/**
 * API REST para categorías
 * Endpoint público que delega al controlador
 */

require_once __DIR__ . '/../../backend/src/Controllers/CategoriaController.php';

use App\Controllers\CategoriaController;

$controller = new CategoriaController();
$controller->handleRequest();

