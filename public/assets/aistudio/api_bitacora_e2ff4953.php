<?php
header('Content-Type: application/json; charset=utf-8');
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
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión',
        'details' => sqlsrv_errors()
    ]);
    exit;
}

$date = new DateTime('now', new DateTimeZone('America/Mexico_City'));
$targetDate = $date->format('Y-m-d');

$sql = "
    WITH FiltroRegistros AS (
        SELECT
            r.Ruta,
            r.Licencia,
            r.HoraSalida,
            r.OdometroRegreso,
            r.Odometro,
            r.Temperatura,
            r.TemperaturaRegreso,
            r.Observaciones,
            l.HoraGuardado,
            l.HoraIngreso,
            l.HoraCierre,
            ROW_NUMBER() OVER (
                PARTITION BY r.Ruta, CAST(r.HoraSalida AS DATE) 
                ORDER BY r.HoraSalida DESC
            ) AS numF
        FROM 
            RegistroEntradaSalida AS r
            LEFT OUTER JOIN Liquidaciones AS l 
                ON r.Ruta = l.Ruta 
                AND CAST(r.HoraSalida AS DATE) = CAST(l.Fecha AS DATE)
        WHERE
            CAST(r.HoraSalida AS DATE) = ?
    )
    SELECT
        r.Ruta,
        CASE WHEN LEN(r.Licencia) < 12 THEN 'Sin Licencia' ELSE 'Con Licencia' END AS TieneLic,
        r.HoraSalida,
        r.OdometroRegreso - r.Odometro AS KmRecorrido,
        r.Temperatura AS TemSalida,
        r.TemperaturaRegreso AS TemRegreso,
        r.HoraGuardado AS EnAlmacen,
        r.HoraIngreso AS EnCaja,
        r.HoraCierre AS HoraLiquidacion,
        r.Observaciones
    FROM 
        FiltroRegistros r
    WHERE 
        r.numF = 1  
    ORDER BY 
        r.Ruta, r.HoraSalida;
";

$params = array($targetDate);
$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    echo json_encode([
        'success' => false,
        'error' => 'Error en consulta',
        'details' => sqlsrv_errors()
    ]);
    sqlsrv_close($conn);
    exit;
}

$rows = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $rows[] = [
        'ruta' => isset($row['Ruta']) ? (int)$row['Ruta'] : null,
        'tieneLic' => $row['TieneLic'] ?? null,
        'horaSalida' => isset($row['HoraSalida']) && $row['HoraSalida'] instanceof DateTime ? $row['HoraSalida']->format('Y-m-d H:i:s') : null,
        'kmRecorrido' => isset($row['KmRecorrido']) ? (float)$row['KmRecorrido'] : null,
        'temSalida' => isset($row['TemSalida']) ? (float)$row['TemSalida'] : null,
        'temRegreso' => isset($row['TemRegreso']) ? (float)$row['TemRegreso'] : null,
        'enAlmacen' => isset($row['EnAlmacen']) && $row['EnAlmacen'] instanceof DateTime ? $row['EnAlmacen']->format('Y-m-d H:i:s') : null,
        'enCaja' => isset($row['EnCaja']) && $row['EnCaja'] instanceof DateTime ? $row['EnCaja']->format('Y-m-d H:i:s') : null,
        'horaLiquidacion' => isset($row['HoraLiquidacion']) && $row['HoraLiquidacion'] instanceof DateTime ? $row['HoraLiquidacion']->format('Y-m-d H:i:s') : null,
        'observaciones' => $row['Observaciones'] ?? ''
    ];
}

sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);

echo json_encode([
    'success' => true,
    'data' => $rows,
    'meta' => [
        'fecha_objetivo' => $targetDate,
        'total_registros' => count($rows),
        'timestamp' => date('Y-m-d H:i:s')
    ]
], JSON_UNESCAPED_UNICODE);
