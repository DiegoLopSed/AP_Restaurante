<?php
/**
 * Utilidades ESC/POS para impresoras térmicas en red (puerto crudo, habitualmente 9100).
 * El envío se hace desde el servidor PHP hacia la IP de la impresora.
 */

namespace App\Services;

class ImpresoraTermicaEscPos {
    /**
     * Conecta por TCP y escribe bytes en crudo (RAW / JetDirect).
     *
     * @throws \Exception si no hay conexión o no se escribe todo el buffer
     */
    public static function enviarBytes(string $host, int $port, float $timeoutSec, string $payload): void {
        if ($host === '') {
            throw new \Exception('Host de impresora no configurado');
        }
        if ($port < 1 || $port > 65535) {
            throw new \Exception('Puerto de impresora no válido');
        }

        $errno = 0;
        $errstr = '';
        $fp = @fsockopen($host, $port, $errno, $errstr, $timeoutSec);
        if ($fp === false) {
            throw new \Exception("No se pudo conectar a la impresora en {$host}:{$port}: {$errstr} (código {$errno})");
        }

        stream_set_timeout($fp, (int)max(1, ceil($timeoutSec)));
        $len = strlen($payload);
        $written = @fwrite($fp, $payload);
        fclose($fp);

        if ($written === false || $written < $len) {
            throw new \Exception('No se envió el trabajo completo a la impresora');
        }
    }

    /**
     * Normaliza texto UTF-8 a bytes compatibles con mayoría de térmicas (CP850/CUPS).
     */
    public static function textoParaImpresora(string $utf8): string {
        if ($utf8 === '') {
            return '';
        }
        $cp850 = @iconv('UTF-8', 'CP850//TRANSLIT//IGNORE', $utf8);
        if ($cp850 !== false && $cp850 !== '') {
            return $cp850;
        }
        $w1252 = @iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $utf8);
        if ($w1252 !== false) {
            return $w1252;
        }
        return preg_replace('/[^\x09\x0A\x0D\x20-\x7E]/', '?', $utf8);
    }

    /**
     * Arma el ticket de comanda en ESC/POS (modo texto).
     *
     * @param array $pedido  Fila pedido (id_pedido, nombre_cliente, total, metodo_pago_nombre?, id_metodo_pago?)
     * @param array $lineas  Lista de líneas con cantidad, nombre_producto, subtotal
     */
    public static function construirComanda(
        array $pedido,
        array $lineas,
        string $nombreMesero,
        string $nombreLocal,
        int $anchoCaracteres = 42
    ): string {
        $w = max(32, min(48, $anchoCaracteres));
        $local = self::textoParaImpresora($nombreLocal !== '' ? $nombreLocal : 'Restaurante');
        $mesero = self::textoParaImpresora(trim($nombreMesero));
        $cliente = self::textoParaImpresora((string)($pedido['nombre_cliente'] ?? ''));
        $idPedido = (int)($pedido['id_pedido'] ?? 0);
        $total = (float)($pedido['total'] ?? 0);

        $pago = trim((string)($pedido['metodo_pago_nombre'] ?? ''));
        if ($pago === '') {
            $pago = ((int)($pedido['id_metodo_pago'] ?? 1) === 2) ? 'Tarjeta' : 'Efectivo';
        }
        $pago = self::textoParaImpresora($pago);

        $buf = '';
        $buf .= "\x1B\x40"; // Init
        $buf .= "\x1B\x61\x01"; // Centrar
        $buf .= $local . "\n";
        $buf .= str_repeat('-', $w) . "\n";
        $buf .= self::textoParaImpresora('COMANDA COCINA / BAR') . "\n";
        $buf .= str_repeat('-', $w) . "\n";
        $buf .= "\x1B\x61\x00"; // Izquierda

        $buf .= 'Pedido #' . $idPedido . "\n";
        $buf .= $cliente !== '' ? ($cliente . "\n") : '';
        $buf .= $mesero !== '' ? ('Mesero: ' . $mesero . "\n") : '';
        $buf .= 'Pago: ' . $pago . "\n";
        $buf .= date('d/m/Y H:i') . "\n";
        $buf .= str_repeat('-', $w) . "\n";

        if (count($lineas) === 0) {
            $buf .= "(Sin productos en comanda)\n";
        } else {
            foreach ($lineas as $l) {
                $cant = (int)($l['cantidad'] ?? 0);
                $nombre = self::textoParaImpresora((string)($l['nombre_producto'] ?? ''));
                $sub = (float)($l['subtotal'] ?? 0);
                $precio = '$' . number_format($sub, 2, '.', '');
                $buf .= self::formatearLineaProducto($cant, $nombre, $precio, $w);
            }
        }

        $buf .= str_repeat('-', $w) . "\n";
        $totalStr = '$' . number_format($total, 2, '.', '');
        $buf .= str_pad('TOTAL', $w - strlen($totalStr), ' ', STR_PAD_LEFT) . $totalStr . "\n";
        $buf .= "\n\n\n";
        // Corte parcial (común en Epson/compatibles). Si tu modelo no corta, ignora o quita esta línea.
        $buf .= "\x1D\x56\x00";

        return $buf;
    }

    private static function formatearLineaProducto(int $cant, string $nombreEscPos, string $precioStr, int $w): string {
        $prefix = $cant . 'x ';
        $full = $prefix . $nombreEscPos;
        $room = $w - strlen($precioStr);
        if ($room < 12) {
            $room = $w - strlen($precioStr);
        }
        $out = '';
        if (strlen($full) <= $room) {
            $out .= str_pad($full, $room, ' ', STR_PAD_RIGHT) . $precioStr . "\n";
            return $out;
        }
        $firstLen = min(strlen($full), $w);
        $out .= substr($full, 0, $firstLen) . "\n";
        $rest = substr($full, $firstLen);
        while ($rest !== '' && strlen($rest) > $room) {
            $out .= substr($rest, 0, $w) . "\n";
            $rest = substr($rest, $w);
        }
        if ($rest !== '') {
            $out .= str_pad($rest, $room, ' ', STR_PAD_RIGHT) . $precioStr . "\n";
        } else {
            $out .= str_pad('', $room, ' ', STR_PAD_RIGHT) . $precioStr . "\n";
        }
        return $out;
    }
}
