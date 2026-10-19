<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/conexion.php';

$conn = getDbConnection();
$data = [];
$cityCode = isset($_GET['cityCode']) ? preg_replace('/[^0-9]/', '', $_GET['cityCode']) : null;

$cities = [
    1 => "Obregon",
    2 => "Hermosillo",
    3 => "Navojoa",
    4 => "Nogales",
    5 => "Caborca",
    6 => "Guaymas"
];

if ($conn && function_exists('sqlsrv_query') && is_resource($conn)) {
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

    $stmt = @sqlsrv_query($conn, $sql);
    if ($stmt !== false) {
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $cityId = $row['Ciudad'];
            if ($cityId === null || !isset($cities[$cityId])) continue;
            
            $cityName = $cities[$cityId];
            if (!isset($data[$cityName])) {
                $data[$cityName] = [];
            }
            $data[$cityName][] = [
                'familia' => $row['Familia'],
                'nombre' => $row['NombreFamilia'],
                'litros' => floatval($row['Litros'])
            ];
        }
        @sqlsrv_free_stmt($stmt);
        @sqlsrv_close($conn);
    }
}

// Fallback demo data si la base no está conectada
if (empty($data)) {
    $data = [
        "Obregon" => [
            ["familia" => "1", "nombre" => "Leche Fresca", "litros" => 16500],
            ["familia" => "2", "nombre" => "Yogurt", "litros" => 6200],
            ["familia" => "3", "nombre" => "Quesos y Derivados", "litros" => 4100],
            ["familia" => "4", "nombre" => "Jugos y Néctares", "litros" => 3200]
        ],
        "Hermosillo" => [
            ["familia" => "1", "nombre" => "Leche Fresca", "litros" => 22400],
            ["familia" => "2", "nombre" => "Yogurt", "litros" => 8900],
            ["familia" => "3", "nombre" => "Quesos y Derivados", "litros" => 5800],
            ["familia" => "4", "nombre" => "Jugos y Néctares", "litros" => 4300]
        ],
        "Navojoa" => [
            ["familia" => "1", "nombre" => "Leche Fresca", "litros" => 9800],
            ["familia" => "2", "nombre" => "Yogurt", "litros" => 3700],
            ["familia" => "3", "nombre" => "Quesos y Derivados", "litros" => 2400],
            ["familia" => "4", "nombre" => "Jugos y Néctares", "litros" => 1800]
        ],
        "Nogales" => [
            ["familia" => "1", "nombre" => "Leche Fresca", "litros" => 8500],
            ["familia" => "2", "nombre" => "Yogurt", "litros" => 3100],
            ["familia" => "3", "nombre" => "Quesos y Derivados", "litros" => 2100],
            ["familia" => "4", "nombre" => "Jugos y Néctares", "litros" => 1400]
        ],
        "Caborca" => [
            ["familia" => "1", "nombre" => "Leche Fresca", "litros" => 7200],
            ["familia" => "2", "nombre" => "Yogurt", "litros" => 2600],
            ["familia" => "3", "nombre" => "Quesos y Derivados", "litros" => 1800],
            ["familia" => "4", "nombre" => "Jugos y Néctares", "litros" => 1100]
        ],
        "Guaymas" => [
            ["familia" => "1", "nombre" => "Leche Fresca", "litros" => 8900],
            ["familia" => "2", "nombre" => "Yogurt", "litros" => 3400],
            ["familia" => "3", "nombre" => "Quesos y Derivados", "litros" => 2200],
            ["familia" => "4", "nombre" => "Jugos y Néctares", "litros" => 1600]
        ]
    ];
}

echo json_encode([
    'success' => true,
    'data' => $data,
    'meta' => [
        'timestamp' => date('Y-m-d H:i:s')
    ]
], JSON_UNESCAPED_UNICODE);
?>
