-- Crear base de datos
CREATE DATABASE IF NOT EXISTS restaurante_db;
USE restaurante_db;

-- =====================================================
-- TABLAS PRINCIPALES 
-- =====================================================

-- Tabla: Categoría
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Insumo
CREATE TABLE insumo (
    id_insumo INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre TEXT NOT NULL,
    stock INT DEFAULT 0,
    fecha_ultimo_pedido DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Lista
CREATE TABLE lista (
    id_lista INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Ingrediente (implícita en las relaciones)
-- Se crea para manejar la relación N:M con Producto
CREATE TABLE ingrediente (
    id_ingrediente INT AUTO_INCREMENT PRIMARY KEY,
    id_insumo INT NOT NULL UNIQUE, -- Relación 1:1 con Insumo
    nombre TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_insumo) REFERENCES insumo(id_insumo) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_lista INT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    estatus BOOLEAN DEFAULT TRUE,
    imagen BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_lista) REFERENCES lista(id_lista) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Método de pago
CREATE TABLE metodo_pago (
    id_metodo_pago INT AUTO_INCREMENT PRIMARY KEY,
    nombre_metodo TEXT NOT NULL,
    datos_emisor TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Pedido
CREATE TABLE pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_metodo_pago INT NOT NULL,
    status BOOLEAN DEFAULT FALSE,
    nombre_cliente TEXT NOT NULL,
    nombre_mesero TEXT,
    total DECIMAL(10, 2) DEFAULT 0.00,
    factura DECIMAL(10, 2) DEFAULT 0.00,
    fecha DATETIME NOT NULL,
    hora_entrada DATETIME NOT NULL,
    hora_salida DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_metodo_pago) REFERENCES metodo_pago(id_metodo_pago) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Factura
CREATE TABLE factura (
    id_factura INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    emisor TEXT NOT NULL,
    tipo_comprobante BOOLEAN DEFAULT FALSE,
    moneda DECIMAL(10, 2) NOT NULL,
    folio_fiscal TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLAS INTERMEDIAS (Relaciones N:M)
-- =====================================================

-- Tabla intermedia: Producto - Ingrediente (N:M)
CREATE TABLE producto_ingrediente (
    id_producto INT NOT NULL,
    id_ingrediente INT NOT NULL,
    cantidad DECIMAL(10, 2) DEFAULT 1.00,
    unidad_medida VARCHAR(50),
    PRIMARY KEY (id_producto, id_ingrediente),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_ingrediente) REFERENCES ingrediente(id_ingrediente) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla intermedia: Pedido - Producto (N:M)
CREATE TABLE pedido_producto (
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_pedido, id_producto),
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla intermedia: Lista - Producto (N:M)
CREATE TABLE lista_producto (
    id_lista INT NOT NULL,
    id_producto INT NOT NULL,
    PRIMARY KEY (id_lista, id_producto),
    FOREIGN KEY (id_lista) REFERENCES lista(id_lista) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla intermedia: Lista - Insumo (N:M)
CREATE TABLE lista_insumo (
    id_lista INT NOT NULL,
    id_insumo INT NOT NULL,
    cantidad DECIMAL(10, 2) DEFAULT 1.00,
    unidad_medida VARCHAR(50),
    PRIMARY KEY (id_lista, id_insumo),
    FOREIGN KEY (id_lista) REFERENCES lista(id_lista) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_insumo) REFERENCES insumo(id_insumo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla intermedia: Factura - Producto (N:M)
CREATE TABLE factura_producto (
    id_factura INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_factura, id_producto),
    FOREIGN KEY (id_factura) REFERENCES factura(id_factura) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_insumo_categoria ON insumo(id_categoria);
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_lista ON productos(id_lista);
CREATE INDEX idx_pedido_metodo_pago ON pedido(id_metodo_pago);
CREATE INDEX idx_pedido_fecha ON pedido(fecha);
CREATE INDEX idx_factura_pedido ON factura(id_pedido);
CREATE INDEX idx_ingrediente_insumo ON ingrediente(id_insumo);

-- Insertar categorías de ejemplo
INSERT INTO categoria (nombre, descripcion) VALUES
('Bebidas', 'Bebidas frías y calientes'),
('Platos principales', 'Platos principales del menú'),
('Postres', 'Postres y dulces'),
('Aperitivos', 'Aperitivos y entradas');

-- Insertar métodos de pago de ejemplo
INSERT INTO metodo_pago (nombre_metodo, datos_emisor) VALUES
('Efectivo', 'Pago en efectivo'),
('Tarjeta de crédito', 'Terminal punto de venta'),
('Tarjeta de débito', 'Terminal punto de venta'),
('Transferencia bancaria', 'Banco emisor');

