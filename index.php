<?php
/**
 * Punto de entrada principal
 * Redirige automáticamente a la carpeta public/
 */

// Si existe el build de React, redirigir ahí; si no, mantener el sitio estático
if (is_file(__DIR__ . '/public/app/index.html')) {
    header('Location: public/app/index.html');
    exit;
}

header('Location: public/index.html');
exit;

