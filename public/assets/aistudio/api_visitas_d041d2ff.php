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
    die(json_encode(array("error" => sqlsrv_errors())));
}

// Query
$cityCode = isset($_GET['cityCode']) ? preg_replace('/[^0-9]/', '', $_GET['cityCode']) : null;
$sql = "WITH Dia AS (
    SELECT DATENAME(WEEKDAY, GETDATE()) AS NombreDia
)
SELECT 
    CASE 
        WHEN LEFT(s.Ruta, 1) = '1' THEN 'Obregon'
        WHEN LEFT(s.Ruta, 1) = '2' THEN 'Hermosillo'
        WHEN LEFT(s.Ruta, 1) = '3' THEN 'Navojoa'
        WHEN LEFT(s.Ruta, 1) = '4' THEN 'Nogales'
        WHEN LEFT(s.Ruta, 1) = '5' THEN 'Caborca'
        WHEN LEFT(s.Ruta, 1) = '6' THEN 'Guaymas'
        ELSE 'Otra Ciudad'
    END AS Ciudad,
    COUNT(DISTINCT CASE WHEN v.Tipo = 'V' THEN v.IDRemision END) AS Ventas,
    COUNT(DISTINCT CASE WHEN v.Tipo = 'C' THEN v.IDRemision END) AS Visitas,
    -- Clientes del Día: calculado sin depender de VentasApp
    (SELECT COUNT(*) 
     FROM Sucursales s2
     CROSS JOIN Dia d
     WHERE s2.SeUsa = 1 
       AND s2.Ruta <> '50'
       AND LEFT(s2.Ruta,1) = LEFT(s.Ruta,1)
       AND (
            (d.NombreDia = 'Monday'    AND s2.Lun = 1) OR
            (d.NombreDia = 'Tuesday'   AND s2.Mar = 1) OR
            (d.NombreDia = 'Wednesday' AND s2.Mie = 1) OR
            (d.NombreDia = 'Thursday'  AND s2.Jue = 1) OR
            (d.NombreDia = 'Friday'    AND s2.Vie = 1) OR
            (d.NombreDia = 'Saturday'  AND s2.Sab = 1)
       )
    ) AS ClientesDelDia,
    -- Clientes Activos
    (SELECT COUNT(*) 
     FROM Sucursales s2
     WHERE s2.SeUsa = 1 
       AND s2.Ruta <> '50'
       AND LEFT(s2.Ruta,1) = LEFT(s.Ruta,1)
    ) AS ClientesActivos,
    -- Clientes Totales
    (SELECT COUNT(*) 
     FROM Sucursales s3
     WHERE s3.Ruta <> '50'
       AND LEFT(s3.Ruta,1) = LEFT(s.Ruta,1)
    ) AS ClientesTotales
FROM VentasApp v
INNER JOIN Sucursales s ON s.Sucursal = v.Sucursal
CROSS JOIN Dia d
WHERE v.Cancelado = '0'
  AND CONVERT(date, v.Fecha) = CONVERT(date, GETDATE())";

if ($cityCode) {
        $sql .= " AND LEFT(s.Ruta,1) = '" . $cityCode . "'";
}

$sql .= "
GROUP BY 
    CASE 
        WHEN LEFT(s.Ruta, 1) = '1' THEN 'Obregon'
        WHEN LEFT(s.Ruta, 1) = '2' THEN 'Hermosillo'
        WHEN LEFT(s.Ruta, 1) = '3' THEN 'Navojoa'
        WHEN LEFT(s.Ruta, 1) = '4' THEN 'Nogales'
        WHEN LEFT(s.Ruta, 1) = '5' THEN 'Caborca'
        WHEN LEFT(s.Ruta, 1) = '6' THEN 'Guaymas'
        ELSE 'Otra Ciudad'
    END,
    LEFT(s.Ruta,1)";

$stmt = sqlsrv_query($conn, $sql);

if ($stmt === false) {
    die(json_encode(array("error" => sqlsrv_errors())));
}

$data = array();

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $ciudad = $row['Ciudad'];
    
    if ($ciudad !== 'Otra Ciudad') {
        $clientesDelDia = (int)$row['ClientesDelDia'];
        $ventas = (int)$row['Ventas'];
        $visitas = (int)$row['Visitas'];
        $efectividadVentas = $clientesDelDia > 0 ? ($ventas / $clientesDelDia) * 100 : 0;
        $coberturaVisitas = $clientesDelDia > 0 ? ($visitas / $clientesDelDia) * 100 : 0;
            
        $data[$ciudad] = array(
            'ventas' => $ventas,
            'visitas' => $visitas,
            'clientesDelDia' => $clientesDelDia,
            'clientesActivos' => (int)$row['ClientesActivos'],
            'clientesTotales' => (int)$row['ClientesTotales'],
            'efectividadVentas' => round($efectividadVentas, 1),
            'coberturaVisitas' => round($coberturaVisitas, 1)
        );
    }
}

sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);

echo json_encode($data);
?>
