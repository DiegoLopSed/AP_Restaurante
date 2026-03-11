-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-03-2026 a las 10:48:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `restaurante`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'Lácteos', 'Productos derivados de la leche', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(2, 'Carnes', 'Carnes rojas y blancas', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(3, 'Verduras', 'Vegetales frescos', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(4, 'Bebidas', 'Bebidas frías y calientes', '2026-03-11 08:47:24', '2026-03-11 08:47:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes_frecuentes`
--

CREATE TABLE `clientes_frecuentes` (
  `id_cliente` int(11) NOT NULL,
  `codigo_cliente` varchar(20) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `direccion_entrega` text NOT NULL,
  `bonos` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `clientes_frecuentes`
--

INSERT INTO `clientes_frecuentes` (`id_cliente`, `codigo_cliente`, `nombre`, `correo`, `telefono`, `pass`, `direccion_entrega`, `bonos`, `created_at`, `updated_at`) VALUES
(1, 'CLI-NVEBCC', 'Diego Lopez Sedeño', 'dieguito160703@gmail.com', '522212354124', '$2y$10$1o6KY9W8ZG568BgMd4dGSeMVaWcNacd3XCc2GXL/HSS/pLPQGeD5K', 'Calle Querétaro 10138 Col Popular Emiliano Zapata', 0, '2026-03-11 09:33:57', '2026-03-11 09:33:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaboradores`
--

CREATE TABLE `colaboradores` (
  `id_colaborador` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `rfc` varchar(20) NOT NULL,
  `curp` varchar(18) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `posicion` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `colaboradores`
--

INSERT INTO `colaboradores` (`id_colaborador`, `nombre`, `apellido`, `rfc`, `curp`, `correo`, `telefono`, `pass`, `posicion`, `created_at`, `updated_at`) VALUES
(1, 'Diego', 'Lopez Sedeño', 'LOSD030716TI0', 'LOSD030716HPLPDGB2', 'dieguito123@gmail.com', '2212354124', '$2y$10$wFKc5y5Gosd7h5/gQ4j25uermG3HC74FT82kdWvELD38Gj7mKCPvS', 'Gerente', '2026-01-28 06:18:05', '2026-02-16 04:52:49'),
(2, 'Laura Rubi', 'Franco Garcia', 'TEMP567890123', 'TEMP030716HPLPDGB3', 'francogarciarubi3@gmail.com', '2222022202', '$2y$10$tPTdprxD5NdOyweKqPMdq./1BegvXGEvO.IAqfraTg078fH87Ov8i', 'Mesero', '2026-03-11 08:41:20', '2026-03-11 08:41:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id_factura` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `emisor` text NOT NULL,
  `tipo_comprobante` tinyint(1) DEFAULT 0,
  `moneda` decimal(10,2) NOT NULL,
  `folio_fiscal` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura_producto`
--

CREATE TABLE `factura_producto` (
  `id_factura` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingrediente`
--

CREATE TABLE `ingrediente` (
  `id_ingrediente` int(11) NOT NULL,
  `id_insumo` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumo`
--

CREATE TABLE `insumo` (
  `id_insumo` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `stock` int(11) DEFAULT 0,
  `fecha_ultimo_pedido` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `insumo`
--

INSERT INTO `insumo` (`id_insumo`, `id_categoria`, `nombre`, `stock`, `fecha_ultimo_pedido`, `created_at`, `updated_at`) VALUES
(1, 1, 'Leche entera 1L', 50, '2026-03-01', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(2, 1, 'Queso manchego 1kg', 15, '2026-02-25', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(3, 1, 'Crema ácida 1L', 20, '2026-03-05', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(4, 2, 'Pechuga de pollo 1kg', 30, '2026-03-03', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(5, 2, 'Carne de res molida 1kg', 18, '2026-03-02', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(6, 2, 'Tocino ahumado 1kg', 10, '2026-02-28', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(7, 3, 'Tomate saladet 1kg', 25, '2026-03-04', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(8, 3, 'Cebolla blanca 1kg', 22, '2026-03-04', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(9, 3, 'Lechuga romana pieza', 12, '2026-03-01', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(10, 3, 'Cilantro manojo', 30, '2026-03-06', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(11, 4, 'Refresco cola 355ml', 60, '2026-03-02', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(12, 4, 'Agua mineral 600ml', 80, '2026-03-03', '2026-03-11 08:47:24', '2026-03-11 08:47:24'),
(13, 4, 'Café molido 1kg', 8, '2026-02-27', '2026-03-11 08:47:24', '2026-03-11 08:47:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lista`
--

CREATE TABLE `lista` (
  `id_lista` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lista_insumo`
--

CREATE TABLE `lista_insumo` (
  `id_lista` int(11) NOT NULL,
  `id_insumo` int(11) NOT NULL,
  `cantidad` decimal(10,2) DEFAULT 1.00,
  `unidad_medida` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lista_producto`
--

CREATE TABLE `lista_producto` (
  `id_lista` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodo_pago`
--

CREATE TABLE `metodo_pago` (
  `id_metodo_pago` int(11) NOT NULL,
  `nombre_metodo` text NOT NULL,
  `datos_emisor` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `id_metodo_pago` int(11) NOT NULL,
  `status` tinyint(1) DEFAULT 0,
  `nombre_cliente` text NOT NULL,
  `nombre_mesero` text DEFAULT NULL,
  `total` decimal(10,2) DEFAULT 0.00,
  `factura` decimal(10,2) DEFAULT 0.00,
  `fecha` datetime NOT NULL,
  `hora_entrada` datetime NOT NULL,
  `hora_salida` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_producto`
--

CREATE TABLE `pedido_producto` (
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_lista` int(11) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `estatus` tinyint(1) DEFAULT 1,
  `imagen` blob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_ingrediente`
--

CREATE TABLE `producto_ingrediente` (
  `id_producto` int(11) NOT NULL,
  `id_ingrediente` int(11) NOT NULL,
  `cantidad` decimal(10,2) DEFAULT 1.00,
  `unidad_medida` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `clientes_frecuentes`
--
ALTER TABLE `clientes_frecuentes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `codigo_cliente` (`codigo_cliente`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `telefono` (`telefono`),
  ADD KEY `idx_clientes_codigo` (`codigo_cliente`),
  ADD KEY `idx_clientes_correo` (`correo`),
  ADD KEY `idx_clientes_telefono` (`telefono`);

--
-- Indices de la tabla `colaboradores`
--
ALTER TABLE `colaboradores`
  ADD PRIMARY KEY (`id_colaborador`),
  ADD UNIQUE KEY `rfc` (`rfc`),
  ADD UNIQUE KEY `curp` (`curp`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id_factura`),
  ADD KEY `idx_factura_pedido` (`id_pedido`);

--
-- Indices de la tabla `factura_producto`
--
ALTER TABLE `factura_producto`
  ADD PRIMARY KEY (`id_factura`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `ingrediente`
--
ALTER TABLE `ingrediente`
  ADD PRIMARY KEY (`id_ingrediente`),
  ADD UNIQUE KEY `id_insumo` (`id_insumo`),
  ADD KEY `idx_ingrediente_insumo` (`id_insumo`);

--
-- Indices de la tabla `insumo`
--
ALTER TABLE `insumo`
  ADD PRIMARY KEY (`id_insumo`),
  ADD KEY `idx_insumo_categoria` (`id_categoria`);

--
-- Indices de la tabla `lista`
--
ALTER TABLE `lista`
  ADD PRIMARY KEY (`id_lista`);

--
-- Indices de la tabla `lista_insumo`
--
ALTER TABLE `lista_insumo`
  ADD PRIMARY KEY (`id_lista`,`id_insumo`),
  ADD KEY `id_insumo` (`id_insumo`);

--
-- Indices de la tabla `lista_producto`
--
ALTER TABLE `lista_producto`
  ADD PRIMARY KEY (`id_lista`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `metodo_pago`
--
ALTER TABLE `metodo_pago`
  ADD PRIMARY KEY (`id_metodo_pago`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `idx_pedido_metodo_pago` (`id_metodo_pago`),
  ADD KEY `idx_pedido_fecha` (`fecha`);

--
-- Indices de la tabla `pedido_producto`
--
ALTER TABLE `pedido_producto`
  ADD PRIMARY KEY (`id_pedido`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `idx_productos_categoria` (`id_categoria`),
  ADD KEY `idx_productos_lista` (`id_lista`);

--
-- Indices de la tabla `producto_ingrediente`
--
ALTER TABLE `producto_ingrediente`
  ADD PRIMARY KEY (`id_producto`,`id_ingrediente`),
  ADD KEY `id_ingrediente` (`id_ingrediente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `clientes_frecuentes`
--
ALTER TABLE `clientes_frecuentes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `colaboradores`
--
ALTER TABLE `colaboradores`
  MODIFY `id_colaborador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `id_factura` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ingrediente`
--
ALTER TABLE `ingrediente`
  MODIFY `id_ingrediente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `insumo`
--
ALTER TABLE `insumo`
  MODIFY `id_insumo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `lista`
--
ALTER TABLE `lista`
  MODIFY `id_lista` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metodo_pago`
--
ALTER TABLE `metodo_pago`
  MODIFY `id_metodo_pago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `factura_producto`
--
ALTER TABLE `factura_producto`
  ADD CONSTRAINT `factura_producto_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `factura_producto_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ingrediente`
--
ALTER TABLE `ingrediente`
  ADD CONSTRAINT `ingrediente_ibfk_1` FOREIGN KEY (`id_insumo`) REFERENCES `insumo` (`id_insumo`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `insumo`
--
ALTER TABLE `insumo`
  ADD CONSTRAINT `insumo_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `lista_insumo`
--
ALTER TABLE `lista_insumo`
  ADD CONSTRAINT `lista_insumo_ibfk_1` FOREIGN KEY (`id_lista`) REFERENCES `lista` (`id_lista`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lista_insumo_ibfk_2` FOREIGN KEY (`id_insumo`) REFERENCES `insumo` (`id_insumo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lista_producto`
--
ALTER TABLE `lista_producto`
  ADD CONSTRAINT `lista_producto_ibfk_1` FOREIGN KEY (`id_lista`) REFERENCES `lista` (`id_lista`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lista_producto_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodo_pago` (`id_metodo_pago`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `pedido_producto`
--
ALTER TABLE `pedido_producto`
  ADD CONSTRAINT `pedido_producto_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pedido_producto_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON UPDATE CASCADE,
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`id_lista`) REFERENCES `lista` (`id_lista`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto_ingrediente`
--
ALTER TABLE `producto_ingrediente`
  ADD CONSTRAINT `producto_ingrediente_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `producto_ingrediente_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingrediente` (`id_ingrediente`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
