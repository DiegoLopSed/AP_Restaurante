<?php
/**
 * Página de inicio - Estadísticas del Sistema
 * Sistema de Gestión de Restaurante
 */

require_once 'config/database.php';

// Obtener conexión a la base de datos
$db = getDB();

// Obtener estadísticas de todas las tablas
function obtenerEstadisticas($db) {
    $tablas = [
        'categoria',
        'insumo',
        'lista',
        'ingrediente',
        'productos',
        'metodo_pago',
        'pedido',
        'factura',
        'producto_ingrediente',
        'pedido_producto',
        'lista_producto',
        'lista_insumo',
        'factura_producto'
    ];
    
    $estadisticas = [];
    
    foreach ($tablas as $tabla) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as total FROM `$tabla`");
            $resultado = $stmt->fetch();
            $estadisticas[$tabla] = $resultado['total'];
        } catch (PDOException $e) {
            $estadisticas[$tabla] = 'Error';
        }
    }
    
    return $estadisticas;
}

// Obtener estadísticas adicionales
function obtenerEstadisticasAdicionales($db) {
    $stats = [];
    
    try {
        // Total de pedidos pendientes
        $stmt = $db->query("SELECT COUNT(*) as total FROM pedido WHERE status = 0");
        $stats['pedidos_pendientes'] = $stmt->fetch()['total'];
        
        // Total de pedidos completados
        $stmt = $db->query("SELECT COUNT(*) as total FROM pedido WHERE status = 1");
        $stats['pedidos_completados'] = $stmt->fetch()['total'];
        
        // Total de productos activos
        $stmt = $db->query("SELECT COUNT(*) as total FROM productos WHERE estatus = 1");
        $stats['productos_activos'] = $stmt->fetch()['total'];
        
        // Total de productos inactivos
        $stmt = $db->query("SELECT COUNT(*) as total FROM productos WHERE estatus = 0");
        $stats['productos_inactivos'] = $stmt->fetch()['total'];
        
        // Total de insumos en stock
        $stmt = $db->query("SELECT COUNT(*) as total FROM insumo WHERE stock = 1");
        $stats['insumos_en_stock'] = $stmt->fetch()['total'];
        
        // Total de insumos sin stock
        $stmt = $db->query("SELECT COUNT(*) as total FROM insumo WHERE stock = 0");
        $stats['insumos_sin_stock'] = $stmt->fetch()['total'];
        
        // Suma total de facturas
        $stmt = $db->query("SELECT SUM(moneda) as total FROM factura");
        $resultado = $stmt->fetch();
        $stats['total_facturado'] = $resultado['total'] ?? 0;
        
        // Suma total de pedidos
        $stmt = $db->query("SELECT SUM(total) as total FROM pedido");
        $resultado = $stmt->fetch();
        $stats['total_pedidos'] = $resultado['total'] ?? 0;
        
        // Promedio de pedidos
        $stmt = $db->query("SELECT AVG(total) as promedio FROM pedido WHERE total > 0");
        $resultado = $stmt->fetch();
        $stats['promedio_pedidos'] = $resultado['promedio'] ?? 0;
        
    } catch (PDOException $e) {
        $stats['error'] = $e->getMessage();
    }
    
    return $stats;
}

