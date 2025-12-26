-- Script de migración: Cambiar campo stock de BOOLEAN a INT
-- Ejecutar este script si ya tienes datos en la base de datos

USE restaurante_db;

-- Paso 1: Modificar la columna stock de BOOLEAN a INT
-- Si hay datos existentes, convertir TRUE a 1 y FALSE a 0
ALTER TABLE insumo 
MODIFY COLUMN stock INT DEFAULT 0;

-- Paso 2: Actualizar valores existentes (si los hay)
-- Convertir TRUE (1) a cantidad 1, FALSE (0) a cantidad 0
UPDATE insumo 
SET stock = CASE 
    WHEN stock = 1 THEN 1 
    WHEN stock = 0 THEN 0 
    ELSE 0 
END;

-- Verificar los cambios
SELECT id_insumo, nombre, stock FROM insumo LIMIT 10;

