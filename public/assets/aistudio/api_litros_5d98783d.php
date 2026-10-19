<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display in output, will use json

// Configuration
$serverName = "172.16.60.12\\SQLSVR";
$connectionOptions = array(
    "Database" => "VentasYCobranzaCYSA",
    "Uid" => "sa",
    "PWD" => "D1mens1on",
    "CharacterSet" => "UTF-8"
);

// Connect to SQL Server
$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    $errors = sqlsrv_errors();
    die(json_encode(array(
        "error" => "Error de conexión a la base de datos",
        "details" => $errors
    )));
}

// Get cityCode parameter
$cityCode = isset($_GET['cityCode']) ? preg_replace('/[^0-9]/', '', $_GET['cityCode']) : null;

// Query - Optimizado para solo traer datos del día actual
$sql = "SELECT
            R.Ciudad,
            P.Familia,
            f.Nombre AS NombreFamilia,
            CAST(
                ISNULL(
                    SUM(
                        CASE 
                            WHEN R.Ciudad IS NOT NULL 
                            THEN (DET.Unidades * ISNULL(P.Factor, 1)) 
                            ELSE 0 
                        END
                    ), 0
                ) AS FLOAT
            ) AS Litros
        FROM VwMovimientosMov DET
        INNER JOIN Productos P ON DET.Producto = P.Producto
        INNER JOIN Familias f ON f.Familia = P.Familia
        INNER JOIN VwMovimientos ENC ON ENC.Folio = DET.Folio
        INNER JOIN Rutas R ON R.Ruta = ENC.Ruta AND ENC.Almacen = R.Almacen
        WHERE
            ENC.Fecha >= CAST(GETDATE() AS DATE)
            AND ENC.Fecha < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
            AND ENC.Ruta NOT IN (50, 151)
            AND P.SeUsa = '1'
            AND R.Ciudad IS NOT NULL";

if ($cityCode) {
    $sql .= " AND R.Ciudad = " . intval($cityCode);
}

$sql .= "
            AND P.Familia NOT IN ('17', '98', '99')
        GROUP BY
            R.Ciudad,
            P.Familia,
            f.Nombre
        ORDER BY
            Litros DESC";

$params = array();
$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    $errors = sqlsrv_errors();
    sqlsrv_close($conn);
    die(json_encode(array(
        "error" => "Error en la consulta SQL",
        "details" => $errors,
        "query_info" => array("cityCode" => $cityCode)
    )));
}

$data = array();
$cities = array(
    1 => "Obregon",
    2 => "Hermosillo",
    3 => "Navojoa",
    4 => "Nogales",
    5 => "Caborca",
    6 => "Guaymas"
);

$rowCount = 0;
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $rowCount++;
    $cityId = $row['Ciudad'];
    
    // Skip if city is null or not in our list
    if ($cityId === null || !isset($cities[$cityId])) {
        continue;
    }
    
    $cityName = $cities[$cityId];
    
    if (!isset($data[$cityName])) {
        $data[$cityName] = array();
    }
    
    $data[$cityName][] = array(
        'familia' => $row['Familia'],
        'nombre' => $row['NombreFamilia'],
        'litros' => floatval($row['Litros'])
    );
}

sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);

// Add metadata for debugging
$response = array(
    'success' => true,
    'data' => $data,
    'meta' => array(
        'rows_found' => $rowCount,
        'date_info' => 'Hoy desde 00:00 hasta 23:59',
        'timestamp' => date('Y-m-d H:i:s')
    )
);

echo json_encode($response);
?>
