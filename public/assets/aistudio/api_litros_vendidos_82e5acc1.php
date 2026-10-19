<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

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
    die(json_encode(array("error" => "Error de conexión", "details" => sqlsrv_errors())));
}

// Query
$cityCode = isset($_GET['cityCode']) ? preg_replace('/[^0-9]/', '', $_GET['cityCode']) : null;
$sql = "SELECT
    DET.Ciudad,
    DET.Familia,
    DET.NOMFAM AS familiaNombre,
    CAST(SUM(DET.Unidades * DET.Factor) AS FLOAT) AS total
FROM VwEstadisticadeVentas AS DET
INNER JOIN Rutas AS RUT ON RUT.Ruta = DET.Ruta
WHERE DET.Tipo = 'V'
  AND DET.Ruta NOT IN (50, 151)
  AND CONVERT(date, DET.Fecha) = CONVERT(date, GETDATE())
  AND DET.Ciudad IN (1, 2, 3, 4, 5, 6)";
if ($cityCode) {
    $sql .= " AND DET.Ciudad = " . intval($cityCode);
}
$sql .= "
GROUP BY DET.Ciudad, DET.Familia, DET.NOMFAM
ORDER BY SUM(DET.Unidades * DET.Factor) DESC";

$stmt = sqlsrv_query($conn, $sql);

if ($stmt === false) {
    die(json_encode(array("error" => "Error en consulta", "details" => sqlsrv_errors())));
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
    
    if (!isset($cities[$cityId])) continue;
    
    $cityName = $cities[$cityId];
    
    if (!isset($data[$cityName])) {
        $data[$cityName] = array();
    }
    
    $data[$cityName][] = array(
        'familia' => $row['Familia'],
        'nombre' => $row['familiaNombre'],
        'litros' => floatval($row['total'])
    );
}

sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);

$response = array(
    'success' => true,
    'data' => $data,
    'meta' => array(
        'rows_found' => $rowCount,
        'timestamp' => date('Y-m-d H:i:s')
    )
);

echo json_encode($response);
?>
