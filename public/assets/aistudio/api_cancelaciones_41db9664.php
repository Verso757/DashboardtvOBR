<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Configuración de la base de datos
$serverName = "172.16.60.12\\SQLSVR";
$database = "VentasYCobranzaCYSA";
$uid = "sa";
$pwd = "D1mens1on";

$connectionOptions = array(
    "Database" => $database,
    "Uid" => $uid,
    "PWD" => $pwd,
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

// Query para cancelaciones por ciudad (última semana)
$queryCiudades = "
    SELECT
        v.Ciudad, 
        c.Nombre as NomCiudad, 
        v.Tipo,
        CAST(v.Fecha AS DATE) AS Fecha,
        SUM(CASE WHEN v.Cancelado = 0 THEN 1 ELSE 0 END) AS TotalActivos,
        SUM(CASE WHEN v.Cancelado = 1 THEN 1 ELSE 0 END) AS TotalCancelados
    FROM 
        VentasApp AS v
        INNER JOIN Vendedores AS e ON v.Vendedor = e.Vendedor
        INNER JOIN Vendedores AS a ON v.Ayudante = a.Vendedor
        INNER JOIN Ciudades AS c on v.Ciudad = c.Ciudad
    WHERE 
        v.Fecha >= DATEADD(day, -7, GETDATE())
        AND v.Ciudad IN (1, 2, 3)
    GROUP BY
        CAST(v.Fecha AS DATE), v.Ciudad, c.Nombre, v.Tipo
    ORDER BY
        Fecha DESC, v.Ciudad
";

// Query para cancelaciones por ruta (hoy) - SIN FILTRO para obtener todas las ciudades
$queryRutas = "
    SELECT
        v.Ruta,
        SUM(CASE WHEN v.Cancelado = 0 THEN 1 ELSE 0 END) AS TotalActivos,
        SUM(CASE WHEN v.Cancelado = 1 THEN 1 ELSE 0 END) AS TotalCancelados
    FROM 
        VentasApp AS v
        INNER JOIN Vendedores AS e ON v.Vendedor = e.Vendedor
        INNER JOIN Vendedores AS a ON v.Ayudante = a.Vendedor
    WHERE 
        v.Fecha >= CAST(GETDATE() AS DATE)
    GROUP BY v.Ruta
    HAVING SUM(CASE WHEN v.Cancelado = 0 THEN 1 ELSE 0 END) + SUM(CASE WHEN v.Cancelado = 1 THEN 1 ELSE 0 END) > 0
    ORDER BY TotalCancelados DESC, TotalActivos DESC
";

$result = [];

// Ejecutar query de ciudades
$stmtCiudades = sqlsrv_query($conn, $queryCiudades);
if ($stmtCiudades === false) {
    echo json_encode([
        'success' => false,
        'error' => 'Error en query ciudades',
        'details' => sqlsrv_errors()
    ]);
    sqlsrv_close($conn);
    exit;
}

$ciudadesData = [];
while ($row = sqlsrv_fetch_array($stmtCiudades, SQLSRV_FETCH_ASSOC)) {
    $ciudadesData[] = [
        'ciudad' => (int)$row['Ciudad'],
        'nombreCiudad' => $row['NomCiudad'],
        'tipo' => $row['Tipo'],
        'fecha' => $row['Fecha']->format('Y-m-d'),
        'activos' => (int)$row['TotalActivos'],
        'cancelados' => (int)$row['TotalCancelados']
    ];
}

// Ejecutar query de rutas
$stmtRutas = sqlsrv_query($conn, $queryRutas);
if ($stmtRutas === false) {
    echo json_encode([
        'success' => false,
        'error' => 'Error en query rutas',
        'details' => sqlsrv_errors()
    ]);
    sqlsrv_close($conn);
    exit;
}

$rutasData = [];
while ($row = sqlsrv_fetch_array($stmtRutas, SQLSRV_FETCH_ASSOC)) {
    $ruta = (int)$row['Ruta'];
    $rutasData[] = [
        'ruta' => $ruta,
        'activos' => (int)$row['TotalActivos'],
        'cancelados' => (int)$row['TotalCancelados']
    ];
}

// Agrupar ciudades por ciudad y tipo para totales
$totalesPorCiudad = [];
foreach ($ciudadesData as $item) {
    $ciudad = $item['nombreCiudad'];
    $tipo = $item['tipo'];
    
    if (!isset($totalesPorCiudad[$ciudad])) {
        $totalesPorCiudad[$ciudad] = [];
    }
    
    if (!isset($totalesPorCiudad[$ciudad][$tipo])) {
        $totalesPorCiudad[$ciudad][$tipo] = [
            'activos' => 0,
            'cancelados' => 0
        ];
    }
    
    $totalesPorCiudad[$ciudad][$tipo]['activos'] += $item['activos'];
    $totalesPorCiudad[$ciudad][$tipo]['cancelados'] += $item['cancelados'];
}

// Agrupar rutas por ciudad según primer dígito de ruta (Top 10)
$rutasPorCiudad = [
    'Obregon' => [],
    'Hermosillo' => [],
    'Navojoa' => [],
    'Nogales' => [],
    'Caborca' => [],
    'Guaymas' => []
];

foreach ($rutasData as $item) {
    $rutaStr = (string)$item['ruta'];
    if (strlen($rutaStr) > 0) {
        $primerDigito = $rutaStr[0];
        // Mapeo de primer dígito de ruta a ciudad
        if ($primerDigito === '1') {
            $rutasPorCiudad['Obregon'][] = $item;
        } elseif ($primerDigito === '2') {
            $rutasPorCiudad['Hermosillo'][] = $item;
        } elseif ($primerDigito === '3') {
            $rutasPorCiudad['Navojoa'][] = $item;
        } elseif ($primerDigito === '4') {
            $rutasPorCiudad['Nogales'][] = $item;
        } elseif ($primerDigito === '5') {
            $rutasPorCiudad['Caborca'][] = $item;
        } elseif ($primerDigito === '6') {
            $rutasPorCiudad['Guaymas'][] = $item;
        }
    }
}

// Limitar a top 10 por ciudad y agregar debug
$debugRutas = [];
foreach ($rutasPorCiudad as $ciudad => &$rutas) {
    $debugRutas[$ciudad] = count($rutas);
    usort($rutas, function($a, $b) {
        return $b['cancelados'] - $a['cancelados'];
    });
    $rutas = array_slice($rutas, 0, 10);
}

sqlsrv_close($conn);

echo json_encode([
    'success' => true,
    'data' => [
        'ciudades' => $totalesPorCiudad,
        'ciudadesDetalle' => $ciudadesData,
        'rutas' => $rutasPorCiudad
    ],
    'meta' => [
        'timestamp' => date('Y-m-d H:i:s'),
        'registros_ciudades' => count($ciudadesData),
        'registros_rutas' => count($rutasData),
        'debug_rutas_por_ciudad' => $debugRutas
    ]
], JSON_UNESCAPED_UNICODE);
?>