$estadisticas = obtenerEstadisticas($db);
$estadisticasAdicionales = obtenerEstadisticasAdicionales($db);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estadísticas - Sistema de Gestión de Restaurante</title>
    <link rel="stylesheet" href="css/styles.css">
    <style>
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #4CAF50;
        }
        .stat-card h3 {
            margin-top: 0;
            color: #333;
            font-size: 1.2em;
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #4CAF50;
            margin: 10px 0;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        .table-stats {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .table-stats th {
            background: #4CAF50;
            color: white;
            padding: 12px;
            text-align: left;
        }
        .table-stats td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
        }
        .table-stats tr:hover {
            background: #f5f5f5;
        }
        .stat-section {
            margin: 30px 0;
        }
        .stat-section h2 {
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        .error-message {
            background: #f44336;
            color: white;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .success-message {
            background: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Sistema de Gestión de Restaurante</h1>
            <nav>
                <ul>
                    <li><a href="index.html">Inicio</a></li>
                    <li><a href="index.php" class="active">Estadísticas</a></li>
                    <li><a href="pages/insumos.html">Insumos</a></li>
                    <li><a href="pages/empleados.html">Empleados</a></li>
                    <li><a href="pages/inventario.html">Inventario</a></li>
                    <li><a href="pages/aboutus.html">Sobre Nosotros</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="container">
        <section class="welcome">
            <h2>Estadísticas del Sistema</h2>
            <p>Resumen de datos de la base de datos del restaurante</p>
        </section>

        <?php if (isset($estadisticasAdicionales['error'])): ?>
            <div class="error-message">
                Error al obtener estadísticas: <?php echo htmlspecialchars($estadisticasAdicionales['error']); ?>
            </div>
        <?php else: ?>
            <div class="success-message">
                ✓ Conexión a la base de datos establecida correctamente
            </div>
        <?php endif; ?>

        <!-- Estadísticas Generales -->
        <section class="stat-section">
            <h2>Resumen General</h2>
            <div class="stats-container">
                <div class="stat-card">
                    <h3>Pedidos</h3>
                    <div class="stat-number"><?php echo $estadisticas['pedido']; ?></div>
                    <div class="stat-label">Total de pedidos registrados</div>
                    <div style="margin-top: 10px; font-size: 0.9em;">
                        <span style="color: #ff9800;">Pendientes: <?php echo $estadisticasAdicionales['pedidos_pendientes']; ?></span><br>
                        <span style="color: #4CAF50;">Completados: <?php echo $estadisticasAdicionales['pedidos_completados']; ?></span>
                    </div>
                </div>

                <div class="stat-card">
                    <h3>Productos</h3>
                    <div class="stat-number"><?php echo $estadisticas['productos']; ?></div>
                    <div class="stat-label">Total de productos</div>
                    <div style="margin-top: 10px; font-size: 0.9em;">
                        <span style="color: #4CAF50;">Activos: <?php echo $estadisticasAdicionales['productos_activos']; ?></span><br>
                        <span style="color: #f44336;">Inactivos: <?php echo $estadisticasAdicionales['productos_inactivos']; ?></span>
                    </div>
                </div>

                <div class="stat-card">
                    <h3>Facturas</h3>
                    <div class="stat-number"><?php echo $estadisticas['factura']; ?></div>
                    <div class="stat-label">Total de facturas emitidas</div>
                    <div style="margin-top: 10px; font-size: 0.9em;">
                        <span style="color: #2196F3;">Total facturado: $<?php echo number_format($estadisticasAdicionales['total_facturado'], 2); ?></span>
                    </div>
                </div>

                <div class="stat-card">
                    <h3>Insumos</h3>
                    <div class="stat-number"><?php echo $estadisticas['insumo']; ?></div>
                    <div class="stat-label">Total de insumos</div>
                    <div style="margin-top: 10px; font-size: 0.9em;">
                        <span style="color: #4CAF50;">En stock: <?php echo $estadisticasAdicionales['insumos_en_stock']; ?></span><br>
                        <span style="color: #f44336;">Sin stock: <?php echo $estadisticasAdicionales['insumos_sin_stock']; ?></span>
                    </div>
                </div>

                <div class="stat-card">
                    <h3>Ingredientes</h3>
                    <div class="stat-number"><?php echo $estadisticas['ingrediente']; ?></div>
                    <div class="stat-label">Total de ingredientes</div>
                </div>

                <div class="stat-card">
                    <h3>Categorías</h3>
                    <div class="stat-number"><?php echo $estadisticas['categoria']; ?></div>
                    <div class="stat-label">Categorías disponibles</div>
                </div>
            </div>
        </section>

        <!-- Estadísticas Financieras -->
        <section class="stat-section">
            <h2>Estadísticas Financieras</h2>
            <div class="stats-container">
                <div class="stat-card" style="border-left-color: #2196F3;">
                    <h3>Total Facturado</h3>
                    <div class="stat-number" style="color: #2196F3;">$<?php echo number_format($estadisticasAdicionales['total_facturado'], 2); ?></div>
                    <div class="stat-label">Suma total de todas las facturas</div>
                </div>

                <div class="stat-card" style="border-left-color: #2196F3;">
                    <h3>Total Pedidos</h3>
                    <div class="stat-number" style="color: #2196F3;">$<?php echo number_format($estadisticasAdicionales['total_pedidos'], 2); ?></div>
                    <div class="stat-label">Suma total de todos los pedidos</div>
                </div>

                <div class="stat-card" style="border-left-color: #2196F3;">
                    <h3>Promedio por Pedido</h3>
                    <div class="stat-number" style="color: #2196F3;">$<?php echo number_format($estadisticasAdicionales['promedio_pedidos'], 2); ?></div>
                    <div class="stat-label">Promedio del monto de los pedidos</div>
                </div>
            </div>
        </section>

        <!-- Estadísticas Detalladas por Tabla -->
        <section class="stat-section">
            <h2>Estadísticas por Tabla</h2>
            <table class="table-stats">
                <thead>
                    <tr>
                        <th>Tabla</th>
                        <th>Total de Registros</th>
                    </tr>
                </thead>
                <tbody>
                    <?php 
                    $tablasOrdenadas = [
                        'categoria' => 'Categorías',
                        'insumo' => 'Insumos',
                        'ingrediente' => 'Ingredientes',
                        'productos' => 'Productos',
                        'lista' => 'Listas',
                        'metodo_pago' => 'Métodos de Pago',
                        'pedido' => 'Pedidos',
                        'factura' => 'Facturas',
                        'producto_ingrediente' => 'Relación Producto-Ingrediente',
                        'pedido_producto' => 'Relación Pedido-Producto',
                        'lista_producto' => 'Relación Lista-Producto',
                        'lista_insumo' => 'Relación Lista-Insumo',
                        'factura_producto' => 'Relación Factura-Producto'
                    ];
                    
                    foreach ($tablasOrdenadas as $tabla => $nombre): 
                    ?>
                        <tr>
                            <td><strong><?php echo htmlspecialchars($nombre); ?></strong></td>
                            <td><?php echo is_numeric($estadisticas[$tabla]) ? number_format($estadisticas[$tabla]) : $estadisticas[$tabla]; ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 Sistema de Gestión de Restaurante. Todos los derechos reservados.</p>
        </div>
    </footer>

</body>
</html>

