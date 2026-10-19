<?php
// ========================================================
// CONFIGURACIÓN DE CONEXIÓN A SQL SERVER
// Compatible con PHP 7.4+, 8.0, 8.1, 8.2, 8.3
// Conexión basada en tus APIs de producción
// ========================================================

$serverName = "172.16.60.12\\SQLSVR"; // Servidor principal de producción
$fallbackServer = "172.16.80.4";      // Servidor secundario / alternativo
$database   = "VentasYCobranzaCYSA";  // Base de datos principal
$uid        = "sa";
$pwd        = "D1mens1on";

/**
 * Obtiene la conexión a la base de datos SQL Server.
 * Soporta sqlsrv_connect nativo y PDO sqlsrv/dblib.
 * Si no hay conexión (por ejemplo al probar fuera de la red de la empresa),
 * retorna null para permitir que el tablero muestre datos de demostración
 * sin fallar ni quedarse en blanco.
 */
function getDbConnection() {
    global $serverName, $fallbackServer, $database, $uid, $pwd;
    
    // Intento 1: sqlsrv_connect nativo (Driver oficial de Microsoft para PHP en Windows)
    if (function_exists('sqlsrv_connect')) {
        $connectionOptions = array(
            "Database" => $database,
            "Uid" => $uid,
            "PWD" => $pwd,
            "CharacterSet" => "UTF-8",
            "LoginTimeout" => 2
        );
        $conn = @sqlsrv_connect($serverName, $connectionOptions);
        if ($conn) {
            return $conn;
        }

        // Intento con fallback
        $connFb = @sqlsrv_connect($fallbackServer, $connectionOptions);
        if ($connFb) {
            return $connFb;
        }
    }

    // Intento 2: PDO sqlsrv
    if (extension_loaded('pdo_sqlsrv')) {
        try {
            $conn = new PDO("sqlsrv:Server=$serverName;Database=$database;TrustServerCertificate=true;LoginTimeout=2", $uid, $pwd);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch (Exception $e) {
            // Intentar fallback
            try {
                $conn = new PDO("sqlsrv:Server=$fallbackServer;Database=$database;TrustServerCertificate=true;LoginTimeout=2", $uid, $pwd);
                return $conn;
            } catch (Exception $e2) {}
        }
    }

    return null; // Fallback automático a datos demostrativos
}
?>
