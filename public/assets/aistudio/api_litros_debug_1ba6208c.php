<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$serverName = "172.16.60.12\\SQLSVR";
$connectionOptions = array(
    "Database" => "VentasYCobranzaCYSA",
    "Uid" => "sa",
    "PWD" => "D1mens1on",
    "CharacterSet" => "UTF-8"
);

$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    die(json_encode(array("error" => "Conexión fallida", "details" => sqlsrv_errors())));
}

$todayStart = date('Ymd') . ' 00:00:00.000';
$todayEnd = date('Ymd') . ' 23:59:59.000';

$diagnostics = array();

// Test 1: Check if VwMovimientos has data for today
$sql1 = "SELECT COUNT(*) as Total FROM VwMovimientos WHERE fecha >= ? AND fecha <= ?";
$stmt1 = sqlsrv_query($conn, $sql1, array($todayStart, $todayEnd));
if ($stmt1 && $row = sqlsrv_fetch_array($stmt1, SQLSRV_FETCH_ASSOC)) {
    $diagnostics['movimientos_hoy'] = $row['Total'];
}

// Test 2: Check with tipo = '1'
$sql2 = "SELECT COUNT(*) as Total FROM VwMovimientos WHERE fecha >= ? AND fecha <= ? AND tipo = '1'";
$stmt2 = sqlsrv_query($conn, $sql2, array($todayStart, $todayEnd));
if ($stmt2 && $row = sqlsrv_fetch_array($stmt2, SQLSRV_FETCH_ASSOC)) {
    $diagnostics['movimientos_tipo1'] = $row['Total'];
}

// Test 2b: Check what tipos exist today
$sql2b = "SELECT tipo, COUNT(*) as Total FROM VwMovimientos WHERE fecha >= ? AND fecha <= ? GROUP BY tipo";
$stmt2b = sqlsrv_query($conn, $sql2b, array($todayStart, $todayEnd));
$tipos_hoy = array();
if ($stmt2b) {
    while ($row = sqlsrv_fetch_array($stmt2b, SQLSRV_FETCH_ASSOC)) {
        $tipos_hoy[] = $row;
    }
}
$diagnostics['tipos_disponibles_hoy'] = $tipos_hoy;

// Test 3: Check with ruta filter
$sql3 = "SELECT COUNT(*) as Total FROM VwMovimientos WHERE fecha >= ? AND fecha <= ? AND tipo = '1' AND ruta not in('50')";
$stmt3 = sqlsrv_query($conn, $sql3, array($todayStart, $todayEnd));
if ($stmt3 && $row = sqlsrv_fetch_array($stmt3, SQLSRV_FETCH_ASSOC)) {
    $diagnostics['movimientos_sin_ruta50'] = $row['Total'];
}

// Test 4: Check Rutas table
$sql4 = "SELECT TOP 10 Ruta, Ciudad, Almacen FROM Rutas WHERE Ciudad IS NOT NULL";
$stmt4 = sqlsrv_query($conn, $sql4);
$rutas_sample = array();
if ($stmt4) {
    while ($row = sqlsrv_fetch_array($stmt4, SQLSRV_FETCH_ASSOC)) {
        $rutas_sample[] = $row;
    }
}
$diagnostics['rutas_sample'] = $rutas_sample;

// Test 5: Check if there's data with different date (last 7 days)
$lastWeek = date('Ymd', strtotime('-7 days')) . ' 00:00:00.000';
$sql5 = "SELECT COUNT(*) as Total FROM VwMovimientos WHERE fecha >= ? AND fecha <= ? AND tipo = '1'";
$stmt5 = sqlsrv_query($conn, $sql5, array($lastWeek, $todayEnd));
if ($stmt5 && $row = sqlsrv_fetch_array($stmt5, SQLSRV_FETCH_ASSOC)) {
    $diagnostics['movimientos_ultima_semana'] = $row['Total'];
}

// Test 6: Try simplified query without FULL JOIN
$sql6 = "SELECT TOP 5
            R.Ciudad,
            R.Ruta,
            ENC.Folio,
            ENC.Fecha,
            ENC.Tipo
        FROM VwMovimientos ENC
        INNER JOIN Rutas R ON R.Ruta = ENC.Ruta AND ENC.Almacen = R.Almacen
        WHERE ENC.fecha >= ? 
            AND ENC.fecha <= ?
            AND enc.tipo = '1'
            AND enc.ruta not in('50')
            AND R.Ciudad IS NOT NULL
        ORDER BY ENC.Fecha DESC";
$stmt6 = sqlsrv_query($conn, $sql6, array($todayStart, $todayEnd));
$sample_records = array();
if ($stmt6) {
    while ($row = sqlsrv_fetch_array($stmt6, SQLSRV_FETCH_ASSOC)) {
        // Convert datetime to string
        if ($row['Fecha'] instanceof DateTime) {
            $row['Fecha'] = $row['Fecha']->format('Y-m-d H:i:s');
        }
        $sample_records[] = $row;
    }
}
$diagnostics['sample_records'] = $sample_records;

sqlsrv_close($conn);

echo json_encode(array(
    'diagnostics' => $diagnostics,
    'date_range' => array('start' => $todayStart, 'end' => $todayEnd),
    'server_time' => date('Y-m-d H:i:s')
));
?>
